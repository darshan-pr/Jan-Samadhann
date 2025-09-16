'use client';

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CommentsSectionProps {
  postId: string;
  currentUser?: { _id: string; role: string; } | null;
}

export const CommentsSection = ({ postId, currentUser }: CommentsSectionProps) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const comments = useQuery(api.comments.getPostComments, { postId: postId as Id<"posts"> });
  const likeComment = useMutation(api.comments.likeComment);
  const editComment = useMutation(api.comments.editComment);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  const handleLikeComment = async (commentId: string, userId?: string) => {
    try {
      const result = await likeComment({ 
        commentId: commentId as Id<"comments">,
        userId: userId as Id<"users"> | undefined
      });
      
      if (!result?.success && result?.message === "Already liked") {
        // Could show a toast or subtle feedback that they already liked it
        console.log("Already liked this comment");
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim() || !currentUser) return;
    
    try {
      await editComment({
        commentId: commentId as Id<"comments">,
        text: editText.trim(),
        userId: currentUser.role === 'user' ? currentUser._id as Id<"users"> : undefined,
        adminId: currentUser.role === 'admin' ? currentUser._id as Id<"admins"> : undefined,
      });
      setEditingCommentId(null);
      setEditText("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  if (!comments) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment._id} className={`flex space-x-3 ${comment.isPinned ? 'bg-blue-900/10 rounded-lg p-3 border border-blue-500/20' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold">
              {comment.author?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm text-white">
                {comment.author?.name || "Unknown"}
              </span>
              {comment.author?.type === "admin" && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
              {comment.isPinned && (
                <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Pinned
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatTime(comment.createdAt)}
              </span>
            </div>
            
            {editingCommentId === comment._id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(comment._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-300 mb-2">{comment.text}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeComment(comment._id, comment.userId)}
                    className="flex items-center space-x-1 hover:text-green-400 transition-colors text-xs"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"/>
                    </svg>
                    <span>{comment.likes}</span>
                  </button>
                  
                  {/* Edit button - only show for comment author */}
                  {currentUser && (
                    (currentUser.role === 'user' && comment.userId === currentUser._id) ||
                    (currentUser.role === 'admin' && comment.adminId === currentUser._id)
                  ) && (
                    <button
                      onClick={() => handleEditComment(comment._id, comment.text)}
                      className="flex items-center space-x-1 hover:text-blue-400 transition-colors text-xs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      
      {comments.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};