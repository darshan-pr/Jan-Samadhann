import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all departments
export const getAllDepartments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("departments")
      .order("desc")
      .collect();
  },
});

// Get active departments
export const getActiveDepartments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("asc")
      .collect();
  },
});

// Get department by ID
export const getDepartmentById = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, { departmentId }) => {
    return await ctx.db.get(departmentId);
  },
});

// Create new department
export const createDepartment = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    head: v.string(),
    category: v.union(
      v.literal("infrastructure"),
      v.literal("sanitation"),
      v.literal("transportation"),
      v.literal("utilities"),
      v.literal("public_safety"),
      v.literal("environment"),
      v.literal("other")
    ),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
      days: v.array(v.string())
    }),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    return await ctx.db.insert("departments", {
      ...args,
      status: "active",
      avgResponseTime: 0,
      totalAssigned: 0,
      totalResolved: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Route post to department
export const routePostToDepartment = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Create routing record
    const routingId = await ctx.db.insert("departmentRouting", {
      ...args,
      status: "pending",
      routedAt: now,
    });

    // Update department stats
    const department = await ctx.db.get(args.departmentId);
    if (department) {
      await ctx.db.patch(args.departmentId, {
        totalAssigned: department.totalAssigned + 1,
        updatedAt: now,
      });
    }

    // Update post status to in_progress
    await ctx.db.patch(args.postId, {
      status: "in_progress",
      updatedAt: now,
    });

    return routingId;
  },
});

// Get post routing info
export const getPostRouting = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const routing = await ctx.db
      .query("departmentRouting")
      .filter((q) => q.eq(q.field("postId"), postId))
      .first();

    if (!routing) return null;

    const department = await ctx.db.get(routing.departmentId);
    const admin = await ctx.db.get(routing.routedBy);

    return {
      ...routing,
      department,
      routedByAdmin: admin,
    };
  },
});

// Get department routing history
export const getDepartmentRouting = query({
  args: { 
    departmentId: v.id("departments"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { departmentId, limit = 50 }) => {
    const routings = await ctx.db
      .query("departmentRouting")
      .filter((q) => q.eq(q.field("departmentId"), departmentId))
      .order("desc")
      .take(limit);

    const routingsWithPosts = await Promise.all(
      routings.map(async (routing) => {
        const post = await ctx.db.get(routing.postId);
        const admin = await ctx.db.get(routing.routedBy);
        return {
          ...routing,
          post,
          routedByAdmin: admin,
        };
      })
    );

    return routingsWithPosts;
  },
});

// Update routing status
export const updateRoutingStatus = mutation({
  args: {
    routingId: v.id("departmentRouting"),
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    departmentNotes: v.optional(v.string()),
  },
  handler: async (ctx, { routingId, status, departmentNotes }) => {
    const now = new Date().toISOString();
    const routing = await ctx.db.get(routingId);
    
    if (!routing) {
      throw new Error("Routing not found");
    }

    const updateData: any = {
      status,
      departmentNotes,
    };

    // Set timestamps based on status
    if (status === "acknowledged" && !routing.acknowledgedAt) {
      updateData.acknowledgedAt = now;
    } else if (status === "completed" && !routing.completedAt) {
      updateData.completedAt = now;
      
      // Update department stats
      const department = await ctx.db.get(routing.departmentId);
      if (department) {
        await ctx.db.patch(routing.departmentId, {
          totalResolved: department.totalResolved + 1,
          updatedAt: now,
        });
      }

      // Update post status to resolved
      await ctx.db.patch(routing.postId, {
        status: "resolved",
        updatedAt: now,
      });
    }

    return await ctx.db.patch(routingId, updateData);
  },
});

// Get department performance stats
export const getDepartmentPerformance = query({
  args: { 
    departmentId: v.optional(v.id("departments")),
    month: v.optional(v.string()),
  },
  handler: async (ctx, { departmentId, month }) => {
    let query = ctx.db.query("departmentPerformance");
    
    if (departmentId) {
      query = query.filter((q) => q.eq(q.field("departmentId"), departmentId));
    }
    
    if (month) {
      query = query.filter((q) => q.eq(q.field("month"), month));
    }

    const performance = await query.collect();

    // If no specific department or month requested, get overall stats
    if (!departmentId && !month) {
      const departments = await ctx.db.query("departments").collect();
      const routings = await ctx.db.query("departmentRouting").collect();
      
      return {
        totalDepartments: departments.length,
        activeDepartments: departments.filter(d => d.status === "active").length,
        totalRoutings: routings.length,
        completedRoutings: routings.filter(r => r.status === "completed").length,
        avgResponseTime: departments.reduce((acc, d) => acc + (d.avgResponseTime || 0), 0) / departments.length,
        performance,
      };
    }

    return performance;
  },
});

// Update department status
export const updateDepartmentStatus = mutation({
  args: {
    departmentId: v.id("departments"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance")
    ),
  },
  handler: async (ctx, { departmentId, status }) => {
    const now = new Date().toISOString();
    
    return await ctx.db.patch(departmentId, {
      status,
      updatedAt: now,
    });
  },
});