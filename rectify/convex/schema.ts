import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    role: v.literal("user"),
    points: v.optional(v.number()),
    createdAt: v.string(),
  }).index("by_phone", ["phone"]),

  admins: defineTable({
    email: v.string(),
    password: v.string(),
    role: v.literal("admin"),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  reports: defineTable({
    userId: v.optional(v.id("users")),
    type: v.string(),
    description: v.string(),
    location: v.string(),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    timestamp: v.string(),
    status: v.string(),
    upvotes: v.number(),
    image: v.optional(v.string()),
  }),

  posts: defineTable({
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
    status: v.union(
      v.literal("submitted"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
    likes: v.number(),
    dislikes: v.optional(v.number()),
    reposts: v.number(),
    bookmarks: v.number(),
    likedBy: v.optional(v.array(v.id("users"))),
    votedBy: v.optional(v.array(v.id("users"))),
  }).index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"])
    .index("by_status", ["status"])
    .index("by_likes", ["likes"]),

  userVotes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    type: v.union(v.literal("like"), v.literal("dislike"), v.literal("repost"), v.literal("bookmark")),
    createdAt: v.string(),
  }).index("by_user_post", ["userId", "postId"])
    .index("by_post", ["postId"])
    .index("by_user_post_type", ["userId", "postId", "type"]),

  comments: defineTable({
    postId: v.id("posts"),
    userId: v.optional(v.id("users")),
    adminId: v.optional(v.id("admins")),
    text: v.string(),
    isPinned: v.optional(v.boolean()),
    likes: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_user_post", ["userId", "postId"])
    .index("by_pinned", ["isPinned"]),

  commentLikes: defineTable({
    commentId: v.id("comments"),
    userId: v.optional(v.id("users")),
    adminId: v.optional(v.id("admins")),
    createdAt: v.string(),
  }).index("by_comment", ["commentId"])
    .index("by_user_comment", ["userId", "commentId"])
    .index("by_admin_comment", ["adminId", "commentId"]),

  photos: defineTable({
    postId: v.id("posts"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    uploadedAt: v.string(),
  }).index("by_post", ["postId"]),

  notifications: defineTable({
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
    isRead: v.boolean(),
    createdAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_read", ["isRead"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_created_at", ["createdAt"]),

  replies: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    text: v.string(),
    likes: v.number(),
    mentions: v.optional(v.array(v.id("users"))),
    createdAt: v.string(),
  }).index("by_post", ["postId"])
    .index("by_user", ["userId"]),

  hashtags: defineTable({
    tag: v.string(),
    postCount: v.number(),
    trending: v.boolean(),
    lastUsed: v.string(),
  }).index("by_trending", ["trending"])
    .index("by_count", ["postCount"]),

  postHashtags: defineTable({
    postId: v.id("posts"),
    hashtagId: v.id("hashtags"),
  }).index("by_post", ["postId"])
    .index("by_hashtag", ["hashtagId"]),

  pointsTransactions: defineTable({
    userId: v.id("users"),
    points: v.number(),
    type: v.union(
      v.literal("earned"),
      v.literal("spent")
    ),
    reason: v.string(),
    postId: v.optional(v.id("posts")),
    badgeId: v.optional(v.id("badges")),
    createdAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_user_created", ["userId", "createdAt"]),

  badges: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    cost: v.number(),
    rarity: v.union(
      v.literal("common"),
      v.literal("rare"), 
      v.literal("epic"),
      v.literal("legendary")
    ),
    category: v.union(
      v.literal("contribution"),
      v.literal("achievement"),
      v.literal("premium"),
      v.literal("special")
    ),
    isActive: v.boolean(),
    createdAt: v.string(),
  }).index("by_rarity", ["rarity"])
    .index("by_category", ["category"])
    .index("by_cost", ["cost"])
    .index("by_active", ["isActive"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    isEquipped: v.boolean(),
    earnedAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_badge", ["badgeId"])
    .index("by_user_equipped", ["userId", "isEquipped"])
    .index("by_user_badge", ["userId", "badgeId"]),
});