import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("status_update"),
      v.literal("admin_comment"),
      v.literal("like"),
      v.literal("reply"),
      v.literal("mention"),
      v.literal("repost")
    ),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    fromUserId: v.optional(v.id("users")),
    fromAdminId: v.optional(v.id("admins")),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      postId: args.postId,
      commentId: args.commentId,
      fromUserId: args.fromUserId,
      fromAdminId: args.fromAdminId,
      title: args.title,
      message: args.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});

export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50); // Limit to 50 most recent notifications

    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        let fromUser = null;
        let fromAdmin = null;
        let post = null;
        let comment = null;

        if (notification.fromUserId) {
          fromUser = await ctx.db.get(notification.fromUserId);
        }
        
        if (notification.fromAdminId) {
          fromAdmin = await ctx.db.get(notification.fromAdminId);
        }

        if (notification.postId) {
          post = await ctx.db.get(notification.postId);
        }

        if (notification.commentId) {
          comment = await ctx.db.get(notification.commentId);
        }

        return {
          ...notification,
          fromUser: fromUser ? { name: fromUser.name, phone: fromUser.phone } : null,
          fromAdmin: fromAdmin ? { email: fromAdmin.email } : null,
          post: post ? { 
            description: post.description, 
            issueType: post.issueType,
            status: post.status,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
          } : null,
          comment: comment ? { text: comment.text, createdAt: comment.createdAt } : null,
        };
      })
    );

    return notificationsWithDetails;
  },
});

export const getUserNotificationsGrouped = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100);

    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        let fromAdmin = null;
        let post = null;

        if (notification.fromAdminId) {
          fromAdmin = await ctx.db.get(notification.fromAdminId);
        }

        if (notification.postId) {
          post = await ctx.db.get(notification.postId);
        }

        return {
          ...notification,
          fromAdmin: fromAdmin ? { email: fromAdmin.email } : null,
          post: post ? { 
            description: post.description, 
            issueType: post.issueType,
            status: post.status,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
          } : null,
        };
      })
    );

    // Group by post and sort chronologically within each group
    const grouped = notificationsWithDetails
      .filter(n => n.type === 'status_update' || n.type === 'admin_comment')
      .reduce((acc: any, notification) => {
        const postId = notification.postId;
        if (!postId) return acc;

        if (!acc[postId]) {
          acc[postId] = {
            post: notification.post,
            notifications: [],
            latestUpdate: notification.createdAt,
          };
        }
        
        acc[postId].notifications.push(notification);
        
        // Keep latest update time for sorting
        if (notification.createdAt > acc[postId].latestUpdate) {
          acc[postId].latestUpdate = notification.createdAt;
        }
        
        return acc;
      }, {});

    // Sort notifications within each group chronologically
    Object.values(grouped).forEach((group: any) => {
      group.notifications.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    // Convert to array and sort by latest update
    return Object.entries(grouped)
      .map(([postId, group]: [string, any]) => ({
        postId,
        ...group,
      }))
      .sort((a, b) => new Date(b.latestUpdate).getTime() - new Date(a.latestUpdate).getTime());
  },
});

export const getUnreadNotificationCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    
    return unreadNotifications.length;
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    await Promise.all(
      unreadNotifications.map(notification =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );
  },
});

export const createStatusUpdateNotification = mutation({
  args: {
    postId: v.id("posts"),
    newStatus: v.union(
      v.literal("submitted"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    const statusMessages = {
      submitted: "Your post has been submitted for review",
      in_progress: "Your post is now being addressed by our team",
      resolved: "Great news! Your reported issue has been resolved",
      rejected: "Your post has been reviewed but cannot be processed at this time"
    };

    return await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "status_update",
      postId: args.postId,
      fromAdminId: args.adminId,
      title: `Post Status Updated`,
      message: statusMessages[args.newStatus],
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});

export const createAdminCommentNotification = mutation({
  args: {
    postId: v.id("posts"),
    commentId: v.id("comments"),
    adminId: v.id("admins"),
    commentText: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    return await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "admin_comment",
      postId: args.postId,
      commentId: args.commentId,
      fromAdminId: args.adminId,
      title: "Admin Response",
      message: args.commentText, // Store the actual comment text
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },
});