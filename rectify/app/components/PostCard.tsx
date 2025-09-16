'use client';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from "./ImageCarousel";
import { CommentsSection } from "./CommentsSection";

interface PostCardProps {
  post: any;
  user: any;
}

export const PostCard = ({ post, user }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Check if user has already commented
  const userComment = useQuery(api.comments.getUserComment, { 
    postId: post._id as Id<"posts">, 
    userId: user._id as Id<"users"> 
  });
  
  // Convex mutations
  const likePost = useMutation(api.posts.likePost);
  const dislikePost = useMutation(api.posts.dislikePost);
  const repostPost = useMutation(api.posts.repostPost);
  const bookmarkPost = useMutation(api.posts.bookmarkPost);
  const addComment = useMutation(api.comments.addComment);

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
      // Show user-friendly error message
      if (error.message.includes("already commented")) {
        alert("You have already commented on this post. Only one comment per user is allowed.");
      } else {
        alert("Failed to add comment. Please try again.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
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

  return (
    <div className="p-4 lg:p-6 hover:bg-gray-950/50 transition-colors border-l-4 border-transparent hover:border-blue-500/50">
      <div className="flex space-x-3 lg:space-x-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm lg:text-lg font-bold">{post.user?.name?.[0].toUpperCase() || "U"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2 mb-2">
            <span className="font-bold text-base lg:text-lg">{post.user?.name || "Unknown"}</span>
            <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
              <span>@{post.user?.phone?.slice(-4) || "user"}</span>
              <span>·</span>
              <span>{formatTime(post.createdAt)}</span>
              <span>·</span>
              <span>{post.city}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block bg-blue-900/30 text-blue-300 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
                {post.issueType}
              </span>
              <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium ${
                post.priority === "high" ? "bg-red-900/30 text-red-300" :
                post.priority === "medium" ? "bg-yellow-900/30 text-yellow-300" :
                "bg-green-900/30 text-green-300"
              }`}>
                {post.priority} priority
              </span>
              <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium ${
                post.status === "resolved" ? "bg-green-900/30 text-green-300" :
                post.status === "in_progress" ? "bg-blue-900/30 text-blue-300" :
                post.status === "rejected" ? "bg-red-900/30 text-red-300" :
                "bg-gray-900/30 text-gray-300"
              }`}>
                {post.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-white text-sm lg:text-lg leading-relaxed">{post.description}</p>
          </div>
          
          <ImageCarousel photos={post.photos} />
          
          <div className="flex items-center justify-between text-gray-400 max-w-full">
            <button 
              onClick={toggleComments}
              className="flex items-center space-x-1 lg:space-x-2 hover:text-blue-400 transition-colors p-2 lg:p-3 rounded-full hover:bg-blue-900/10"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs lg:text-sm">
                {showComments ? 'Hide' : 'Reply'}
              </span>
            </button>
            
            <button 
              onClick={handleRepost}
              className="flex items-center space-x-1 lg:space-x-2 hover:text-green-400 transition-colors p-2 lg:p-3 rounded-full hover:bg-green-900/10"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs lg:text-sm">{post.reposts}</span>
            </button>
            
            {/* Thumbs Up (Like) Button */}
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 lg:space-x-2 hover:text-green-400 transition-colors p-2 lg:p-3 rounded-full hover:bg-green-900/10"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
              </svg>
              <span className="text-xs lg:text-sm">{post.likes || 0}</span>
            </button>

            {/* Thumbs Down (Dislike) Button */}
            <button 
              onClick={handleDislike}
              className="flex items-center space-x-1 lg:space-x-2 hover:text-red-400 transition-colors p-2 lg:p-3 rounded-full hover:bg-red-900/10"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521C4.537 3.997 5.136 3.75 5.754 3.75H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z"/>
              </svg>
              <span className="text-xs lg:text-sm">{post.dislikes || 0}</span>
            </button>
            
            <button 
              onClick={handleBookmark}
              className="hover:text-blue-400 transition-colors p-2 lg:p-3 rounded-full hover:bg-blue-900/10"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            
            <button className="hover:text-gray-300 transition-colors p-2 lg:p-3 rounded-full hover:bg-gray-900/10">
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
          
          {/* Comment Section */}
          {showComments && (
            <div className="mt-4 border-t border-gray-800 pt-4">
              {/* Comment Input */}
              {userComment ? (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">You have already commented on this post:</p>
                  <p className="text-white text-sm">{userComment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Posted {formatTime(userComment.createdAt)}
                  </p>
                </div>
              ) : (
                <div className="flex space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex space-x-2">
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
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {isSubmittingComment ? "..." : "Post"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Comments List */}
              <CommentsSection postId={post._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};