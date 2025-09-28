import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAdminByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Initialize default admin (run this once)
export const createDefaultAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", "admin@jansamadhan.com"))
      .first();

    if (!existingAdmin) {
      await ctx.db.insert("admins", {
        email: "admin@jansamadhan.com",
        password: "admin123", // In production, this should be hashed
        role: "admin",
        createdAt: new Date().toISOString(),
      });
    }
  },
});