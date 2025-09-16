"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from '../components/ImageCarousel';
import { NotificationPanel } from "@/app/components/NotificationPanel";
import { BadgeShop } from "@/app/components/BadgeShop";
import { PostCreationModal } from "@/app/components/PostCreationModal";


export default function ExplorePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBadgeShop, setShowBadgeShop] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const posts = useQuery(api.posts.getAllPosts);
  const likePost = useMutation(api.posts.likePost);
  const repostPost = useMutation(api.posts.repostPost);
  const bookmarkPost = useMutation(api.posts.bookmarkPost);
  
  // Additional queries for navigation features
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, 
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const userPoints = useQuery(api.points.getUserPoints,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const equippedBadge = useQuery(api.badges.getEquippedBadge,
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'user')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return null;
  }
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  // Filter and search posts
  const filteredPosts = posts?.filter(post => {
    // Search filter
    if (searchQuery && !post.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.issueType.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.city.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (activeFilter === "resolved") return post.status === "resolved";
    if (activeFilter === "pending") return post.status === "submitted" || post.status === "in_progress";
    if (activeFilter === "high-priority") return post.priority === "high";
    if (activeFilter === "my-city") return post.city.toLowerCase() === user.city.toLowerCase();
    
    return true; // "all" shows everything
  }) || [];

  // Sort posts by creation date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const issueTypes = [
    "🕳️ Pothole",
    "🚧 Road Damage", 
    "💧 Water Issue",
    "🗑️ Waste Management",
    "💡 Street Light",
    "🚦 Traffic Signal",
    "🌳 Trees/Vegetation",
    "📋 Other"
  ];

  const getIssueEmoji = (issueType: string) => {
    const type = issueTypes.find(t => t.includes(issueType));
    return type ? type.split(' ')[0] : "📋";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50 safe-area-inset">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-xl hover:bg-gray-800 transition-all duration-200"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className="h-0.5 bg-white w-full rounded-full"></div>
            <div className="h-0.5 bg-white w-full rounded-full"></div>
            <div className="h-0.5 bg-white w-full rounded-full"></div>
          </div>
        </button>
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Rectify
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </button>
          
          {/* Mobile Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-80 z-50 border border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-gray-400 text-sm">@{user.phone.slice(-4)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white">{user.city}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white">{user.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Posts</span>
                  <span className="text-blue-400">{posts?.filter(p => p.userId === user._id).length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rectify Points</span>
                  <span className="text-yellow-400 font-medium">⭐ {userPoints || 0}</span>
                </div>
                {equippedBadge?.badge ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Badge</span>
                    <span className="flex items-center space-x-2">
                      <span className="text-xl">{equippedBadge.badge.icon}</span>
                      <div className="text-right">
                        <div className="text-white font-medium">{equippedBadge.badge.name}</div>
                        <div className="text-xs text-purple-400 capitalize">{equippedBadge.badge.rarity}</div>
                      </div>
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Badge</span>
                    <span className="text-gray-500">None equipped</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 transition-colors rounded-xl py-3 px-4 font-medium flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto safe-area-inset responsive-spacing lg:px-6">
        {/* Left Sidebar */}
        <div className={`${showMobileMenu ? 'fixed inset-0 z-50 bg-black/95 backdrop-blur-md' : 'hidden'} lg:block lg:relative lg:w-64 xl:w-72 lg:p-4 lg:border-r border-gray-800 lg:min-h-screen`}>
          {showMobileMenu && (
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="lg:hidden absolute top-4 right-4 p-3 rounded-full hover:bg-gray-800 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <div className="space-y-4 mt-12 lg:mt-0 p-4 lg:p-0">
            <div className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 px-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Rectify
            </div>
            
            <nav className="space-y-3 lg:space-y-2">
              <a 
                href="/dashboard" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 lg:space-x-4 px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-gray-800/50 transition-all duration-200 mobile-nav-item"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="text-lg lg:text-xl font-medium">Home</span>
              </a>
              
              <a 
                href="#" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 lg:space-x-4 px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 transition-all duration-200 mobile-nav-item"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg lg:text-xl font-medium">Explore</span>
              </a>
              
              <a 
                href="/posts" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 lg:space-x-4 px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-gray-800/50 transition-all duration-200 mobile-nav-item"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h1m-1 1v1m0-1h1m-1 1v1h1v-1z" />
                </svg>
                <span className="text-lg lg:text-xl font-medium">My Posts</span>
              </a>
              
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowNotifications(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-3 lg:space-x-4 px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-gray-800/50 transition-all duration-200 relative mobile-nav-item"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h16a1 1 0 001-1v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a1 1 0 001 1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v4m0 0l-2-2m2 2l2-2" />
                </svg>
                <span className="text-lg lg:text-xl font-medium">Notifications</span>
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-2 py-1 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </a>
              
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowBadgeShop(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-3 lg:space-x-4 px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-gray-800/50 transition-all duration-200 mobile-nav-item"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-lg lg:text-xl font-medium">Badge Shop</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-full lg:max-w-4xl lg:border-r border-gray-800 min-h-screen px-0 sm:px-1 lg:px-0 mobile-uniform-spacing">
          {/* Create Post Button - Mobile Floating Action Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 mobile-touch-target"
              style={{ bottom: 'max(24px, env(safe-area-inset-bottom))' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {/* Header */}
          <div className="hidden lg:block sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Explore
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Discover community issues from everywhere</p>
                </div>
                
                {/* Desktop Profile and Notification Section */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowCreatePostModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 rounded-2xl px-6 py-3 font-bold text-sm shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Report Issue</span>
                  </button>
                  
                  {/* Desktop Notification Button */}
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative w-12 h-12 bg-gray-800/50 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-700 hover:border-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h16a1 1 0 001-1v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a1 1 0 001 1z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v4m0 0l-2-2m2 2l2-2" />
                    </svg>
                    {unreadCount && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-2 py-1 animate-pulse min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <span className="text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </button>
                    
                    {showProfileMenu && (
                      <div className="absolute right-0 top-14 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-80 z-50 border border-gray-700">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <p className="text-gray-400 text-sm">@{user.phone.slice(-4)}</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Location</span>
                            <span className="text-white">{user.city}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Phone</span>
                            <span className="text-white">{user.phone}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Posts</span>
                            <span className="text-blue-400">{posts?.filter(p => p.userId === user._id).length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Rectify Points</span>
                            <span className="text-yellow-400 font-medium">⭐ {userPoints || 0}</span>
                          </div>
                          {equippedBadge?.badge && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Badge</span>
                              <span className="flex items-center space-x-1">
                                <span className="text-lg">{equippedBadge.badge.icon}</span>
                                <span className="text-white">{equippedBadge.badge.name}</span>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full mt-6 bg-red-600 hover:bg-red-700 transition-colors rounded-xl py-3 px-4 font-medium flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search issues, locations, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors backdrop-blur-sm text-lg"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 overflow-x-auto pb-2">
              {[
                { id: "all", label: "All Issues", count: posts?.length || 0 },
                { id: "my-city", label: `${user.city}`, count: posts?.filter(p => p.city.toLowerCase() === user.city.toLowerCase()).length || 0 },
                { id: "high-priority", label: "High Priority", count: posts?.filter(p => p.priority === "high").length || 0 },
                { id: "pending", label: "Pending", count: posts?.filter(p => p.status === "submitted" || p.status === "in_progress").length || 0 },
                { id: "resolved", label: "Resolved", count: posts?.filter(p => p.status === "resolved").length || 0 },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-medium transition-all duration-200 whitespace-nowrap ${
                    activeFilter === filter.id 
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className="bg-gray-700/50 px-2 py-1 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{posts?.length || 0}</div>
            <div className="text-sm text-blue-300">Total Issues</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {posts?.filter(p => p.status === "resolved").length || 0}
            </div>
            <div className="text-sm text-green-300">Resolved</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">
              {posts?.filter(p => p.priority === "high").length || 0}
            </div>
            <div className="text-sm text-yellow-300">High Priority</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">
              {posts?.filter(p => p.city.toLowerCase() === user.city.toLowerCase()).length || 0}
            </div>
            <div className="text-sm text-purple-300">In {user.city}</div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="px-6 pb-6">
          {sortedPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center border border-gray-700/50">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-300">
                {searchQuery ? "No results found" : "No posts to explore"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `Try adjusting your search terms or filters.`
                  : "Community posts will appear here as they are created."
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 rounded-2xl px-8 py-4 font-bold shadow-lg hover:shadow-xl"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {sortedPosts.map((post) => (
                <div key={post._id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold">{post.user?.name?.[0].toUpperCase() || "U"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3 flex-wrap">
                        <span className="font-bold text-lg">{post.user?.name || "Unknown"}</span>
                        <span className="text-gray-500">@{post.user?.phone?.slice(-4) || "user"}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                          {formatTime(post.createdAt)}
                        </span>
                        <span className="text-gray-500">·</span>
                        <span className="text-blue-400 text-sm font-medium">{post.city}</span>
                        {post.city.toLowerCase() === user.city.toLowerCase() && (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                            Near You
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-3 flex-wrap">
                          <span className="inline-flex items-center space-x-1 bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                            <span>{getIssueEmoji(post.issueType)}</span>
                            <span>{post.issueType}</span>
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            post.priority === "high" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                            post.priority === "medium" ? "bg-yellow-900/30 text-yellow-300 border-yellow-500/30" :
                            "bg-green-900/30 text-green-300 border-green-500/30"
                          }`}>
                            {post.priority.toUpperCase()} priority
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            post.status === "resolved" ? "bg-green-900/30 text-green-300 border-green-500/30" :
                            post.status === "in_progress" ? "bg-blue-900/30 text-blue-300 border-blue-500/30" :
                            post.status === "rejected" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                            "bg-gray-900/30 text-gray-300 border-gray-500/30"
                          }`}>
                            {post.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white text-lg leading-relaxed">{post.description}</p>
                      </div>
                      
                      <ImageCarousel photos={post.photos} />
                      
                      <div className="flex items-center justify-between text-gray-400">
                        <button className="flex items-center space-x-2 hover:text-blue-400 transition-colors p-3 rounded-xl hover:bg-blue-900/10">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm font-medium">Reply</span>
                        </button>
                        
                        <button 
                          onClick={() => repostPost({ postId: post._id, userId: user?._id as Id<"users"> })}
                          className="flex items-center space-x-2 hover:text-green-400 transition-colors p-3 rounded-xl hover:bg-green-900/10"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-sm font-medium">{post.reposts}</span>
                        </button>
                        
                        <button 
                          onClick={() => likePost({ postId: post._id, userId: user?._id as Id<"users"> })}
                          className="flex items-center space-x-2 hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-red-900/10"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        
                        <button 
                          onClick={() => bookmarkPost({ postId: post._id, userId: user?._id as Id<"users"> })}
                          className="hover:text-blue-400 transition-colors p-3 rounded-xl hover:bg-blue-900/10"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>

                        <button className="hover:text-blue-400 transition-colors p-3 rounded-xl hover:bg-blue-900/10">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Notification Panel */}
      {showNotifications && user && (
        <NotificationPanel 
          user={user}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Badge Shop */}
      {showBadgeShop && user && (
        <BadgeShop 
          user={user}
          isOpen={showBadgeShop}
          onClose={() => setShowBadgeShop(false)}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && user && (
        <PostCreationModal 
          user={user}
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
        />
      )}
    </div>
  );
}