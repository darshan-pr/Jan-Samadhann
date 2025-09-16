import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Allow multiple comments from the same user
    return await ctx.db.insert("comments", {
      postId: args.postId,
      userId: args.userId,
      text: args.text,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getUserComment = query({
  args: { 
    postId: v.id("posts"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db
      .query("comments")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();
    
    return comment;
  },
});

export const addAdminComment = mutation({
  args: {
    postId: v.id("posts"),
    adminId: v.id("admins"),
    text: v.string(),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      adminId: args.adminId,
      text: args.text,
      isPinned: args.isPinned || false,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create notification for the post author with actual comment text
    await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "admin_comment",
      postId: args.postId,
      commentId,
      fromAdminId: args.adminId,
      title: "Admin Response",
      message: args.text, // Store the actual comment text
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return commentId;
  },
});

export const getPostComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    const commentsWithUserInfo = await Promise.all(
      comments.map(async (comment) => {
        let author = null;
        if (comment.userId) {
          const user = await ctx.db.get(comment.userId);
          author = user ? { name: user.name, phone: user.phone, type: "user" } : null;
        } else if (comment.adminId) {
          const admin = await ctx.db.get(comment.adminId);
          author = admin ? { name: "Admin", email: admin.email, type: "admin" } : null;
        }

        return {
          ...comment,
          author,
        };
      })
    );

    // Sort to show pinned comments first
    return commentsWithUserInfo.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },
});

export const likeComment = mutation({
  args: { 
    commentId: v.id("comments"),
    userId: v.optional(v.id("users")),
    adminId: v.optional(v.id("admins"))
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    // Check if user already liked this comment
    let existingLike;
    if (args.userId) {
      existingLike = await ctx.db
        .query("commentLikes")
        .withIndex("by_user_comment", (q) => 
          q.eq("userId", args.userId).eq("commentId", args.commentId)
        )
        .first();
    } else if (args.adminId) {
      existingLike = await ctx.db
        .query("commentLikes")
        .withIndex("by_admin_comment", (q) => 
          q.eq("adminId", args.adminId).eq("commentId", args.commentId)
        )
        .first();
    }

    if (existingLike) {
      // User already liked, do nothing (prevent duplicate likes)
      return { success: false, message: "Already liked" };
    } else {
      // Add like
      await ctx.db.insert("commentLikes", {
        commentId: args.commentId,
        userId: args.userId,
        adminId: args.adminId,
        createdAt: new Date().toISOString(),
      });
      
      await ctx.db.patch(args.commentId, {
        likes: comment.likes + 1,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true, message: "Like added" };
    }
  },
});

export const pinComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    await ctx.db.patch(args.commentId, {
      isPinned: !comment.isPinned,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const editComment = mutation({
  args: { 
    commentId: v.id("comments"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    await ctx.db.patch(args.commentId, {
      text: args.text,
      updatedAt: new Date().toISOString(),
    });
  },
});