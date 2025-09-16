'use client';

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from "./ImageCarousel";
import { CommentsSection } from "./CommentsSection";

interface Post {
  _id: Id<"posts">;
  userId: Id<"users">;
  description: string;
  issueType: string;
  customIssueType?: string;
  city: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: "submitted" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes?: number;
  reposts: number;
  bookmarks: number;
  likedBy?: Id<"users">[];
  votedBy?: Id<"users">[];
  user?: {
    name: string;
    phone: string;
  } | null;
  photos?: Array<{
    fileId: Id<"_storage">;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>;
}

interface User {
  _id: Id<"users">;
  name: string;
  phone: string;
  city: string;
  role: "user";
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  user: User;
}

export const PostCard = ({ post, user }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Check if user has liked this post
  const isLiked = useQuery(api.posts.getUserLikeStatus, {
    postId: post._id as Id<"posts">,
    userId: user._id as Id<"users">
  });
  
  // Convex mutations
  const toggleLike = useMutation(api.posts.toggleLike);
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
    } catch (error: unknown) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleToggleLike = async () => {
    try {
      await toggleLike({ postId: post._id, userId: user._id as Id<"users"> });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
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
          
          <ImageCarousel photos={post.photos?.map(photo => ({
            _id: photo.fileId,
            fileName: photo.fileName,
            url: null
          })) || []} />
          
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
            
            {/* Like Button (LinkedIn-style toggle) */}
            <button 
              onClick={handleToggleLike}
              className={`flex items-center space-x-1 lg:space-x-2 transition-colors p-2 lg:p-3 rounded-full ${
                isLiked 
                  ? 'text-blue-500 bg-blue-900/20 hover:bg-blue-900/30' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'
              }`}
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2v0a2 2 0 00-2 2v6.5C10 11.776 10.224 12 10.5 12H14zm-7 10v-5C7 6.477 6.523 6 6 6v0c-.523 0-1 .477-1 1v5c0 .523.477 1 1 1h1z" />
              </svg>
              <span className="text-xs lg:text-sm">{post.likes || 0}</span>
              {isLiked && (
                <span className="text-xs text-blue-400 hidden lg:inline">Liked</span>
              )}
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
              {/* Comment Input - Always visible since multiple comments are allowed */}
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
              
              {/* Comments List */}
              <CommentsSection postId={post._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};