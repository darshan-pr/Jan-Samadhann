/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EmergencyManagementProps {
  emergencyPosts: any[];
  emergencyStats: any;
  user: any;
  onPostSelect: (post: any) => void;
}

export const EmergencyManagement = ({ emergencyPosts, emergencyStats, user, onPostSelect }: EmergencyManagementProps) => {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'critical' | 'urgent' | 'high'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'submitted' | 'in_progress' | 'resolved' | 'rejected'>('all');
  const [showRouting, setShowRouting] = useState<string | null>(null);
  const [routingData, setRoutingData] = useState({
    departmentId: '',
    priority: 'urgent' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    expectedResolutionTime: '',
  });

  const departments = useQuery(api.departments.getAllDepartments);
  const routeEmergencyToDepartment = useMutation(api.emergencyPosts.routeEmergencyToDepartment);
  const updateEmergencyStatus = useMutation(api.emergencyPosts.updateEmergencyStatus);

  const filteredPosts = emergencyPosts?.filter(post => {
    if (selectedLevel !== 'all' && post.emergencyLevel !== selectedLevel) return false;
    if (selectedStatus !== 'all' && post.status !== selectedStatus) return false;
    return true;
  }) || [];

  const handleRouteEmergency = async (postId: string) => {
    if (!routingData.departmentId) {
      alert('Please select a department');
      return;
    }

    try {
      await routeEmergencyToDepartment({
        postId: postId as Id<"posts">,
        departmentId: routingData.departmentId as Id<"departments">,
        adminId: user._id as Id<"admins">,
        priority: routingData.priority,
        notes: routingData.notes || undefined,
        expectedResolutionTime: routingData.expectedResolutionTime || undefined,
      });

      setShowRouting(null);
      setRoutingData({
        departmentId: '',
        priority: 'urgent',
        notes: '',
        expectedResolutionTime: '',
      });

      alert('Emergency successfully routed to department!');
    } catch (error) {
      console.error('Error routing emergency:', error);
      alert('Failed to route emergency. Please try again.');
    }
  };

 

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ${minutes}m ago`;
    return date.toLocaleString();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-2xl font-bold text-red-900">{emergencyStats?.byLevel?.critical || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Urgent</p>
              <p className="text-2xl font-bold text-orange-900">{emergencyStats?.byLevel?.urgent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Today</p>
              <p className="text-2xl font-bold text-yellow-900">{emergencyStats?.today || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Avg Response</p>
              <p className="text-2xl font-bold text-blue-900">{emergencyStats?.avgResponseTimeHours || 0}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Emergency Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <span>Showing {filteredPosts.length} of {emergencyPosts?.length || 0} emergencies</span>
          </div>
        </div>
      </div>

      {/* Emergency Posts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Emergency Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Level & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Location & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPosts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {post.user?.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-slate-900">{post.user?.name || 'Unknown'}</p>
                          
                          
                        </div>
                        
                        <p className="text-sm text-slate-500"> <span>• </span>{post.issueType}</p>
                        {post.affectedPeopleCount && (
                          <p className="text-xs text-red-600 mt-1">
                            {post.affectedPeopleCount} people affected
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(post.emergencyLevel)}`}>
                        {post.emergencyLevel?.toUpperCase()}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(post.status)}`}>
                        {post.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      <p className="font-medium">{post.address}</p>
                      <p className="text-slate-500">{post.city}</p>
                      {post.emergencyContactNumber && (
                        <p className="text-blue-600 font-mono text-xs mt-1">
                          {post.emergencyContactNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {post.department ? (
                        <div>
                          <p className="font-medium text-slate-900">{post.department.name}</p>
                          <p className="text-slate-500">{post.routing?.status}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not routed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatTime(post.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onPostSelect(post)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                      
                     
                      
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Emergency Reports</h3>
            <p className="text-gray-500">No emergency reports match the current filters.</p>
          </div>
        )}
      </div>

      {/* Routing Modal */}
      {showRouting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Route Emergency to Department</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <select
                  value={routingData.departmentId}
                  onChange={(e) => setRoutingData({...routingData, departmentId: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select department...</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={routingData.priority}
                  onChange={(e) => setRoutingData({...routingData, priority: e.target.value as any})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expected Response Time</label>
                <input
                  type="text"
                  value={routingData.expectedResolutionTime}
                  onChange={(e) => setRoutingData({...routingData, expectedResolutionTime: e.target.value})}
                  placeholder="e.g., 30 minutes, 2 hours, 1 day"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={routingData.notes}
                  onChange={(e) => setRoutingData({...routingData, notes: e.target.value})}
                  placeholder="Additional instructions or notes for the department..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRouting(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRouteEmergency(showRouting)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Route Emergency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};