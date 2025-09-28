/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from '@/convex/_generated/dataModel';

interface DepartmentManagementProps {
  user: any;
}

export const DepartmentManagement = ({ user }: DepartmentManagementProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    head: '',
    category: 'other' as const,
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  });

  // Convex queries and mutations
  const departments = useQuery(api.departments.getAllDepartments);
  const activeDepartments = useQuery(api.departments.getActiveDepartments);
  const seedCoreDepartments = useMutation(api.seedDepartments.seedCoreDepartments);
  const createDepartment = useMutation(api.departments.createDepartment);
  const updateDepartmentStatus = useMutation(api.departments.updateDepartmentStatus);

  const handleSeedDepartments = async () => {
    setSeeding(true);
    try {
      const result = await seedCoreDepartments({});
      alert(`✅ ${result.message}. Created ${result.count} departments.`);
    } catch (error) {
      console.error("Error seeding departments:", error);
      alert("❌ Error seeding departments. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.name || !newDepartment.contactEmail || !newDepartment.head) {
      alert("Please fill in all required fields");
      return;
    }

    setCreatingDepartment(true);
    try {
      await createDepartment(newDepartment);
      setShowCreateModal(false);
      setNewDepartment({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        head: '',
        category: 'other',
        workingHours: {
          start: '09:00',
          end: '17:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      });
      alert("✅ Department created successfully!");
    } catch (error) {
      console.error("Error creating department:", error);
      alert("❌ Error creating department. Please try again.");
    } finally {
      setCreatingDepartment(false);
    }
  };

  const handleStatusUpdate = async (departmentId: string, status: string) => {
    setUpdatingStatus(departmentId);
    try {
      await updateDepartmentStatus({
        departmentId: departmentId as Id<"departments">,
        status: status as "active" | "inactive" | "maintenance"
      });
      alert(`✅ Department status updated to ${status}`);
    } catch (error) {
      console.error("Error updating department status:", error);
      alert("❌ Error updating department status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-red-50 text-red-700 border-red-200';
      case 'maintenance': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClasses = "w-6 h-6";
    
    switch (category) {
      case 'infrastructure':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'sanitation':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'transportation':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'utilities':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'water_supply':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.934 1.934 0 014 16.684v4.650a2 2 0 002 2h12a2 2 0 002-2v-4.65a1.934 1.934 0 00-.572-1.336zM6 7a1 1 0 011-1h10a1 1 0 011 1v3a1 1 0 01-1 1H7a1 1 0 01-1-1V7zM5 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'public_safety':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'environment':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  // Loading component
  const LoadingState = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">Loading Departments</h3>
        <p className="text-slate-500">Please wait while we fetch department information...</p>
      </div>
    </div>
  );

  // Show loading state while data is being fetched
  if (departments === undefined) {
    return <LoadingState />;
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Departments Found</h3>
          <p className="text-slate-500 mb-6">Set up your municipal departments to start managing citizen reports effectively.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSeedDepartments}
              disabled={seeding}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{seeding ? 'Setting up...' : 'Setup Core Departments'}</span>
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Custom Department</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Department Overview</h2>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
              {departments?.length || 0} Total Departments
            </span>
          </div>
          <p className="text-slate-600">Monitor and manage municipal departments and their performance</p>
        </div>
        
        <div className="flex space-x-3">
          {departments && departments.length === 0 && (
            <button
              onClick={handleSeedDepartments}
              disabled={seeding}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{seeding ? 'Setting up...' : 'Setup Core Departments'}</span>
            </button>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      {departments && departments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-700 text-sm font-medium mb-1">Total Departments</h3>
                <p className="text-2xl font-bold text-blue-700">{departments?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-700 text-sm font-medium mb-1">Active Departments</h3>
                <p className="text-2xl font-bold text-green-700">{activeDepartments?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-orange-700 text-sm font-medium mb-1">Total Assignments</h3>
                <p className="text-2xl font-bold text-orange-700">
                  {departments?.reduce((acc, dept) => acc + (dept.totalAssigned || 0), 0) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h4m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 4h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-700 text-sm font-medium mb-1">Total Resolved</h3>
                <p className="text-2xl font-bold text-purple-700">
                  {departments?.reduce((acc, dept) => acc + (dept.totalResolved || 0), 0) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments?.map((department) => (
          <div key={department._id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  {getCategoryIcon(department.category)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 line-clamp-1">{department.name}</h3>
                  <p className="text-slate-500 text-sm">{department.head}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(department.status)}`}>
                {department.status?.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{department.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-800">{department.totalAssigned || 0}</p>
                <p className="text-xs text-slate-500">Assigned</p>
              </div>
              <div className="text-center bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{department.totalResolved || 0}</p>
                <p className="text-xs text-slate-500">Resolved</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-600 truncate">{department.contactEmail}</span>
              </div>
              {department.contactPhone && (
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-slate-600">{department.contactPhone}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setSelectedDepartment(department)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Details
              </button>
              <select
                value={department.status}
                onChange={(e) => handleStatusUpdate(department._id, e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Create New Department</h3>
              <p className="text-slate-600 text-sm mt-1">Add a new municipal department to manage specific services</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department Name *</label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                    placeholder="e.g. Roads & Infrastructure"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department Head *</label>
                  <input
                    type="text"
                    value={newDepartment.head}
                    onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
                    placeholder="e.g. Er. John Doe"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Brief description of department responsibilities..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    value={newDepartment.contactEmail}
                    onChange={(e) => setNewDepartment({...newDepartment, contactEmail: e.target.value})}
                    placeholder="department@city.gov.in"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={newDepartment.contactPhone}
                    onChange={(e) => setNewDepartment({...newDepartment, contactPhone: e.target.value})}
                    placeholder="+91-11-23456789"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={newDepartment.category}
                  onChange={(e) => setNewDepartment({...newDepartment, category: e.target.value as any})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="infrastructure">Infrastructure</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="transportation">Transportation</option>
                  <option value="utilities">Utilities</option>
                  <option value="water_supply">Water Supply</option>
                  <option value="public_safety">Public Safety</option>
                  <option value="environment">Environment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Working Hours</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="time"
                      value={newDepartment.workingHours.start}
                      onChange={(e) => setNewDepartment({
                        ...newDepartment, 
                        workingHours: { ...newDepartment.workingHours, start: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={newDepartment.workingHours.end}
                      onChange={(e) => setNewDepartment({
                        ...newDepartment, 
                        workingHours: { ...newDepartment.workingHours, end: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDepartment}
                disabled={creatingDepartment}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {creatingDepartment && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{creatingDepartment ? 'Creating...' : 'Create Department'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    {getCategoryIcon(selectedDepartment.category)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{selectedDepartment.name}</h3>
                    <p className="text-slate-600 text-sm">Department Head: {selectedDepartment.head}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status and Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{selectedDepartment.totalAssigned || 0}</p>
                  <p className="text-sm text-slate-600">Total Assigned</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedDepartment.totalResolved || 0}</p>
                  <p className="text-sm text-slate-600">Total Resolved</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedDepartment.avgResponseTime || 0}h</p>
                  <p className="text-sm text-slate-600">Avg Response Time</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Department Overview</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed">{selectedDepartment.description}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Contact Information</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-700">{selectedDepartment.contactEmail}</span>
                  </div>
                  {selectedDepartment.contactPhone && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-slate-700">{selectedDepartment.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Working Hours</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">
                    <span className="font-medium">
                      {selectedDepartment.workingHours.start} - {selectedDepartment.workingHours.end}
                    </span>
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    {selectedDepartment.workingHours.days.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};