import { mutation } from "./_generated/server";

export const seedInitialBadges = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if badges already exist
    const existingBadges = await ctx.db.query("badges").first();
    if (existingBadges) {
      return { message: "Badges already exist" };
    }

    const badgesToCreate = [
      // Contribution Badges
      {
        name: "Community Helper",
        description: "Awarded for your first contribution to the community",
        icon: "🤝",
        color: "bg-green-500",
        cost: 0,
        rarity: "common" as const,
        category: "contribution" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Issue Reporter",
        description: "Help make your community better by reporting issues",
        icon: "📝",
        color: "bg-blue-500",
        cost: 100,
        rarity: "common" as const,
        category: "contribution" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Problem Solver",
        description: "Multiple issues resolved thanks to your reports",
        icon: "🔧",
        color: "bg-yellow-500",
        cost: 250,
        rarity: "rare" as const,
        category: "achievement" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Community Champion",
        description: "Outstanding contributor to community improvement",
        icon: "👑",
        color: "bg-purple-500",
        cost: 500,
        rarity: "epic" as const,
        category: "achievement" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      
      // Premium Badges
      {
        name: "Early Adopter",
        description: "One of the first to join the Rectify community",
        icon: "🌟",
        color: "bg-orange-500",
        cost: 150,
        rarity: "rare" as const,
        category: "premium" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Gold Supporter",
        description: "Premium badge for dedicated community members",
        icon: "💎",
        color: "bg-yellow-400",
        cost: 300,
        rarity: "epic" as const,
        category: "premium" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Legendary Contributor",
        description: "The ultimate badge for exceptional community impact",
        icon: "🏆",
        color: "bg-gradient-to-r from-yellow-400 to-orange-500",
        cost: 1000,
        rarity: "legendary" as const,
        category: "special" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // Achievement Badges
      {
        name: "Sharp Eye",
        description: "Reported high-priority issues that were resolved",
        icon: "👁️",
        color: "bg-red-500",
        cost: 200,
        rarity: "rare" as const,
        category: "achievement" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Popular Reporter",
        description: "Your posts received lots of community support",
        icon: "❤️",
        color: "bg-pink-500",
        cost: 180,
        rarity: "rare" as const,
        category: "achievement" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Streak Master",
        description: "Consistent contributor over multiple weeks",
        icon: "🔥",
        color: "bg-orange-600",
        cost: 350,
        rarity: "epic" as const,
        category: "achievement" as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
    ];

    const createdBadges = [];
    for (const badge of badgesToCreate) {
      const badgeId = await ctx.db.insert("badges", badge);
      createdBadges.push(badgeId);
    }

    return { 
      message: "Successfully created initial badges", 
      count: createdBadges.length,
      badgeIds: createdBadges 
    };
  },
});