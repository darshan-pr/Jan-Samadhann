/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admins from "../admins.js";
import type * as comments from "../comments.js";
import type * as departments from "../departments.js";
import type * as emergencyPosts from "../emergencyPosts.js";
import type * as notifications from "../notifications.js";
import type * as photos from "../photos.js";
import type * as posts from "../posts.js";
import type * as sampleDepartments from "../sampleDepartments.js";
import type * as seedDepartments from "../seedDepartments.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  comments: typeof comments;
  departments: typeof departments;
  emergencyPosts: typeof emergencyPosts;
  notifications: typeof notifications;
  photos: typeof photos;
  posts: typeof posts;
  sampleDepartments: typeof sampleDepartments;
  seedDepartments: typeof seedDepartments;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
