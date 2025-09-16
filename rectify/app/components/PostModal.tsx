'use client';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from "./ImageCarousel";
import { CommentsSection } from "./CommentsSection";

interface PostModalProps {
  post: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal = ({ post, user, isOpen, onClose }: PostModalProps) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // No longer checking for existing comments since multiple comments are allowed
  
  // Convex mutations
  const likePost = useMutation(api.posts.likePost);
  const dislikePost = useMutation(api.posts.dislikePost);
  const repostPost = useMutation(api.posts.repostPost);
  const bookmarkPost = useMutation(api.posts.bookmarkPost);
  const addComment = useMutation(api.comments.addComment);

  // Get user points and badge for profile display
  const userPoints = useQuery(api.points.getUserPoints,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const equippedBadge = useQuery(api.badges.getEquippedBadge,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  if (!isOpen) return null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;
    
    try {
      setIsSubmittingComment(true);
      
      await addComment({
        postId: post._id as Id<"posts">,
        userId: user._id as Id<"users">,
        text: commentText.trim(),
      });
      
      setCommentText("");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = () => {
    likePost({ postId: post._id, userId: user._id as Id<"users"> });
  };

  const handleDislike = () => {
    dislikePost({ postId: post._id, userId: user._id as Id<"users"> });
  };

  const handleRepost = () => {
    repostPost({ postId: post._id, userId: user._id as Id<"users"> });
  };

  const handleBookmark = () => {
    bookmarkPost({ postId: post._id, userId: user._id as Id<"users"> });
  };

  const getBadgeIcon = (points: number) => {
    if (points >= 1000) return "👑"; // King
    if (points >= 500) return "💎"; // Diamond
    if (points >= 200) return "🏆"; // Trophy
    if (points >= 100) return "⭐"; // Star
    if (points >= 50) return "🔥"; // Fire
    return "🌟"; // Sparkle for beginners
  };

  const getBadgeColor = (points: number) => {
    if (points >= 1000) return "from-yellow-400 to-yellow-600";
    if (points >= 500) return "from-blue-400 to-blue-600";
    if (points >= 200) return "from-purple-400 to-purple-600";
    if (points >= 100) return "from-orange-400 to-orange-600";
    if (points >= 50) return "from-red-400 to-red-600";
    return "from-gray-400 to-gray-600";
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-4 sm:pt-4">
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-700 mobile-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Post Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-70px)] sm:max-h-[calc(90vh-80px)]">
          <div className="p-4 sm:p-6">
            {/* Post Header */}
            <div className="flex space-x-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">{post.user?.name?.[0].toUpperCase() || "U"}</span>
                </div>
                {/* Badge overlay - More prominent */}
                {equippedBadge?.badge ? (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-3 border-gray-900 shadow-xl badge-animate">
                    <span className="text-lg">{equippedBadge.badge.icon}</span>
                  </div>
                ) : (
                  <div className={`absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br ${getBadgeColor(userPoints || 0)} rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg`}>
                    <span className="text-base font-bold">{getBadgeIcon(userPoints || 0)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <span className="font-bold text-xl">{post.user?.name || "Unknown"}</span>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>@{post.user?.phone?.slice(-4) || "user"}</span>
                    <span>·</span>
                    <span>{formatTime(post.createdAt)}</span>
                    <span>·</span>
                    <span>{post.city}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-yellow-400 font-medium">⭐ {userPoints || 0} points</span>
                  {equippedBadge?.badge && (
                    <>
                      <span className="text-gray-400">·</span>
                      <span className="text-purple-400">{equippedBadge.badge.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {post.issueType}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.priority === "high" ? "bg-red-900/30 text-red-300" :
                  post.priority === "medium" ? "bg-yellow-900/30 text-yellow-300" :
                  "bg-green-900/30 text-green-300"
                }`}>
                  {post.priority} priority
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.status === "resolved" ? "bg-green-900/30 text-green-300" :
                  post.status === "in_progress" ? "bg-blue-900/30 text-blue-300" :
                  post.status === "rejected" ? "bg-red-900/30 text-red-300" :
                  "bg-gray-900/30 text-gray-300"
                }`}>
                  {post.status.replace("_", " ")}
                </span>
              </div>
              
              <p className="text-white text-lg leading-relaxed mb-4">{post.description}</p>
              
              {post.address && (
                <div className="flex items-center space-x-2 text-gray-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{post.address}</span>
                </div>
              )}
            </div>

            {/* Images */}
            <ImageCarousel photos={post.photos} />

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 p-3 sm:p-4 bg-gray-800/30 rounded-2xl flex-wrap gap-2">
              <button 
                onClick={handleRepost}
                className="flex items-center space-x-2 hover:text-green-400 transition-colors px-4 py-2 rounded-full hover:bg-green-900/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{post.reposts || 0}</span>
              </button>
              
              <button 
                onClick={handleLike}
                className="flex items-center space-x-2 hover:text-green-400 transition-colors px-4 py-2 rounded-full hover:bg-green-900/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
                </svg>
                <span>{post.likes || 0}</span>
              </button>

              <button 
                onClick={handleDislike}
                className="flex items-center space-x-2 hover:text-red-400 transition-colors px-4 py-2 rounded-full hover:bg-red-900/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521C4.537 3.997 5.136 3.75 5.754 3.75H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z"/>
                </svg>
                <span>{post.dislikes || 0}</span>
              </button>
              
              <button 
                onClick={handleBookmark}
                className="hover:text-blue-400 transition-colors px-4 py-2 rounded-full hover:bg-blue-900/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              
              <button className="hover:text-gray-300 transition-colors px-4 py-2 rounded-full hover:bg-gray-900/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            {/* Comment Section */}
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments
              </h3>
              
              {/* Comment Input */}
              <div className="flex space-x-2 sm:space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex space-x-1 sm:space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base mobile-input"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-6 py-3 font-medium transition-colors"
                    >
                      {isSubmittingComment ? "..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Comments List */}
              <CommentsSection postId={post._id} currentUser={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};