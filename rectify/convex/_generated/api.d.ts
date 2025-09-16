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
import type * as badges from "../badges.js";
import type * as comments from "../comments.js";
import type * as notifications from "../notifications.js";
import type * as photos from "../photos.js";
import type * as points from "../points.js";
import type * as posts from "../posts.js";
import type * as seedBadges from "../seedBadges.js";
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
  badges: typeof badges;
  comments: typeof comments;
  notifications: typeof notifications;
  photos: typeof photos;
  points: typeof points;
  posts: typeof posts;
  seedBadges: typeof seedBadges;
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
