import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllBadges = query({
  args: {},
  handler: async (ctx) => {
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
    return badges;
  },
});

export const getBadgesByCategory = query({
  args: { 
    category: v.union(
      v.literal("contribution"),
      v.literal("achievement"),
      v.literal("premium"),
      v.literal("special")
    )
  },
  handler: async (ctx, args) => {
    const badges = await ctx.db
      .query("badges")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return badges;
  },
});

export const getUserBadges = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get badge details for each user badge
    const badgesWithDetails = await Promise.all(
      userBadges.map(async (userBadge) => {
        const badge = await ctx.db.get(userBadge.badgeId);
        return {
          ...userBadge,
          badge,
        };
      })
    );

    return badgesWithDetails;
  },
});

export const purchaseBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const badge = await ctx.db.get(args.badgeId);

    if (!user || !badge) {
      throw new Error("User or badge not found");
    }

    if (!badge.isActive) {
      throw new Error("Badge is not available for purchase");
    }

    const currentPoints = user.points || 0;
    if (currentPoints < badge.cost) {
      throw new Error("Insufficient points to purchase this badge");
    }

    // Check if user already owns this badge
    const existingUserBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_badge", (q) => 
        q.eq("userId", args.userId).eq("badgeId", args.badgeId)
      )
      .first();

    if (existingUserBadge) {
      throw new Error("User already owns this badge");
    }

    // Spend points
    const newPoints = currentPoints - badge.cost;
    await ctx.db.patch(args.userId, { points: newPoints });

    // Create points transaction
    await ctx.db.insert("pointsTransactions", {
      userId: args.userId,
      points: badge.cost,
      type: "spent",
      reason: `Purchased badge: ${badge.name}`,
      badgeId: args.badgeId,
      createdAt: new Date().toISOString(),
    });

    // Give user the badge
    const userBadgeId = await ctx.db.insert("userBadges", {
      userId: args.userId,
      badgeId: args.badgeId,
      isEquipped: false,
      earnedAt: new Date().toISOString(),
    });

    return { success: true, userBadgeId, remainingPoints: newPoints };
  },
});

export const equipBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    // Find the user's badge
    const userBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_badge", (q) => 
        q.eq("userId", args.userId).eq("badgeId", args.badgeId)
      )
      .first();

    if (!userBadge) {
      throw new Error("User does not own this badge");
    }

    // Unequip all other badges for this user
    const allUserBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const badge of allUserBadges) {
      await ctx.db.patch(badge._id, { isEquipped: false });
    }

    // Equip the selected badge
    await ctx.db.patch(userBadge._id, { isEquipped: true });

    return { success: true };
  },
});

export const unequipBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeId: v.id("badges"),
  },
  handler: async (ctx, args) => {
    const userBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_badge", (q) => 
        q.eq("userId", args.userId).eq("badgeId", args.badgeId)
      )
      .first();

    if (!userBadge) {
      throw new Error("User does not own this badge");
    }

    await ctx.db.patch(userBadge._id, { isEquipped: false });

    return { success: true };
  },
});

export const getEquippedBadge = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const equippedUserBadge = await ctx.db
      .query("userBadges")
      .withIndex("by_user_equipped", (q) => 
        q.eq("userId", args.userId).eq("isEquipped", true)
      )
      .first();

    if (!equippedUserBadge) {
      return null;
    }

    const badge = await ctx.db.get(equippedUserBadge.badgeId);
    return {
      ...equippedUserBadge,
      badge,
    };
  },
});

// Admin function to create badges
export const createBadge = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const badgeId = await ctx.db.insert("badges", {
      ...args,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return badgeId;
  },
});