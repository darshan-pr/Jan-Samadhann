import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    role: v.literal("user"),
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
    isEmergency: v.optional(v.boolean()),
    emergencyLevel: v.optional(v.union(
      v.literal("critical"),
      v.literal("urgent"),
      v.literal("high")
    )),
    emergencyContactNumber: v.optional(v.string()),
    affectedPeopleCount: v.optional(v.number()),
    immediateAction: v.optional(v.string()),
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
    .index("by_likes", ["likes"])
    .index("by_emergency", ["isEmergency"])
    .index("by_emergency_level", ["emergencyLevel"]),

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
      v.literal("repost"),
      v.literal("emergency_received"),
      v.literal("emergency_routed"),
      v.literal("emergency_acknowledged"),
      v.literal("emergency_update")
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

  departments: defineTable({
    name: v.string(),
    description: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    head: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance")
    ),
    category: v.union(
      v.literal("infrastructure"),
      v.literal("sanitation"),
      v.literal("transportation"),
      v.literal("utilities"),
      v.literal("public_safety"),
      v.literal("environment"),
      v.literal("other")
    ),
    avgResponseTime: v.optional(v.number()), // in hours
    totalAssigned: v.number(),
    totalResolved: v.number(),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
      days: v.array(v.string())
    }),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_status", ["status"])
    .index("by_category", ["category"]),

  departmentRouting: defineTable({
    postId: v.id("posts"),
    departmentId: v.id("departments"),
    routedBy: v.id("admins"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    notes: v.optional(v.string()),
    expectedResolutionTime: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    routedAt: v.string(),
    acknowledgedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    departmentNotes: v.optional(v.string()),
  }).index("by_post", ["postId"])
    .index("by_department", ["departmentId"])
    .index("by_status", ["status"])
    .index("by_routed_at", ["routedAt"]),

  departmentPerformance: defineTable({
    departmentId: v.id("departments"),
    month: v.string(), // YYYY-MM format
    totalAssigned: v.number(),
    totalCompleted: v.number(),
    avgResponseTime: v.number(), // in hours
    avgResolutionTime: v.number(), // in hours
    satisfactionScore: v.optional(v.number()), // 1-5 rating
    onTimeDelivery: v.number(), // percentage
    createdAt: v.string(),
  }).index("by_department", ["departmentId"])
    .index("by_month", ["month"])
    .index("by_department_month", ["departmentId", "month"]),
});