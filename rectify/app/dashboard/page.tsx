'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PostCard } from "../components/PostCard";
import { NotificationPanel } from "@/app/components/NotificationPanel";
import { PostModal } from "@/app/components/PostModal";
import { FloatingPostButton } from "@/app/components/FloatingPostButton";

interface Report {
  id: string;
  type: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  timestamp: string;
  status: string;
  upvotes: number;
  image?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Convex queries
  const posts = useQuery(api.posts.getAllPosts);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, 
    user ? { userId: user._id as Id<"users"> } : "skip"
  );
  const trendingIssues = useQuery(api.posts.getCityTrendingIssues,
    user && user.role === 'user' ? { city: user.city } : "skip"
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'user')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load reports from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem("communityReports");
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem("communityReports", JSON.stringify(reports));
    }
  }, [reports]);

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
          Rectify
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-xl hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h16a1 1 0 001-1v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a1 1 0 001 1z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v4m0 0l-2-2m2 2l2-2" />
            </svg>
            {unreadCount && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-2 py-1 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
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
            <div className="text-3xl font-bold mb-8 px-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Rectify
            </div>
            
            <nav className="space-y-2">
              <a 
                href="#" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="text-xl font-medium">Home</span>
              </a>
              
              <a 
                href="/explore" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200"
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5 17h5v5H5v-5zM5 3h5v5H5V3zM15 3h5v5h-5V3z" />
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
          {/* Simple Header - No tabs */}
          <div className="hidden lg:block sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Community Feed
                </h1>
                <p className="text-gray-400 text-sm mt-1">Share and discover community issues</p>
              </div>
              
              {/* Desktop Profile Button */}
              <div className="flex items-center space-x-4">
                {/* Desktop Create Post Button */}
                <button
                  onClick={() => setShowPostModal(true)}
                  className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-2xl px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Post</span>
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
            </div>
          </div>

          {/* Post Composer Component */}
          {/* Removed inline PostComposer - now using modal */}

          {/* Feed */}
          <div className="divide-y divide-gray-800">
            {!posts || posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                <p>Be the first to report a community issue!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  user={user && user.role === 'user' ? { ...user, _id: user._id as Id<"users">, createdAt: '' } : { _id: '' as Id<"users">, name: '', phone: '', city: '', role: 'user' as const, createdAt: '' }} 
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 p-4 space-y-4">
          <div className="sticky top-4 space-y-4">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search Rectify"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-colors backdrop-blur-sm"
              />
            </div>

            {/* Enhanced User Info Card */}
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
                  <div className="text-2xl font-bold text-blue-400">{posts?.filter(p => p.userId === user._id).length || 0}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-green-400">{posts?.filter(p => p.userId === user._id && p.status === 'resolved').length || 0}</div>
                  <div className="text-xs text-gray-400">Resolved</div>
                </div>
              </div>
            </div>

            {/* Enhanced Trending Issues */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Trending Issues
              </h2>
              <div className="space-y-4">
                {!trendingIssues || trendingIssues.filter(issue => issue.count > 0).length === 0 ? (
                  <div className="text-center text-gray-500 py-6">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm">No trending issues yet</p>
                    <p className="text-xs text-gray-600">Report more issues to see trends</p>
                  </div>
                ) : (
                  trendingIssues
                    .filter(issue => issue.count > 0) // Hide categories with zero count
                    .map((issue, index) => {
                      const trendingColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'];
                      const progressColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
                      const colorIndex = index % trendingColors.length;
                      
                      // Calculate progress percentage based on relative trending score
                      const maxScore = trendingIssues.filter(i => i.count > 0)[0]?.trendingScore || 1;
                      const progressPercent = Math.round((issue.trendingScore / maxScore) * 100);
                      
                      return (
                        <div key={issue.issueType} className="hover:bg-gray-800/50 p-4 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-600/50">
                          <div className="text-gray-500 text-xs mb-1">
                            Trending in {user && user.role === 'user' ? user.city : 'Your Area'}
                          </div>
                          <div className={`font-bold text-lg ${trendingColors[colorIndex]} flex items-center justify-between`}>
                            <span>#{issue.issueType.replace(/[^a-zA-Z]/g, '')}</span>
                            <span className="text-sm font-normal bg-gray-800/50 px-2 py-1 rounded-full">
                              {issue.count} posts
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs mb-2 flex flex-wrap gap-2">
                            <span>{issue.totalLikes} likes</span>
                            <span>•</span>
                            <span>{issue.totalComments} comments</span>
                            {issue.recentActivity > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-400">{issue.recentActivity} recent</span>
                              </>
                            )}
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div 
                              className={`${progressColors[colorIndex]} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 flex justify-between">
                            <span>Score: {Math.round(issue.trendingScore)}</span>
                            <span>#{index + 1}</span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
              
              <button className="text-blue-400 hover:text-blue-300 transition-colors mt-4 text-sm font-medium flex items-center">
                <span>Show more</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Post Button */}
      <FloatingPostButton onClick={() => setShowPostModal(true)} />
      
      {/* Post Modal */}
      {showPostModal && user && user.role === 'user' && (
        <PostModal 
          user={{ ...user, _id: user._id as Id<"users">, createdAt: '' }}
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
        />
      )}
      
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
