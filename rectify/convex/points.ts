import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserPoints = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.points || 0;
  },
});

export const getPointsTransactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("pointsTransactions")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return transactions;
  },
});

export const awardPoints = mutation({
  args: {
    userId: v.id("users"),
    points: v.number(),
    reason: v.string(),
    postId: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentPoints = user.points || 0;
    const newPoints = currentPoints + args.points;

    // Update user's total points
    await ctx.db.patch(args.userId, { points: newPoints });

    // Create transaction record
    await ctx.db.insert("pointsTransactions", {
      userId: args.userId,
      points: args.points,
      type: "earned",
      reason: args.reason,
      postId: args.postId,
      createdAt: new Date().toISOString(),
    });

    return newPoints;
  },
});

export const spendPoints = mutation({
  args: {
    userId: v.id("users"),
    points: v.number(),
    reason: v.string(),
    badgeId: v.optional(v.id("badges")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentPoints = user.points || 0;
    if (currentPoints < args.points) {
      throw new Error("Insufficient points");
    }

    const newPoints = currentPoints - args.points;

    // Update user's total points
    await ctx.db.patch(args.userId, { points: newPoints });

    // Create transaction record
    await ctx.db.insert("pointsTransactions", {
      userId: args.userId,
      points: args.points,
      type: "spent",
      reason: args.reason,
      badgeId: args.badgeId,
      createdAt: new Date().toISOString(),
    });

    return newPoints;
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();

    // Sort by points and take top users
    const sortedUsers = users
      .filter(user => user.points && user.points > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, limit);

    return sortedUsers.map(user => ({
      _id: user._id,
      name: user.name,
      city: user.city,
      points: user.points || 0,
    }));
  },
});