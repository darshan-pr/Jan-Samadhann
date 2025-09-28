/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EmergencyNotificationPanelProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyNotificationPanel = ({ user, isOpen, onClose }: EmergencyNotificationPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'emergency' | 'unread'>('emergency');
  
  // Get emergency-specific notifications
  const notifications = useQuery(api.notifications.getUserNotifications, 
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  const emergencyNotifications = notifications?.filter(notification => 
    ['emergency_received', 'emergency_routed', 'emergency_acknowledged', 'emergency_update'].includes(notification.type)
  );

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'emergency') {
      return ['emergency_received', 'emergency_routed', 'emergency_acknowledged', 'emergency_update'].includes(notification.type);
    }
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true; // 'all'
  }) || [];

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as Id<"notifications"> });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId: user._id as Id<"users"> });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency_received':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'emergency_routed':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        );
      case 'emergency_acknowledged':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
      case 'emergency_update':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 14.25c0-3.07 2.355-5.625 5.25-5.625s5.25 2.555 5.25 5.625v.75c0 .414.336.75.75.75h.75a.75.75 0 01.75.75c0 3.038-2.462 5.5-5.5 5.5s-5.5-2.462-5.5-5.5a.75.75 0 01.75-.75h.75a.75.75 0 00.75-.75v-.75z" />
            </svg>
          </div>
        );
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    if (isRead) return "bg-gray-50";
    
    switch (type) {
      case 'emergency_received':
      case 'emergency_routed':
      case 'emergency_acknowledged':
      case 'emergency_update':
        return "bg-red-50 border-l-4 border-red-500";
      default:
        return "bg-blue-50";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Emergency Updates</h2>
                  <p className="text-sm text-gray-500">{emergencyNotifications?.length || 0} emergency notifications</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Emergency Status Summary */}
          {emergencyNotifications && emergencyNotifications.length > 0 && (
            <div className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Your Emergency Reports</h3>
                  <p className="text-sm text-red-700">
                    {emergencyNotifications.filter(n => !n.isRead).length} new updates available
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-800">
                    {emergencyNotifications.length}
                  </div>
                  <div className="text-xs text-red-600">Total alerts</div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('emergency')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'emergency'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Emergency
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 14.25c0-3.07 2.355-5.625 5.25-5.625s5.25 2.555 5.25 5.625v.75c0 .414.336.75.75.75h.75a.75.75 0 01.75.75c0 3.038-2.462 5.5-5.5 5.5s-5.5-2.462-5.5-5.5a.75.75 0 01.75-.75h.75a.75.75 0 00.75-.75v-.75z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No notifications found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {filter === 'emergency' 
                    ? 'No emergency notifications at the moment'
                    : filter === 'unread'
                    ? 'All caught up! No unread notifications'
                    : 'You have no notifications yet'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getNotificationBg(notification.type, notification.isRead)}`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                        {notification.type.startsWith('emergency_') && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                              Emergency Alert
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {filteredNotifications.length > 0 && (
            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Mark All as Read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};