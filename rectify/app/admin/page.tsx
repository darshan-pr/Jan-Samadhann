/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Import admin components
import { AdminSidebar } from './components/AdminSidebar';
import { AdminStats } from './components/AdminStats';
import { PostsTable } from './components/PostsTable';
import { PostView } from './components/PostView';
import { Analytics } from './components/Analytics';
import { DepartmentManagement } from './components/DepartmentManagement';
import { EmergencyManagement } from './components/EmergencyManagement';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  
  // State management
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [adminComments, setAdminComments] = useState<{[key: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<{[key: string]: boolean}>({});

  // Convex queries and mutations
  const highVotePosts = useQuery(api.posts.getPostsWithHighVotes);
  const allPosts = useQuery(api.posts.getAllPosts);
  const emergencyPosts = useQuery(api.emergencyPosts.getAllEmergencyPosts);
  const emergencyStats = useQuery(api.emergencyPosts.getEmergencyStats);
  const pendingEmergencyCount = useQuery(api.emergencyPosts.getPendingEmergencyCount);
  const updatePostStatus = useMutation(api.posts.updatePostStatus);
  const updateEmergencyStatus = useMutation(api.emergencyPosts.updateEmergencyStatus);
  const routeEmergencyToDepartment = useMutation(api.emergencyPosts.routeEmergencyToDepartment);
  const addAdminComment = useMutation(api.comments.addAdminComment);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handlePostStatusUpdate = async (postId: string, newStatus: string) => {
    try {
      await updatePostStatus({
        postId: postId as Id<"posts">,
        status: newStatus as "submitted" | "in_progress" | "resolved" | "rejected",
        adminId: user._id as Id<"admins">
      });
    } catch (error) {
      console.error("Error updating post status:", error);
      alert("Failed to update post status");
    }
  };

  const handleAdminComment = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !user) return;

    try {
      setSubmittingComment({ ...submittingComment, [postId]: true });
      await addAdminComment({
        postId: postId as Id<"posts">,
        adminId: user._id as Id<"admins">,
        text: commentText,
        isPinned: true
      });
      setAdminComments({ ...adminComments, [postId]: "" });
    } catch (error) {
      console.error("Error adding admin comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment({ ...submittingComment, [postId]: false });
    }
  };

  // Calculate statistics
  const totalPosts = allPosts?.length || 0;
  const highVoteCount = highVotePosts?.length || 0;
  const inProgressPosts = allPosts?.filter(p => p.status === 'in_progress').length || 0;
  const resolvedPosts = allPosts?.filter(p => p.status === 'resolved').length || 0;
  const pendingPosts = allPosts?.filter(p => p.status === 'submitted').length || 0;
  const rejectedPosts = allPosts?.filter(p => p.status === 'rejected').length || 0;

  // Get posts based on active section
  const getPostsForSection = () => {
    switch (activeSection) {
      case 'high-priority':
        return highVotePosts || [];
      case 'all-posts':
        return allPosts || [];
      default:
        return highVotePosts || [];
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Admin Dashboard Overview
              </h1>
              <p className="text-slate-600">Monitor and manage community reports efficiently</p>
            </div>
            
            <AdminStats
              totalPosts={totalPosts}
              highVotePosts={highVoteCount}
              inProgressPosts={inProgressPosts}
              resolvedPosts={resolvedPosts}
              pendingPosts={pendingPosts}
              rejectedPosts={rejectedPosts}
            />

            {/* Recent High Priority Posts */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Recent High Priority Posts</h2>
                  <p className="text-slate-600 text-sm">Posts requiring immediate attention</p>
                </div>
                <button
                  onClick={() => setActiveSection('high-priority')}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
                >
                  View All
                </button>
              </div>
              
              {highVotePosts && highVotePosts.length > 0 ? (
                <div className="space-y-4">
                  {highVotePosts.slice(0, 3).map((post) => (
                    <div key={post._id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{post.user?.name?.[0]?.toUpperCase() || "U"}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-slate-800">{post.user?.name}</h3>
                              <span className="text-slate-400 text-sm">•</span>
                              <span className="text-slate-400 text-sm">{post.city}</span>
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{post.description.slice(0, 100)}...</p>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                                {post.issueType}
                              </span>
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs border border-red-200">
                                {post.likes} votes
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setActiveSection('post-detail');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-1 text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No high priority posts at the moment</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Emergency Management</h1>
              <p className="text-slate-600">Monitor and respond to urgent civic emergency reports</p>
            </div>
            
            <EmergencyManagement
              emergencyPosts={emergencyPosts || []}
              emergencyStats={emergencyStats}
              user={user}
              onPostSelect={(post) => {
                setSelectedPost(post);
                setActiveSection('post-detail');
              }}
            />
          </div>
        );

      case 'high-priority':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">High Priority Posts</h1>
              <p className="text-slate-600">Posts with 10+ votes requiring immediate attention ({highVoteCount} posts)</p>
            </div>
            
            <PostsTable
              posts={highVotePosts || []}
              onPostSelect={(post) => {
                setSelectedPost(post);
                setActiveSection('post-detail');
              }}
              selectedPost={selectedPost}
            />
          </div>
        );

      case 'all-posts':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">All Posts</h1>
              <p className="text-slate-600">Complete list of all community reports ({totalPosts} posts)</p>
            </div>
            
            <PostsTable
              posts={allPosts || []}
              onPostSelect={(post) => {
                setSelectedPost(post);
                setActiveSection('post-detail');
              }}
              selectedPost={selectedPost}
            />
          </div>
        );

      case 'departments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Department Management</h1>
              <p className="text-slate-600">Monitor department performance and manage routing status</p>
            </div>
            
            <DepartmentManagement user={user} />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics & Insights</h1>
              <p className="text-slate-600">Comprehensive analysis of community reports and trends</p>
            </div>
            
            <Analytics posts={allPosts || []} />
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">User Management</h1>
              <p className="text-slate-600">Manage community users and their activities</p>
            </div>
            
            <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">User Management</h3>
              <p className="text-slate-500">This feature is coming soon. You&apos;ll be able to manage users, view their activity, and handle user-related issues.</p>
            </div>
          </div>
        );

      case 'post-detail':
        return selectedPost ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveSection('overview')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg px-3 py-2 font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Overview</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Post Details</h1>
                <p className="text-slate-600">Manage and respond to community report</p>
              </div>
            </div>
            
            <PostView
              post={selectedPost}
              user={user}
              onStatusUpdate={handlePostStatusUpdate}
              onAddComment={handleAdminComment}
              isSubmittingComment={submittingComment[selectedPost._id] || false}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No post selected</p>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-500">Select a section from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={handleLogout}
        emergencyCount={pendingEmergencyCount}
      />
      
      <div className="flex-1 ml-64 overflow-auto">
        <main className="p-6 lg:p-8 min-h-screen">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}