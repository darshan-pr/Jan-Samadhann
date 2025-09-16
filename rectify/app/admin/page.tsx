'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ImageCarousel from '../components/ImageCarousel';

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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  
  // Fetch high-vote posts from Convex
  const highVotePosts = useQuery(api.posts.getPostsWithHighVotes);
  const allPosts = useQuery(api.posts.getAllPosts);
  const updatePostStatus = useMutation(api.posts.updatePostStatus);
  const addAdminComment = useMutation(api.comments.addAdminComment);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'high-votes'
  const [adminComments, setAdminComments] = useState<{[key: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<{[key: string]: boolean}>({});

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load reports from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem("communityReports");
    if (savedReports) {
      const reportsData = JSON.parse(savedReports);
      setReports(reportsData);
      setFilteredReports(reportsData);
    }
  }, []);

  // Filter reports based on status and type
  useEffect(() => {
    let filtered = reports;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }
    
    setFilteredReports(filtered);
  }, [reports, selectedStatus, selectedType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleStatusUpdate = (reportId: string, newStatus: string) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus }
        : report
    );
    setReports(updatedReports);
    localStorage.setItem("communityReports", JSON.stringify(updatedReports));
  };

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

  const handleAdminComment = async (postId: string) => {
    const commentText = adminComments[postId]?.trim();
    if (!commentText || !user) return;

    try {
      setSubmittingComment({ ...submittingComment, [postId]: true });
      await addAdminComment({
        postId: postId as Id<"posts">,
        adminId: user._id as Id<"admins">,
        text: commentText,
        isPinned: true // Always pin admin comments
      });
      setAdminComments({ ...adminComments, [postId]: "" });
    } catch (error) {
      console.error("Error adding admin comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment({ ...submittingComment, [postId]: false });
    }
  };

  const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const typeOptions = ['🕳️ Pothole', '🚧 Road Damage', '💧 Water Issue', '🗑️ Waste Management', '💡 Street Light', '🚦 Traffic Signal', '🌳 Trees/Vegetation', '📋 Other'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-900/30 text-red-300';
      case 'In Progress': return 'bg-yellow-900/30 text-yellow-300';
      case 'Resolved': return 'bg-green-900/30 text-green-300';
      case 'Closed': return 'bg-gray-900/30 text-gray-300';
      default: return 'bg-gray-900/30 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Manage community reports</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold">{user.email}</p>
              <p className="text-gray-400 text-sm">Administrator</p>
            </div>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center relative"
            >
              <span className="text-sm font-bold">A</span>
              
              {/* Profile Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 bg-gray-800 rounded-lg shadow-lg p-4 min-w-48 z-50">
                  <div className="border-b border-gray-700 pb-3 mb-3">
                    <p className="font-semibold">{user.email}</p>
                    <p className="text-gray-400 text-sm">Administrator</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-1 text-red-400 hover:bg-gray-700 rounded"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-blue-300 text-sm font-medium">Total Posts</h3>
            <p className="text-2xl font-bold text-blue-400">{allPosts?.length || 0}</p>
            <p className="text-xs text-blue-300/70 mt-1">All community posts</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-lg p-4 border border-red-500/30">
            <h3 className="text-red-300 text-sm font-medium">High-Vote Posts</h3>
            <p className="text-2xl font-bold text-red-400">
              {highVotePosts?.length || 0}
            </p>
            <p className="text-xs text-red-300/70 mt-1">Posts with 10+ votes</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-lg p-4 border border-yellow-500/30">
            <h3 className="text-yellow-300 text-sm font-medium">In Progress</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {allPosts?.filter(p => p.status === 'in_progress').length || 0}
            </p>
            <p className="text-xs text-yellow-300/70 mt-1">Being addressed</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-lg p-4 border border-green-500/30">
            <h3 className="text-green-300 text-sm font-medium">Resolved</h3>
            <p className="text-2xl font-bold text-green-400">
              {allPosts?.filter(p => p.status === 'resolved').length || 0}
            </p>
            <p className="text-xs text-green-300/70 mt-1">Successfully completed</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-900/50 rounded-lg p-1 mb-6 flex">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'reports' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Community Reports
          </button>
          <button
            onClick={() => setActiveTab('high-votes')}
            className={`flex-1 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'high-votes' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            High-Vote Posts ({highVotePosts?.length || 0})
          </button>
        </div>

        {/* Conditional Content */}
        {activeTab === 'reports' ? (
          <>
            {/* Filters */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Filters</h3>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Types</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-gray-900/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {filteredReports.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No reports found</h3>
                    <p>Try adjusting your filters or wait for new reports.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Description</th>
                        <th className="text-left p-4 font-medium">Location</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Upvotes</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report, index) => (
                        <tr key={report.id} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800/30' : ''}`}>
                          <td className="p-4">
                            <span className="inline-block bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                              {report.type}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="truncate" title={report.description}>
                              {report.description}
                            </p>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="truncate text-sm text-gray-400" title={report.location}>
                              {report.location}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="text-sm">{report.upvotes}</span>
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <select
                              value={report.status}
                              onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 transition-colors"
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        ) : (
          /* High-Vote Posts Section */
          <div className="bg-gray-900/50 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold mb-2">Posts with High Community Support (10+ Votes)</h3>
              <p className="text-gray-400">These posts require immediate attention from administrators</p>
            </div>
            
            {!highVotePosts || highVotePosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No high-vote posts</h3>
                <p>No posts have reached 10+ votes yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {highVotePosts.map((post) => (
                  <div key={post._id} className="p-6">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold">{post.user?.name?.[0]?.toUpperCase() || "U"}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{post.user?.name || "Unknown User"}</h4>
                          <p className="text-gray-400 text-sm">Phone: {post.user?.phone || "N/A"}</p>
                          <p className="text-gray-400 text-sm">Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
                          {post.likes} votes
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          post.priority === "high" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                          post.priority === "medium" ? "bg-yellow-900/30 text-yellow-300 border-yellow-500/30" :
                          "bg-green-900/30 text-green-300 border-green-500/30"
                        }`}>
                          {post.priority} priority
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                          {post.issueType}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          post.status === "resolved" ? "bg-green-900/30 text-green-300 border-green-500/30" :
                          post.status === "in_progress" ? "bg-blue-900/30 text-blue-300 border-blue-500/30" :
                          post.status === "rejected" ? "bg-red-900/30 text-red-300 border-red-500/30" :
                          "bg-gray-900/30 text-gray-300 border-gray-500/30"
                        }`}>
                          {post.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-white mb-3">{post.description}</p>
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                        <h5 className="font-semibold text-sm text-gray-400 mb-1">Location</h5>
                        <p className="text-white">{post.address}, {post.city}</p>
                        {post.coordinates && (
                          <p className="text-gray-400 text-sm mt-1">
                            Coordinates: {post.coordinates.lat.toFixed(6)}, {post.coordinates.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Images */}
                    <ImageCarousel photos={post.photos} />

                    {/* Admin Actions */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Update Status</label>
                          <select
                            value={post.status}
                            onChange={(e) => handlePostStatusUpdate(post._id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Admin Comment */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Add Admin Comment (will be pinned)</label>
                        <div className="flex space-x-3">
                          <textarea
                            value={adminComments[post._id] || ""}
                            onChange={(e) => setAdminComments({ ...adminComments, [post._id]: e.target.value })}
                            placeholder="Write an official response to this post..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                            rows={3}
                          />
                          <button
                            onClick={() => handleAdminComment(post._id)}
                            disabled={!adminComments[post._id]?.trim() || submittingComment[post._id]}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                          >
                            {submittingComment[post._id] ? "Posting..." : "Post Comment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}