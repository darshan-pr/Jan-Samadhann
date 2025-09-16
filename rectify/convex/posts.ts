import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPost = mutation({
  args: {
    userId: v.id("users"),
    description: v.string(),
    issueType: v.string(),
    customIssueType: v.optional(v.string()),
    city: v.string(),
    address: v.string(),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("posts", {
      userId: args.userId,
      description: args.description,
      issueType: args.issueType,
      customIssueType: args.customIssueType,
      city: args.city,
      address: args.address,
      coordinates: args.coordinates,
      status: "submitted",
      priority: args.priority,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      dislikes: 0,
      reposts: 0,
      bookmarks: 0,
      likedBy: [],
      votedBy: [],
    });
  },
});

export const getAllPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const photos = await ctx.db
          .query("photos")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        const photosWithUrls = await Promise.all(
          photos.map(async (photo) => {
            const url = await ctx.storage.getUrl(photo.fileId);
            return { ...photo, url };
          })
        );

        return {
          ...post,
          user: user ? { name: user.name, phone: user.phone } : null,
          photos: photosWithUrls,
        };
      })
    );

    return postsWithUserInfo;
  },
});

export const getPostsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const postsWithPhotos = await Promise.all(
      posts.map(async (post) => {
        const photos = await ctx.db
          .query("photos")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        const photosWithUrls = await Promise.all(
          photos.map(async (photo) => {
            const url = await ctx.storage.getUrl(photo.fileId);
            return { ...photo, url };
          })
        );

        return { ...post, photos: photosWithUrls };
      })
    );

    return postsWithPhotos;
  },
});

export const likePost = mutation({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if user already liked
    const existingLike = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", "like")
      )
      .first();

    // Check if user already disliked
    const existingDislike = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", "dislike")
      )
      .first();

    if (existingLike) {
      // User already liked, remove like (unlike)
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, {
        likes: Math.max(0, post.likes - 1),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Like removed" };
    } else {
      // Remove dislike if exists, then add like
      if (existingDislike) {
        await ctx.db.delete(existingDislike._id);
        await ctx.db.patch(args.postId, {
          dislikes: Math.max(0, (post.dislikes || 0) - 1),
        });
      }
      
      // Add like
      await ctx.db.insert("userVotes", {
        userId: args.userId,
        postId: args.postId,
        type: "like",
        createdAt: new Date().toISOString(),
      });
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Like added" };
    }
  },
});

export const dislikePost = mutation({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if user already disliked
    const existingDislike = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", "dislike")
      )
      .first();

    // Check if user already liked
    const existingLike = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", "like")
      )
      .first();

    if (existingDislike) {
      // User already disliked, remove dislike
      await ctx.db.delete(existingDislike._id);
      await ctx.db.patch(args.postId, {
        dislikes: Math.max(0, (post.dislikes || 0) - 1),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Dislike removed" };
    } else {
      // Remove like if exists, then add dislike
      if (existingLike) {
        await ctx.db.delete(existingLike._id);
        await ctx.db.patch(args.postId, {
          likes: Math.max(0, post.likes - 1),
        });
      }
      
      // Add dislike
      await ctx.db.insert("userVotes", {
        userId: args.userId,
        postId: args.postId,
        type: "dislike",
        createdAt: new Date().toISOString(),
      });
      await ctx.db.patch(args.postId, {
        dislikes: (post.dislikes || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Dislike added" };
    }
  },
});

export const repostPost = mutation({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if user already reposted
    const existingRepost = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", "repost")
      )
      .first();

    if (existingRepost) {
      // User already reposted, do nothing (prevent duplicate reposts)
      return { success: false, message: "Already reposted" };
    } else {
      // Add repost
      await ctx.db.insert("userVotes", {
        userId: args.userId,
        postId: args.postId,
        type: "repost",
        createdAt: new Date().toISOString(),
      });
      await ctx.db.patch(args.postId, {
        reposts: post.reposts + 1,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Reposted" };
    }
  },
});

export const bookmarkPost = mutation({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if user already bookmarked
    const existingBookmark = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", "bookmark")
      )
      .first();

    if (existingBookmark) {
      // Remove bookmark
      await ctx.db.delete(existingBookmark._id);
      await ctx.db.patch(args.postId, {
        bookmarks: Math.max(0, post.bookmarks - 1),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Bookmark removed" };
    } else {
      // Add bookmark
      await ctx.db.insert("userVotes", {
        userId: args.userId,
        postId: args.postId,
        type: "bookmark",
        createdAt: new Date().toISOString(),
      });
      await ctx.db.patch(args.postId, {
        bookmarks: post.bookmarks + 1,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Bookmarked" };
    }
  },
});

export const getUserVoteStatus = query({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .collect();

    const voteStatus = {
      hasLiked: false,
      hasDisliked: false,
      hasReposted: false,
      hasBookmarked: false
    };

    votes.forEach(vote => {
      if (vote.type === "like") voteStatus.hasLiked = true;
      if (vote.type === "dislike") voteStatus.hasDisliked = true;
      if (vote.type === "repost") voteStatus.hasReposted = true;
      if (vote.type === "bookmark") voteStatus.hasBookmarked = true;
    });

    return voteStatus;
  },
});

export const getPostsWithHighVotes = query({
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_likes")
      .order("desc")
      .filter((q) => q.gte(q.field("likes"), 2))
      .collect();

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const photos = await ctx.db
          .query("photos")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        const photosWithUrls = await Promise.all(
          photos.map(async (photo) => {
            const url = await ctx.storage.getUrl(photo.fileId);
            return { ...photo, url };
          })
        );

        return {
          ...post,
          user: user ? { name: user.name, phone: user.phone } : null,
          photos: photosWithUrls,
        };
      })
    );

    return postsWithUserInfo;
  },
});

export const getUserVote = query({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("dislike"), v.literal("repost"), v.literal("bookmark"))
  },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("userVotes")
      .withIndex("by_user_post_type", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId).eq("type", args.type)
      )
      .first();
    
    return !!vote;
  },
});

export const updatePostStatus = mutation({
  args: {
    postId: v.id("posts"),
    status: v.union(
      v.literal("submitted"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    adminId: v.optional(v.id("admins")),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const oldStatus = post.status;

    // Update post status
    await ctx.db.patch(args.postId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    // Award points when post gets resolved (approved)
    if (args.status === "resolved" && oldStatus !== "resolved") {
      const user = await ctx.db.get(post.userId);
      if (user) {
        const pointsToAward = 50; // Base points for resolved post
        const priorityBonus = post.priority === "high" ? 25 : post.priority === "medium" ? 15 : 10;
        const totalPoints = pointsToAward + priorityBonus;

        const currentPoints = user.points || 0;
        const newPoints = currentPoints + totalPoints;

        // Update user's total points
        await ctx.db.patch(post.userId, { points: newPoints });

        // Create points transaction record
        await ctx.db.insert("pointsTransactions", {
          userId: post.userId,
          points: totalPoints,
          type: "earned",
          reason: `Post resolved: ${post.issueType} (${post.priority} priority)`,
          postId: args.postId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Create notification if admin is provided and status actually changed
    if (args.adminId && oldStatus !== args.status) {
      const statusMessages = {
        submitted: "Your post has been submitted for review",
        in_progress: "Your post is now being addressed by our team",
        resolved: "Great news! Your reported issue has been resolved and you've earned Rectify Points!",
        rejected: "Your post has been reviewed but cannot be processed at this time"
      };

      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "status_update",
        postId: args.postId,
        fromAdminId: args.adminId,
        title: `Post Status Updated`,
        message: statusMessages[args.status],
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  },
});