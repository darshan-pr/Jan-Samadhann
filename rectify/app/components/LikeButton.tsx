'use client';

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface LikeButtonProps {
  postId: Id<"posts">;
  userId: Id<"users">;
  likesCount: number;
}

export const LikeButton = ({ postId, userId, likesCount }: LikeButtonProps) => {
  // Check if user has liked this post
  const isLiked = useQuery(api.posts.getUserLikeStatus, {
    postId,
    userId
  });

  const toggleLike = useMutation(api.posts.toggleLike);

  const handleToggleLike = async () => {
    try {
      await toggleLike({ postId, userId });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <button 
      onClick={handleToggleLike}
      className={`flex items-center space-x-1 lg:space-x-2 transition-colors p-2 lg:p-3 rounded-xl ${
        isLiked 
          ? "text-red-500 hover:text-red-400 bg-red-900/10" 
          : "text-gray-400 hover:text-red-400 hover:bg-red-900/10"
      }`}
    >
      <svg 
        className="w-4 h-4 lg:w-5 lg:h-5" 
        fill={isLiked ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="text-xs lg:text-sm font-medium">{likesCount}</span>
      {isLiked && (
        <span className="text-xs text-red-400 hidden lg:inline">Liked</span>
      )}
    </button>
  );
};