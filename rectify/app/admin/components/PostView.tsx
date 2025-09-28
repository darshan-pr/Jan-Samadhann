/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from '@/convex/_generated/dataModel';
import ImageCarousel from '../../components/ImageCarousel';

interface PostViewProps {
  post: any;
  user: any; // Add user prop for admin ID
  onStatusUpdate: (postId: string, status: string) => void;
  onAddComment: (postId: string, comment: string) => void;
  isSubmittingComment: boolean;
}

export const PostView = ({ post, user, onStatusUpdate, onAddComment, isSubmittingComment }: PostViewProps) => {
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(post.status);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [routingPriority, setRoutingPriority] = useState('medium');
  const [routingNotes, setRoutingNotes] = useState('');
  const [expectedResolution, setExpectedResolution] = useState('');

  // Convex queries
  const departments = useQuery(api.departments.getActiveDepartments);
  const postRouting = useQuery(api.departments.getPostRouting, { postId: post._id as Id<"posts"> });
  
  // Mutations
  const routePostToDepartment = useMutation(api.departments.routePostToDepartment);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    onStatusUpdate(post._id, newStatus);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onAddComment(post._id, comment);
      setComment('');
    }
  };

  const handleDepartmentRouting = async () => {
    if (!selectedDepartment || !user) return;
    
    try {      
      await routePostToDepartment({
        postId: post._id as Id<"posts">,
        departmentId: selectedDepartment as Id<"departments">,
        routedBy: user._id as Id<"admins">,
        priority: routingPriority as "low" | "medium" | "high" | "urgent",
        notes: routingNotes || undefined,
        expectedResolutionTime: expectedResolution || undefined,
      });
      
      setShowDepartmentModal(false);
      setSelectedDepartment('');
      setRoutingNotes('');
      setExpectedResolution('');
    } catch (error) {
      console.error("Error routing to department:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">{post.user?.name?.[0]?.toUpperCase() || "U"}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{post.user?.name || "Unknown User"}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                <span>📱 {post.user?.phone || "N/A"}</span>
                <span>📍 {post.city}</span>
                <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-200 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>{post.likes} votes</span>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(post.priority)}`}>
              {post.priority?.toUpperCase()} PRIORITY
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Issue Type and Status */}
        <div className="flex items-center space-x-3 mb-6">
          <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
            📝 {post.issueType}
          </span>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(post.status)}`}>
            {post.status.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Department Routing Info */}
        {postRouting && (
          <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Routed to Department
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-600 text-sm">Department:</span>
                <p className="text-slate-800 font-medium">{postRouting.department?.name}</p>
              </div>
              <div>
                <span className="text-slate-600 text-sm">Status:</span>
                <p className="text-slate-800 font-medium capitalize">{postRouting.status.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-slate-600 text-sm">Priority:</span>
                <p className="text-slate-800 font-medium capitalize">{postRouting.priority}</p>
              </div>
              <div>
                <span className="text-slate-600 text-sm">Routed On:</span>
                <p className="text-slate-800 font-medium">{new Date(postRouting.routedAt).toLocaleDateString()}</p>
              </div>
              {postRouting.notes && (
                <div className="md:col-span-2">
                  <span className="text-slate-600 text-sm">Notes:</span>
                  <p className="text-slate-800 font-medium">{postRouting.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Issue Description</h4>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-slate-700 leading-relaxed">{post.description}</p>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Location Details</h4>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-600 text-sm">Address:</span>
                <p className="text-slate-800 font-medium">{post.address || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-slate-600 text-sm">City:</span>
                <p className="text-slate-800 font-medium">{post.city}</p>
              </div>
              {post.coordinates && (
                <div className="md:col-span-2">
                  <span className="text-slate-600 text-sm">Coordinates:</span>
                  <p className="text-slate-800 font-medium">
                    {post.coordinates.lat.toFixed(6)}, {post.coordinates.lng.toFixed(6)}
                    <a 
                      href={`https://www.google.com/maps/place/${post.coordinates.lat}%2C${post.coordinates.lng}/@${post.coordinates.lat},${post.coordinates.lng},17z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View on Google Maps
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        {post.photos && post.photos.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-3">Images</h4>
            <ImageCarousel photos={post.photos} />
          </div>
        )}

        {/* Admin Actions */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Actions
          </h4>
          
          <div className="space-y-4">
            {/* Department Routing */}
            {!postRouting && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Route to Department</label>
                <button
                  onClick={() => setShowDepartmentModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Route to Department</span>
                </button>
              </div>
            )}

            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="submitted">📋 Submitted</option>
                <option value="in_progress">⚡ In Progress</option>
                <option value="resolved">✅ Resolved</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>

            {/* Admin Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Official Response
                <span className="text-xs text-slate-500 ml-2">(This comment will be pinned)</span>
              </label>
              <div className="space-y-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write an official response to this post. This will be visible to the user and marked as an admin comment..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  rows={4}
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim() || isSubmittingComment}
                  className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{isSubmittingComment ? "Posting..." : "Post Official Response"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Routing Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Route to Department</h3>
              <p className="text-slate-600 text-sm mt-1">Assign this issue to a specific department for resolution</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a department...</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} - {dept.head}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority Level</label>
                <select
                  value={routingPriority}
                  onChange={(e) => setRoutingPriority(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Expected Resolution */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expected Resolution Time</label>
                <input
                  type="text"
                  value={expectedResolution}
                  onChange={(e) => setExpectedResolution(e.target.value)}
                  placeholder="e.g., 24 hours, 3 days, 1 week"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                <textarea
                  value={routingNotes}
                  onChange={(e) => setRoutingNotes(e.target.value)}
                  placeholder="Any special instructions or context for the department..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDepartmentRouting}
                disabled={!selectedDepartment}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Route to Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};