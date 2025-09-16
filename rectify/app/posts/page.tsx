"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from '../components/ImageCarousel';

export default function PostsPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const posts = useQuery(api.posts.getAllPosts);
  const toggleLike = useMutation(api.posts.toggleLike);
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

  // Filter posts to show only user's own posts
  const userPosts = posts?.filter(post => post.userId === user._id) || [];

  // Further filter based on active tab
  const filteredPosts = userPosts.filter(post => {
    if (activeTab === "resolved") return post.status === "resolved";
    if (activeTab === "pending") return post.status === "submitted" || post.status === "in_progress";
    return true; // "all" tab shows all user posts
  });

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
          My Posts
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
                  <span className="text-blue-400">{userPosts.length}</span>
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

      <div className="flex max-w-7xl mx-auto min-h-screen">
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
            <div className="text-3xl font-bold mb-8 px-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Rectify
            </div>
            
            <nav className="space-y-2">
              <a href="/dashboard" className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xl font-medium">Home</span>
              </a>
              
              <a href="/explore" className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xl font-medium">Explore</span>
              </a>
              
              <a href="/posts" className="flex items-center space-x-4 px-4 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
                <span className="text-xl font-medium">My Posts</span>
              </a>
              
              <a href="#" className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5 17h5v5H5v-5zM5 3h5v5H5V3zM15 3h5v5h-5V3z" />
                </svg>
                <span className="text-xl font-medium">Notifications</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-2 py-1 animate-pulse">3</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl border-r border-gray-800 min-h-screen">
          {/* Header */}
          <div className="hidden lg:block sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10">
            <div className="flex items-center justify-between p-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  My Posts
                </h1>
                <p className="text-gray-400 text-sm mt-1">Your community contributions</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-2xl px-6 py-3 font-bold text-sm shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Post</span>
                </button>
                
                {/* Desktop Profile Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 top-14 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-80 z-50 border border-gray-700">
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
                          <span className="text-blue-400">{userPosts.length}</span>
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
            </div>
            
            {/* Filter Tabs */}
            <div className="flex px-6 pb-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 px-4 py-4 text-center font-medium hover:bg-gray-900/50 transition-colors relative ${
                  activeTab === "all" ? "text-white" : "text-gray-500"
                }`}
              >
                All Posts ({userPosts.length})
                {activeTab === "all" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 px-4 py-4 text-center font-medium hover:bg-gray-900/50 transition-colors relative ${
                  activeTab === "pending" ? "text-white" : "text-gray-500"
                }`}
              >
                Pending ({userPosts.filter(p => p.status === "submitted" || p.status === "in_progress").length})
                {activeTab === "pending" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-yellow-500 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`flex-1 px-4 py-4 text-center font-medium hover:bg-gray-900/50 transition-colors relative ${
                  activeTab === "resolved" ? "text-white" : "text-gray-500"
                }`}
              >
                Resolved ({userPosts.filter(p => p.status === "resolved").length})
                {activeTab === "resolved" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Filter Tabs */}
          <div className="lg:hidden flex px-4 py-2 bg-black/80 backdrop-blur-md border-b border-gray-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-3 py-2 text-center font-medium rounded-xl transition-colors relative text-sm ${
                activeTab === "all" ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-gray-500"
              }`}
            >
              All ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-3 py-2 text-center font-medium rounded-xl transition-colors relative text-sm mx-1 ${
                activeTab === "pending" ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30" : "text-gray-500"
              }`}
            >
              Pending ({userPosts.filter(p => p.status === "submitted" || p.status === "in_progress").length})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`flex-1 px-3 py-2 text-center font-medium rounded-xl transition-colors relative text-sm ${
                activeTab === "resolved" ? "bg-green-600/20 text-green-400 border border-green-500/30" : "text-gray-500"
              }`}
            >
              Resolved ({userPosts.filter(p => p.status === "resolved").length})
            </button>
          </div>

          {/* Stats Cards */}
          <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-blue-400">{userPosts.length}</div>
                  <div className="text-xs lg:text-sm text-gray-400">Total Posts</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-green-400">
                    {userPosts.filter(p => p.status === "resolved").length}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-400">Resolved</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-bold text-red-400">
                    {userPosts.reduce((acc, post) => acc + post.likes, 0)}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-400">Total Likes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="p-4 lg:p-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-gray-700/50">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl font-bold mb-2 text-gray-300">
                  {activeTab === "all" ? "No posts yet" : 
                   activeTab === "pending" ? "No pending posts" : 
                   "No resolved posts"}
                </h3>
                <p className="text-gray-500 mb-6 text-sm lg:text-base">
                  {activeTab === "all" ? "Start contributing to your community by creating your first post!" : 
                   activeTab === "pending" ? "All your posts have been resolved!" : 
                   "No posts have been resolved yet."}
                </p>
                {activeTab === "all" && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-2xl px-6 lg:px-8 py-3 lg:py-4 font-bold shadow-lg hover:shadow-xl text-sm lg:text-base"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {filteredPosts.map((post) => (
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
                          <span className="text-gray-500 text-xs lg:text-sm">{post.city}</span>
                        </div>
                        
                        <div className="mb-3 lg:mb-4">
                          <div className="flex items-center space-x-2 mb-2 lg:mb-3 flex-wrap gap-2">
                            <span className="inline-block bg-blue-900/30 text-blue-300 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border border-blue-500/30">
                              {post.issueType}
                            </span>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${
                              post.priority === "high" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                              post.priority === "medium" ? "bg-yellow-900/30 text-yellow-300 border-yellow-500/30" :
                              "bg-green-900/30 text-green-300 border-green-500/30"
                            }`}>
                              {post.priority} priority
                            </span>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border ${
                              post.status === "resolved" ? "bg-green-900/30 text-green-300 border-green-500/30" :
                              post.status === "in_progress" ? "bg-blue-900/30 text-blue-300 border-blue-500/30" :
                              post.status === "rejected" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                              "bg-gray-900/30 text-gray-300 border-gray-500/30"
                            }`}>
                              {post.status.replace("_", " ")}
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
                            onClick={() => repostPost({ postId: post._id, userId: user._id as Id<"users"> })}
                            className="flex items-center space-x-1 lg:space-x-2 hover:text-green-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-green-900/10"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-xs lg:text-sm font-medium">{post.reposts}</span>
                          </button>
                          
                          <button 
                            onClick={() => toggleLike({ postId: post._id, userId: user._id as Id<"users"> })}
                            className="flex items-center space-x-1 lg:space-x-2 hover:text-red-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-red-900/10"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-xs lg:text-sm font-medium">{post.likes}</span>
                          </button>
                          
                          <button 
                            onClick={() => bookmarkPost({ postId: post._id, userId: user._id as Id<"users"> })}
                            className="hover:text-blue-400 transition-colors p-2 lg:p-3 rounded-xl hover:bg-blue-900/10"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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

        {/* Right Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden xl:block w-80 p-6 space-y-6">
          <div className="sticky top-4 space-y-6">
            {/* Enhanced User Profile Card */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-blue-400">{userPosts.length}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-green-400">{userPosts.filter(p => p.status === 'resolved').length}</div>
                  <div className="text-xs text-gray-400">Resolved</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-2xl py-3 px-4 font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create New Post</span>
                </button>
                <button
                  onClick={() => router.push('/explore')}
                  className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-2xl py-3 px-4 font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Explore Posts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}