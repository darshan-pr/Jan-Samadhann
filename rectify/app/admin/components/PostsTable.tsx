/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';

interface PostsTableProps {
  posts: any[];
  onPostSelect: (post: any) => void;
  selectedPost?: any;
}

export const PostsTable = ({ posts, onPostSelect, selectedPost }: PostsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  // Filter posts
  const filteredPosts = posts?.filter(post => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && post.priority !== priorityFilter) return false;
    return true;
  }) || [];

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortBy === 'likes' || sortBy === 'priority') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate posts
  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-50 text-blue-700';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700';
      case 'resolved': return 'bg-green-50 text-green-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">
              Showing {paginatedPosts.length} of {filteredPosts.length} posts
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {paginatedPosts.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No posts found</h3>
          <p>Try adjusting your filters to see more posts.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors text-slate-700"
                    onClick={() => handleSort('user.name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      {sortBy === 'user.name' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z"/>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">Issue</th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors text-slate-700"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Priority</span>
                      {sortBy === 'priority' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z"/>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">Status</th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors text-slate-700"
                    onClick={() => handleSort('likes')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Votes</span>
                      {sortBy === 'likes' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z"/>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors text-slate-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {sortBy === 'createdAt' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14l5-5 5 5z"/>
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedPosts.map((post, index) => (
                  <tr 
                    key={post._id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedPost?._id === post._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{post.user?.name?.[0]?.toUpperCase() || "U"}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{post.user?.name || "Unknown"}</p>
                          <p className="text-slate-500 text-xs">{post.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-medium text-slate-800 text-sm mb-1">{post.issueType}</p>
                      <p className="text-slate-600 text-xs truncate" title={post.description}>
                        {post.description}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getPriorityIcon(post.priority)}</span>
                        <span className="text-sm text-slate-700 capitalize">{post.priority}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                        {post.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="text-sm font-medium text-slate-700">{post.likes}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onPostSelect(post)}
                        className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-1 text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center space-x-1">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            currentPage === page
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))
                  }
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};