import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addPhotoToPost = mutation({
  args: {
    postId: v.id("posts"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("photos", {
      postId: args.postId,
      fileId: args.fileId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const getPhotosByPost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const url = await ctx.storage.getUrl(photo.fileId);
        return { ...photo, url };
      })
    );

    return photosWithUrls;
  },
});