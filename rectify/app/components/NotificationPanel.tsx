'use client';

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface NotificationPanelProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({ user, isOpen, onClose }: NotificationPanelProps) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [groupByPost, setGroupByPost] = useState(false);
  
  const notifications = useQuery(api.notifications.getUserNotifications, { 
    userId: user._id as Id<"users"> 
  });
  const groupedNotifications = useQuery(api.notifications.getUserNotificationsGrouped, { 
    userId: user._id as Id<"users"> 
  });
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, { 
    userId: user._id as Id<"users"> 
  });
  
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case 'status_update':
        return {
          title: `Status Update`,
          message: notification.message || "Your post status has been updated by an admin.",
          color: 'text-blue-400',
          priority: 'high'
        };
      case 'admin_comment':
        return {
          title: "Admin Response",
          message: `Admin has responded to your post`,
          color: 'text-purple-400',
          priority: 'high'
        };
      default:
        return {
          title: "Notification",
          message: notification.message || "You have a new notification.",
          color: 'text-gray-400',
          priority: 'normal'
        };
    }
  };

  const getStatusDetails = (notification: any) => {
    if (notification.type !== 'status_update') return null;
    
    const statusMap = {
      'submitted': { color: 'bg-gray-500', label: 'Submitted', description: 'Your post has been received and is awaiting review' },
      'in_progress': { color: 'bg-yellow-500', label: 'In Progress', description: 'Your issue is being actively addressed by our team' },
      'resolved': { color: 'bg-green-500', label: 'Resolved', description: 'Great news! Your reported issue has been resolved' },
      'rejected': { color: 'bg-red-500', label: 'Declined', description: 'Your post was reviewed but cannot be processed at this time' }
    };

    // Extract status from message or use a default
    const messageWords = notification.message.toLowerCase();
    let currentStatus: keyof typeof statusMap = 'submitted';
    
    if (messageWords.includes('progress') || messageWords.includes('addressed')) currentStatus = 'in_progress';
    else if (messageWords.includes('resolved')) currentStatus = 'resolved';
    else if (messageWords.includes('reject') || messageWords.includes('cannot')) currentStatus = 'rejected';

    return statusMap[currentStatus];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
      case 'resolved':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
        );
    }
  };

  const renderGroupedNotifications = () => {
    if (!groupedNotifications || groupedNotifications.length === 0) {
      return (
        <div className="p-6 lg:p-8 text-center text-gray-500">
          <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg lg:text-xl font-bold mb-2">No post updates</h3>
          <p className="text-sm lg:text-base">Your post updates and admin responses will appear here</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-800">
        {groupedNotifications.map((group) => (
          <div key={group.postId} className="p-4 lg:p-5 hover:bg-gray-800/30 transition-colors">
            {/* Post Header */}
            <div className="mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white mb-1">
                    {group.post?.issueType || 'Post Update'}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    {group.post?.description?.slice(0, 100)}
                    {group.post?.description && group.post.description.length > 100 ? '...' : ''}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-300">
                      {group.post?.issueType}
                    </span>
                    <span className="text-xs text-gray-500">
                      Current Status: {group.post?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="ml-4 border-l-2 border-gray-700 pl-4 space-y-4">
              {group.notifications.map((notification: any, index: number) => {
                const { title, color } = getNotificationMessage(notification);
                const statusDetails = getStatusDetails(notification);
                const isLast = index === group.notifications.length - 1;

                return (
                  <div
                    key={notification._id}
                    className={`relative ${!notification.isRead ? 'bg-blue-900/10 rounded-lg p-3 border border-blue-500/30' : ''}`}
                  >
                    {/* Timeline node */}
                    <div className="absolute -left-7 top-2">
                      {notification.type === 'status_update' && statusDetails ? 
                        getStatusIcon(statusDetails.label.toLowerCase().replace(' ', '_')) :
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      }
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${color}`}>
                            {title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                            {notification.fromAdmin && ` • by ${notification.fromAdmin.email}`}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      {/* Status update details */}
                      {notification.type === 'status_update' && statusDetails && (
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className={`w-3 h-3 ${statusDetails.color} rounded-full`}></div>
                            <span className="text-sm font-medium text-white">
                              {statusDetails.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {statusDetails.description}
                          </p>
                        </div>
                      )}

                      {/* Admin comment details */}
                      {notification.type === 'admin_comment' && (
                        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-purple-300">
                              {notification.fromAdmin?.email || 'Admin'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return (
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        );
      case 'admin_comment':
        return (
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        );
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead({ notificationId: notificationId as Id<"notifications"> });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({ userId: user._id as Id<"users"> });
  };

  // Filter to show only admin-related notifications
  const adminNotifications = notifications?.filter(n => 
    n.type === 'status_update' || 
    n.type === 'admin_comment'
  ) || [];

  const filteredNotifications = showUnreadOnly 
    ? adminNotifications.filter(n => !n.isRead)
    : adminNotifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-2 lg:p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-md lg:max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700 mt-4 lg:mt-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-5 5v-5zM4 19h16a1 1 0 001-1v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a1 1 0 001 1z"/>
                <path d="M12 3v4m0 0l-2-2m2 2l2-2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white">Notifications</h2>
              <p className="text-xs lg:text-sm text-gray-400">
                Updates and comments from moderators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 lg:p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUnreadOnly(false)}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-colors ${
                  !showUnreadOnly 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All ({adminNotifications.length})
              </button>
              <button
                onClick={() => setShowUnreadOnly(true)}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-colors ${
                  showUnreadOnly 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Unread ({adminNotifications.filter(n => !n.isRead).length})
              </button>
            </div>
            {unreadCount && unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs lg:text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">View:</span>
            <button
              onClick={() => setGroupByPost(false)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !groupByPost 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setGroupByPost(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                groupByPost 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              By Post
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] lg:max-h-[70vh]">
          {(!notifications && !groupedNotifications) ? (
            <div className="p-4 lg:p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : groupByPost ? (
            renderGroupedNotifications()
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 lg:p-8 text-center text-gray-500">
              <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2">
                {showUnreadOnly ? "All caught up!" : "No admin notifications"}
              </h3>
              <p className="text-sm lg:text-base">
                {showUnreadOnly ? "You've read all notifications" : "Admin updates will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredNotifications.map((notification) => {
                const { title, message, color } = getNotificationMessage(notification);
                const statusDetails = getStatusDetails(notification);
                
                return (
                  <div
                    key={notification._id}
                    className={`p-4 lg:p-5 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-900/10 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex space-x-3 lg:space-x-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className={`text-sm lg:text-base font-medium ${color} mb-1`}>
                              {title}
                            </p>
                            {notification.type === 'admin_comment' ? (
                              <div className="space-y-2">
                                <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                                  {message}
                                </p>
                                {/* Show the actual admin comment content */}
                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
                                      </svg>
                                    </div>
                                    <span className="text-xs font-medium text-purple-300">
                                      {notification.fromAdmin?.email || 'Admin'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 leading-relaxed">
                                    {/* Extract the actual comment from notification message or show the message if it's already the comment */}
                                    {notification.message.includes('commented on your post:') 
                                      ? notification.message.split('commented on your post:')[1]?.trim().replace(/^"|"$/g, '') || notification.message
                                      : notification.message
                                    }
                                  </p>
                                </div>
                              </div>
                            ) : notification.type === 'status_update' && statusDetails ? (
                              <div className="space-y-3">
                                <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                                  {statusDetails.description}
                                </p>
                                {/* Status indicator */}
                                <div className="flex items-center space-x-3 bg-gray-800/70 rounded-lg p-3 border border-gray-700">
                                  <div className={`w-3 h-3 ${statusDetails.color} rounded-full flex-shrink-0`}></div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-white">
                                      Status: {statusDetails.label}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Updated by admin • {formatTime(notification.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                                {message}
                              </p>
                            )}
                          </div>
                          <span className="text-xs lg:text-sm text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        
                        {/* Show post preview for relevant notifications */}
                        {notification.post && (notification.type === 'status_update' || notification.type === 'admin_comment') && (
                          <div className="bg-gray-800/70 rounded-lg p-3 mt-3 border border-gray-700">
                            <p className="text-xs text-gray-400 mb-1">Related Post:</p>
                            <p className="text-sm text-gray-300 leading-relaxed mb-2">
                              {notification.post.description.slice(0, 120)}
                              {notification.post.description.length > 120 ? '...' : ''}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-300">
                                  {notification.post.issueType}
                                </span>
                              </div>
                              {notification.type === 'status_update' && (
                                <div className="text-xs text-gray-400">
                                  Track your post progress
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!notification.isRead && (
                          <div className="flex items-center mt-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-xs lg:text-sm text-blue-400 font-medium">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};