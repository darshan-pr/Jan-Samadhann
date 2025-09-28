"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from '../components/ImageCarousel';
import { LikeButton } from '../components/LikeButton';
import { NotificationPanel } from '../components/NotificationPanel';


export default function ExplorePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const posts = useQuery(api.posts.getAllPosts);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, 
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const repostPost = useMutation(api.posts.repostPost);
  const bookmarkPost = useMutation(api.posts.bookmarkPost);

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
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
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Explore
        </div>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </button>
          
          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-80 z-50 border border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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

      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className={`${showMobileMenu ? 'fixed inset-0 z-50 bg-black' : 'hidden'} lg:block lg:relative lg:w-64 xl:w-72 p-4 lg:border-r border-gray-800 lg:min-h-screen`}>
          {showMobileMenu && (
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <div className="space-y-2">
            <div className="text-3xl font-bold mb-8 px-3 bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent" style={{ fontFamily: 'Aptos, sans-serif' }}>
              Jan Samadhan
            </div>
            
            <nav className="space-y-2">
              <a 
                href="/dashboard" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xl font-medium">Home</span>
              </a>
              
              <a 
                href="#" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xl font-medium">Explore</span>
              </a>
              
              <a 
                href="/posts" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                </svg>
                <span className="text-xl font-medium">My Posts</span>
              </a>
              
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowNotifications(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200 relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span className="text-xl font-medium">Notifications</span>
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-2 py-1 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-full lg:max-w-2xl border-r border-gray-800 min-h-screen">
          {/* Header */}
          <div className="hidden lg:block sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Explore
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Discover community issues from everywhere</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative w-12 h-12 bg-gray-800/50 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-700 hover:border-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadCount && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-2xl px-6 py-3 font-bold text-sm shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Report Issue</span>
                  </button>
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

          {/* Mobile Filter Tabs */}
          <div className="lg:hidden flex px-4 py-2 bg-black/80 backdrop-blur-md border-b border-gray-800 overflow-x-auto">
            {[
              { id: "all", label: "All", count: posts?.length || 0 },
              { id: "my-city", label: user.city, count: posts?.filter(p => p.city.toLowerCase() === user.city.toLowerCase()).length || 0 },
              { id: "high-priority", label: "High", count: posts?.filter(p => p.priority === "high").length || 0 },
              { id: "pending", label: "Pending", count: posts?.filter(p => p.status === "submitted" || p.status === "in_progress").length || 0 },
              { id: "resolved", label: "Resolved", count: posts?.filter(p => p.status === "resolved").length || 0 },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-1 px-3 py-2 text-center font-medium rounded-xl transition-colors relative text-sm mx-1 whitespace-nowrap ${
                  activeFilter === filter.id ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-gray-500"
                }`}
              >
                <span>{filter.label}</span>
                <span className="bg-gray-700/50 px-1 py-0.5 rounded-full text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden p-4 border-b border-gray-800">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Stats Overview - Mobile Responsive */}
          <div className="p-4 lg:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-blue-500/30">
              <div className="text-xl lg:text-2xl font-bold text-blue-400">{posts?.length || 0}</div>
              <div className="text-xs lg:text-sm text-blue-300">Total Issues</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-green-500/30">
              <div className="text-xl lg:text-2xl font-bold text-green-400">
                {posts?.filter(p => p.status === "resolved").length || 0}
              </div>
              <div className="text-xs lg:text-sm text-green-300">Resolved</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-yellow-500/30">
              <div className="text-xl lg:text-2xl font-bold text-yellow-400">
                {posts?.filter(p => p.priority === "high").length || 0}
              </div>
              <div className="text-xs lg:text-sm text-yellow-300">High Priority</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-purple-500/30">
              <div className="text-xl lg:text-2xl font-bold text-purple-400">
                {posts?.filter(p => p.city.toLowerCase() === user.city.toLowerCase()).length || 0}
              </div>
              <div className="text-xs lg:text-sm text-purple-300">In {user.city}</div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="px-4 lg:px-6 pb-6">
            {sortedPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-gray-700/50">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2 text-gray-300">
                  {searchQuery ? "No results found" : "No posts to explore"}
                </h3>
                <p className="text-gray-500 mb-6 text-sm lg:text-base">
                  {searchQuery 
                    ? `Try adjusting your search terms or filters.`
                    : "Community posts will appear here as they are created."
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-2xl px-6 lg:px-8 py-3 lg:py-4 font-bold shadow-lg hover:shadow-xl text-sm lg:text-base"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {sortedPosts.map((post) => (
                  <div key={post._id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl">
                    <div className="flex space-x-3 lg:space-x-4">
                      <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm lg:text-lg font-bold">{post.user?.name?.[0].toUpperCase() || "U"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3 flex-wrap">
                          <span className="font-bold text-base lg:text-lg">{post.user?.name || "Unknown"}</span>
                          <span className="text-gray-500 text-sm">@{post.user?.phone?.slice(-4) || "user"}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500 text-xs lg:text-sm">
                            {formatTime(post.createdAt)}
                          </span>
                          <span className="text-gray-500">·</span>
                          <span className="text-blue-400 text-xs lg:text-sm font-medium">{post.city}</span>
                          {post.city.toLowerCase() === user.city.toLowerCase() && (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                              Near You
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-3 lg:mb-4">
                          <div className="flex items-center space-x-2 mb-2 lg:mb-3 flex-wrap gap-2">
                            <span className="inline-flex items-center space-x-1 bg-blue-900/30 text-blue-300 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border border-blue-500/30">
                              <span>{getIssueEmoji(post.issueType)}</span>
                              <span>{post.issueType}</span>
                            </span>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${
                              post.priority === "high" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                              post.priority === "medium" ? "bg-yellow-900/30 text-yellow-300 border-yellow-500/30" :
                              "bg-green-900/30 text-green-300 border-green-500/30"
                            }`}>
                              {post.priority.toUpperCase()} priority
                            </span>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${
                              post.status === "resolved" ? "bg-green-900/30 text-green-300 border-green-500/30" :
                              post.status === "in_progress" ? "bg-blue-900/30 text-blue-300 border-blue-500/30" :
                              post.status === "rejected" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                              "bg-gray-900/30 text-gray-300 border-gray-500/30"
                            }`}>
                              {post.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white text-sm lg:text-lg leading-relaxed">{post.description}</p>
                        </div>
                        
                        <ImageCarousel photos={post.photos} />
                        
                        <div className="flex items-center justify-between text-gray-400">
                          <button className="flex items-center space-x-1 lg:space-x-2 hover:text-blue-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-blue-900/10">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs lg:text-sm font-medium">Reply</span>
                          </button>
                          
                          <button 
                            onClick={() => repostPost({ postId: post._id, userId: user?._id as Id<"users"> })}
                            className="flex items-center space-x-1 lg:space-x-2 hover:text-green-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-green-900/10"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-xs lg:text-sm font-medium">{post.reposts}</span>
                          </button>
                          
                          <LikeButton 
                            postId={post._id}
                            userId={user._id as Id<"users">}
                            likesCount={post.likes}
                          />
                          
                          <button 
                            onClick={() => bookmarkPost({ postId: post._id, userId: user?._id as Id<"users"> })}
                            className="hover:text-blue-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-blue-900/10"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>

                          <button className="hover:text-blue-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-blue-900/10">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {showNotifications && user && user.role === 'user' && (
        <NotificationPanel 
          user={{ ...user, _id: user._id as Id<"users">, createdAt: '' }}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}