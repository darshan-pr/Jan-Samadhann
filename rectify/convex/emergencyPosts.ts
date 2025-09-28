import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createEmergencyPost = mutation({
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
    emergencyLevel: v.union(v.literal("critical"), v.literal("urgent"), v.literal("high")),
    emergencyContactNumber: v.optional(v.string()),
    affectedPeopleCount: v.optional(v.number()),
    immediateAction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Create emergency post with high priority
    const postId = await ctx.db.insert("posts", {
      userId: args.userId,
      description: args.description,
      issueType: args.issueType,
      customIssueType: args.customIssueType,
      city: args.city,
      address: args.address,
      coordinates: args.coordinates,
      status: "submitted",
      priority: "high", // Emergency posts always get high priority
      isEmergency: true,
      emergencyLevel: args.emergencyLevel,
      emergencyContactNumber: args.emergencyContactNumber,
      affectedPeopleCount: args.affectedPeopleCount,
      immediateAction: args.immediateAction,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      dislikes: 0,
      reposts: 0,
      bookmarks: 0,
      likedBy: [],
      votedBy: [],
    });

    // Create immediate notification for the user
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "emergency_received",
      postId: postId,
      title: "Emergency Report Received",
      message: `Your emergency report has been received and is being processed immediately. Emergency ID: ${postId}`,
      isRead: false,
      createdAt: now,
    });

    // Auto-route critical emergencies to appropriate department
    if (args.emergencyLevel === "critical") {
      // Find appropriate department based on issue type
      const departments = await ctx.db.query("departments").collect();
      const appropriateDept = findDepartmentByIssueType(departments, args.issueType);
      
      if (appropriateDept) {
        await ctx.db.insert("departmentRouting", {
          postId: postId,
          departmentId: appropriateDept._id,
          routedBy: "system" as any, // System auto-routing
          priority: "urgent",
          notes: `Auto-routed critical emergency: ${args.emergencyLevel} level`,
          expectedResolutionTime: getCriticalResponseTime(args.emergencyLevel),
          status: "pending",
          routedAt: now,
        });

        // Notify user about automatic routing
        await ctx.db.insert("notifications", {
          userId: args.userId,
          type: "emergency_routed",
          postId: postId,
          title: "Emergency Automatically Routed",
          message: `Your critical emergency has been automatically routed to ${appropriateDept.name} for immediate action.`,
          isRead: false,
          createdAt: now,
        });
      }
    }

    return postId;
  },
});

export const getAllEmergencyPosts = query({
  handler: async (ctx) => {
    const emergencyPosts = await ctx.db
      .query("posts")
      .withIndex("by_emergency", (q) => q.eq("isEmergency", true))
      .order("desc")
      .collect();

    const postsWithUserInfo = await Promise.all(
      emergencyPosts.map(async (post) => {
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

        // Get routing information
        const routing = await ctx.db
          .query("departmentRouting")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .first();

        let department = null;
        if (routing) {
          department = await ctx.db.get(routing.departmentId);
        }

        return {
          ...post,
          user: user ? { name: user.name, phone: user.phone } : null,
          photos: photosWithUrls,
          routing: routing,
          department: department,
        };
      })
    );

    return postsWithUserInfo.sort((a, b) => {
      // Sort by emergency level first, then by creation time
      const levelPriority = { critical: 3, urgent: 2, high: 1 };
      const aPriority = levelPriority[a.emergencyLevel || 'high'] || 0;
      const bPriority = levelPriority[b.emergencyLevel || 'high'] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },
});

export const getCriticalEmergencyPosts = query({
  handler: async (ctx) => {
    const criticalPosts = await ctx.db
      .query("posts")
      .withIndex("by_emergency_level", (q) => q.eq("emergencyLevel", "critical"))
      .order("desc")
      .collect();

    const postsWithDetails = await Promise.all(
      criticalPosts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const routing = await ctx.db
          .query("departmentRouting")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .first();

        let department = null;
        if (routing) {
          department = await ctx.db.get(routing.departmentId);
        }

        return {
          ...post,
          user: user ? { name: user.name, phone: user.phone } : null,
          routing: routing,
          department: department,
        };
      })
    );

    return postsWithDetails;
  },
});

export const updateEmergencyStatus = mutation({
  args: {
    postId: v.id("posts"),
    status: v.union(
      v.literal("submitted"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("rejected")
    ),
    adminId: v.id("admins"),
    updateMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || !post.isEmergency) {
      throw new Error("Emergency post not found");
    }

    const now = new Date().toISOString();

    // Update post status
    await ctx.db.patch(args.postId, {
      status: args.status,
      updatedAt: now,
    });

    // Update routing status if exists
    const routing = await ctx.db
      .query("departmentRouting")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .first();

    if (routing) {
      const routingStatus = {
        submitted: "pending",
        in_progress: "in_progress",
        resolved: "completed",
        rejected: "rejected"
      }[args.status] as any;

      await ctx.db.patch(routing._id, {
        status: routingStatus,
        ...(args.status === "resolved" && { completedAt: now }),
        ...(args.updateMessage && { departmentNotes: args.updateMessage }),
      });
    }

    // Create user notification with emergency context
    const statusMessages = {
      submitted: "Your emergency report is being reviewed by our rapid response team",
      in_progress: "URGENT: Your emergency is now being actively addressed by our response team",
      resolved: "RESOLVED: Your emergency has been successfully addressed",
      rejected: "Your emergency report requires additional information"
    };

    await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "emergency_update",
      postId: args.postId,
      fromAdminId: args.adminId,
      title: `Emergency Update - ${args.status.toUpperCase()}`,
      message: args.updateMessage || statusMessages[args.status],
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});

export const routeEmergencyToDepartment = mutation({
  args: {
    postId: v.id("posts"),
    departmentId: v.id("departments"),
    adminId: v.id("admins"),
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
    const post = await ctx.db.get(args.postId);
    const department = await ctx.db.get(args.departmentId);
    
    if (!post || !post.isEmergency) {
      throw new Error("Emergency post not found");
    }
    
    if (!department) {
      throw new Error("Department not found");
    }

    const now = new Date().toISOString();

    // Check if already routed
    const existingRouting = await ctx.db
      .query("departmentRouting")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .first();

    if (existingRouting) {
      // Update existing routing
      await ctx.db.patch(existingRouting._id, {
        departmentId: args.departmentId,
        routedBy: args.adminId,
        priority: args.priority,
        notes: args.notes,
        expectedResolutionTime: args.expectedResolutionTime,
        status: "pending",
        routedAt: now,
      });
    } else {
      // Create new routing
      await ctx.db.insert("departmentRouting", {
        postId: args.postId,
        departmentId: args.departmentId,
        routedBy: args.adminId,
        priority: args.priority,
        notes: args.notes,
        expectedResolutionTime: args.expectedResolutionTime,
        status: "pending",
        routedAt: now,
      });
    }

    // Update department statistics
    await ctx.db.patch(args.departmentId, {
      totalAssigned: department.totalAssigned + 1,
      updatedAt: now,
    });

    // Notify user about routing
    await ctx.db.insert("notifications", {
      userId: post.userId,
      type: "emergency_routed",
      postId: args.postId,
      fromAdminId: args.adminId,
      title: "Emergency Routed to Department",
      message: `Your emergency has been routed to ${department.name} with ${args.priority} priority. Expected response: ${args.expectedResolutionTime || 'As soon as possible'}`,
      isRead: false,
      createdAt: now,
    });

    return { success: true, departmentName: department.name };
  },
});

export const getPendingEmergencyCount = query({
  handler: async (ctx) => {
    // Get count of pending emergencies (submitted status)
    const pendingEmergencies = await ctx.db
      .query("posts")
      .withIndex("by_emergency", (q) => q.eq("isEmergency", true))
      .filter((q) => q.eq(q.field("status"), "submitted"))
      .collect();

    return pendingEmergencies.length;
  },
});

export const getEmergencyStats = query({
  handler: async (ctx) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Get all emergency posts
    const allEmergencies = await ctx.db
      .query("posts")
      .withIndex("by_emergency", (q) => q.eq("isEmergency", true))
      .collect();

    // Filter by time periods
    const todayEmergencies = allEmergencies.filter(post => post.createdAt >= today);
    const last24HoursEmergencies = allEmergencies.filter(post => post.createdAt >= last24Hours);

    // Count by emergency level
    const criticalCount = allEmergencies.filter(post => post.emergencyLevel === "critical").length;
    const urgentCount = allEmergencies.filter(post => post.emergencyLevel === "urgent").length;
    const highCount = allEmergencies.filter(post => post.emergencyLevel === "high").length;

    // Count by status
    const pendingCount = allEmergencies.filter(post => post.status === "submitted").length;
    const inProgressCount = allEmergencies.filter(post => post.status === "in_progress").length;
    const resolvedCount = allEmergencies.filter(post => post.status === "resolved").length;
    const rejectedCount = allEmergencies.filter(post => post.status === "rejected").length;

    // Calculate response times for resolved emergencies
    const resolvedEmergencies = allEmergencies.filter(post => post.status === "resolved");
    const avgResponseTime = resolvedEmergencies.length > 0 
      ? resolvedEmergencies.reduce((sum, post) => {
          const created = new Date(post.createdAt).getTime();
          const updated = new Date(post.updatedAt).getTime();
          return sum + (updated - created);
        }, 0) / resolvedEmergencies.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total: allEmergencies.length,
      today: todayEmergencies.length,
      last24Hours: last24HoursEmergencies.length,
      byLevel: {
        critical: criticalCount,
        urgent: urgentCount,
        high: highCount,
      },
      byStatus: {
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
      },
      avgResponseTimeHours: Math.round(avgResponseTime * 100) / 100,
    };
  },
});

// Helper functions
function findDepartmentByIssueType(departments: any[], issueType: string) {
  const issueTypeMapping: Record<string, string[]> = {
    "Water Supply": ["utilities", "infrastructure"],
    "Road Maintenance": ["infrastructure", "transportation"],
    "Garbage Collection": ["sanitation", "environment"],
    "Street Lighting": ["utilities", "infrastructure"],
    "Traffic Management": ["transportation", "public_safety"],
    "Drainage": ["infrastructure", "utilities"],
    "Public Safety": ["public_safety"],
    "Environmental": ["environment", "sanitation"],
    "Building Safety": ["infrastructure", "public_safety"],
    "Fire Safety": ["public_safety"],
    "Medical Emergency": ["public_safety"],
    "Electrical Emergency": ["utilities", "public_safety"],
  };

  const relevantCategories = issueTypeMapping[issueType] || ["other"];
  
  // Find department with matching category and active status
  for (const category of relevantCategories) {
    const dept = departments.find(d => 
      d.category === category && 
      d.status === "active"
    );
    if (dept) return dept;
  }

  // Fallback to any active department
  return departments.find(d => d.status === "active");
}

function getCriticalResponseTime(emergencyLevel: string): string {
  switch (emergencyLevel) {
    case "critical": return "15 minutes";
    case "urgent": return "1 hour";
    case "high": return "4 hours";
    default: return "24 hours";
  }
}