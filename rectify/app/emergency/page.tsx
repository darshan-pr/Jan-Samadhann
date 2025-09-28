/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useAuth } from '../lib/auth';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { NotificationPanel } from "@/app/components/NotificationPanel";

export default function EmergencyPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string>("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'tracking'>('report');
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    issueType: '',
    customIssueType: '',
    address: '',
    emergencyLevel: 'urgent' as 'critical' | 'urgent' | 'high',
    emergencyContactNumber: '',
    affectedPeopleCount: '',
    immediateAction: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const createEmergencyPost = useMutation(api.emergencyPosts.createEmergencyPost);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const addPhotoToPost = useMutation(api.photos.addPhotoToPost);
  
  // Get user's emergency posts for tracking
  const userEmergencyPosts = useQuery(api.emergencyPosts.getAllEmergencyPosts);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, 
    user ? { userId: user._id as Id<"users"> } : "skip"
  );

  // Emergency issue types
  const emergencyIssueTypes = [
    'Fire Emergency',
    'Medical Emergency',
    'Building Collapse',
    'Gas Leak',
    'Electrical Emergency',
    'Water Main Break',
    'Road Accident',
    'Flood Emergency',
    'Public Safety Threat',
    'Infrastructure Failure',
    'Chemical Spill',
    'Other Emergency'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'user')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Auto-get location on component mount
  useEffect(() => {
    if (user) {
      getCurrentLocation();
    }
  }, [user]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        
        // Reverse geocode to get address if address field is empty
        if (!formData.address.trim()) {
          reverseGeocode(newLocation);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to get location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 60000 
      }
    );
  };

  const reverseGeocode = async (coords: {lat: number, lng: number}) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name
        }));
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      alert("Maximum 5 photos allowed");
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!formData.description.trim() || !formData.issueType || !formData.address.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create emergency post
      const postId = await createEmergencyPost({
        userId: user._id as Id<"users">,
        description: formData.description,
        issueType: formData.issueType === 'Other Emergency' ? formData.customIssueType : formData.issueType,
        customIssueType: formData.issueType === 'Other Emergency' ? formData.customIssueType : undefined,
        city: (user as any).city,
        address: formData.address,
        coordinates: location || undefined,
        emergencyLevel: formData.emergencyLevel,
        emergencyContactNumber: formData.emergencyContactNumber || undefined,
        affectedPeopleCount: formData.affectedPeopleCount ? parseInt(formData.affectedPeopleCount) : undefined,
        immediateAction: formData.immediateAction || undefined,
      });

      // Upload photos if any
      for (const photo of photos) {
        try {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": photo.type },
            body: photo,
          });
          
          const { storageId } = await result.json();
          
          await addPhotoToPost({
            postId: postId as Id<"posts">,
            fileId: storageId,
            fileName: photo.name,
            fileSize: photo.size,
            mimeType: photo.type,
          });
        } catch (error) {
          console.error("Error uploading photo:", error);
        }
      }

      setEmergencyId(postId as string);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error creating emergency post:", error);
      alert("Failed to submit emergency report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setActiveTab('tracking');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-gray-900 to-black text-white font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-red-800 bg-red-900/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-xl hover:bg-red-800/50 transition-all duration-200"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className="h-0.5 bg-white w-full rounded-full"></div>
            <div className="h-0.5 bg-white w-full rounded-full"></div>
            <div className="h-0.5 bg-white w-full rounded-full"></div>
          </div>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400 animate-pulse">EMERGENCY</div>
            <div className="text-xs text-gray-400 leading-none">Rapid Response</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-xl hover:bg-red-800/50 transition-all duration-200"
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
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className="text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
            </button>
          
            {/* Profile Dropdown */}
            {showProfileMenu && user && (
              <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 min-w-80 z-50 border border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
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
        <div className={`${showMobileMenu ? 'fixed inset-0 z-50 bg-black' : 'hidden'} lg:block lg:relative lg:w-64 xl:w-72 p-4 lg:border-r border-red-800 lg:min-h-screen`}>
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
            <div className="flex items-center space-x-3 px-3 mb-8">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400 animate-pulse" style={{ fontFamily: 'Aptos, sans-serif' }}>
                  EMERGENCY
                </div>
                <div className="text-xs text-gray-400 leading-none">Rapid Response System</div>
              </div>
            </div>
            
            <nav className="space-y-2">
              <a 
                href="/dashboard" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-800/50 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="text-xl font-medium">Back to Home</span>
              </a>
              
              <button 
                onClick={() => {
                  setActiveTab('report');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200 ${
                  activeTab === 'report' 
                    ? 'bg-red-600/20 border border-red-500/30 text-red-400' 
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-xl font-medium">Report Emergency</span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  NEW
                </span>
              </button>
              
              <button 
                onClick={() => {
                  setActiveTab('tracking');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200 ${
                  activeTab === 'tracking' 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-xl font-medium">Track Emergencies</span>
                {userEmergencyPosts && userEmergencyPosts.filter(post => post.userId === user?._id).length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {userEmergencyPosts.filter(post => post.userId === user?._id).length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-full lg:max-w-4xl min-h-screen">
          {/* Desktop Header */}
          <div className="hidden lg:block sticky top-0 bg-red-900/50 backdrop-blur-md border-b border-red-800 z-40">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <h1 className="text-3xl font-bold text-red-400 animate-pulse">EMERGENCY SYSTEM</h1>
                    <p className="text-sm text-gray-300">Urgent civic issues requiring immediate attention</p>
                  </div>
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Desktop Tab Navigation */}
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'report'
                      ? 'bg-red-600/20 border border-red-500/30 text-red-400'
                      : 'hover:bg-gray-800/50 text-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Report Emergency</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('tracking')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'tracking'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                      : 'hover:bg-gray-800/50 text-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Track Emergencies</span>
                  {userEmergencyPosts && userEmergencyPosts.filter(post => post.userId === user?._id).length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {userEmergencyPosts.filter(post => post.userId === user?._id).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'report' ? (
            // Emergency Report Form
            <div className="p-4 lg:p-6">
              {/* Warning Banner */}
              <div className="bg-red-800/30 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-300">
                      <strong>For life-threatening emergencies, call 1533 immediately.</strong> This form is for urgent civic issues that require rapid administrative response.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Emergency Level Selection */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                  <label className="block text-lg font-medium text-red-400 mb-4">
                    Emergency Level *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['critical', 'urgent', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({...formData, emergencyLevel: level})}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.emergencyLevel === level
                            ? level === 'critical'
                              ? 'border-red-500 bg-red-600/20 text-red-300'
                              : level === 'urgent'
                              ? 'border-orange-500 bg-orange-600/20 text-orange-300'
                              : 'border-yellow-500 bg-yellow-600/20 text-yellow-300'
                            : 'border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-xl font-bold mb-2 ${
                            level === 'critical' ? 'text-red-400' :
                            level === 'urgent' ? 'text-orange-400' : 'text-yellow-400'
                          }`}>
                            {level.toUpperCase()}
                          </div>
                          <p className="text-sm text-gray-400">
                            {level === 'critical' ? 'Immediate threat to life/safety' :
                             level === 'urgent' ? 'Requires action within 1 hour' :
                             'Needs attention within 4 hours'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Type */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                  <label className="block text-lg font-medium text-red-400 mb-4">
                    Type of Emergency *
                  </label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="">Select emergency type...</option>
                    {emergencyIssueTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  
                  {formData.issueType === 'Other Emergency' && (
                    <input
                      type="text"
                      name="customIssueType"
                      value={formData.customIssueType}
                      onChange={handleInputChange}
                      placeholder="Please specify the emergency type"
                      className="mt-4 w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                  )}
                </div>

                {/* Description */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                  <label className="block text-lg font-medium text-red-400 mb-4">
                    Emergency Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Provide detailed description of the emergency situation, what happened, current status, and any immediate dangers..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>

                {/* Location and Contact */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                    <label className="block text-lg font-medium text-red-400 mb-4">
                      Exact Location *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Provide precise address, landmarks, building details, floor/room numbers..."
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="mt-3 flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{isGettingLocation ? 'Getting location...' : location ? 'Location detected ✓' : 'Auto-detect location'}</span>
                    </button>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                    <label className="block text-lg font-medium text-red-400 mb-4">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={handleInputChange}
                      placeholder="Contact number for immediate response"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-2">Alternative contact for rapid response team</p>
                  </div>
                </div>

                {/* Additional Emergency Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                    <label className="block text-lg font-medium text-red-400 mb-4">
                      People Affected
                    </label>
                    <input
                      type="number"
                      name="affectedPeopleCount"
                      value={formData.affectedPeopleCount}
                      onChange={handleInputChange}
                      placeholder="Approximate number of people affected"
                      min="0"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                    <label className="block text-lg font-medium text-red-400 mb-4">
                      Immediate Action Required
                    </label>
                    <input
                      type="text"
                      name="immediateAction"
                      value={formData.immediateAction}
                      onChange={handleInputChange}
                      placeholder="What immediate action is needed?"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                  <label className="block text-lg font-medium text-red-400 mb-4">
                    Emergency Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="emergency-photos"
                  />
                  <label
                    htmlFor="emergency-photos"
                    className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-xl text-center cursor-pointer hover:border-red-500 transition-colors"
                  >
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-gray-400">Click to upload emergency photos (max 5)</p>
                  </label>
                  
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Emergency photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-800/30">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Emergency Report...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>SUBMIT EMERGENCY REPORT</span>
                      </>
                    )}
                  </button>
                  
                  <div className="mt-4 text-center text-sm text-gray-400">
                    <p>Your emergency report will be processed immediately and routed to the appropriate department for rapid response.</p>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            // Emergency Tracking View
            <div className="p-4 lg:p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-400 mb-2">Emergency Tracking</h2>
                <p className="text-gray-400">Track the status of your submitted emergency reports</p>
              </div>

              {userEmergencyPosts === undefined ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex space-x-4 p-4 bg-gray-900/50 rounded-2xl">
                        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 mt-4">Loading your emergency reports...</p>
                </div>
              ) : userEmergencyPosts.filter(post => post.userId === user?._id).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No emergency reports yet</h3>
                  <p>Your submitted emergency reports will appear here for tracking.</p>
                  <button
                    onClick={() => setActiveTab('report')}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Report Emergency
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userEmergencyPosts
                    .filter(post => post.userId === user?._id)
                    .map((emergency) => (
                      <div key={emergency._id} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                emergency.emergencyLevel === 'critical' 
                                  ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
                                  : emergency.emergencyLevel === 'urgent'
                                  ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                                  : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {emergency.emergencyLevel?.toUpperCase()}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                emergency.status === 'resolved' 
                                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                  : emergency.status === 'in_progress'
                                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                  : emergency.status === 'rejected'
                                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                  : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {emergency.status.toUpperCase().replace('_', ' ')}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(emergency.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2">{emergency.issueType}</h3>
                            <p className="text-gray-300 mb-3 line-clamp-2">{emergency.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-400 space-x-4">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate max-w-40">{emergency.address}</span>
                                </div>
                                {emergency.department && (
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>{emergency.department.name}</span>
                                  </div>
                                )}
                              </div>
                              
                              <button
                                onClick={() => {
                                  setSelectedEmergency(emergency);
                                  setShowEmergencyDetails(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <div className={`w-4 h-4 rounded-full ${
                              emergency.status === 'resolved' ? 'bg-green-500' :
                              emergency.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                              emergency.status === 'rejected' ? 'bg-red-500' :
                              'bg-yellow-500 animate-pulse'
                            }`}></div>
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

      {/* Notification Panel */}
      {showNotifications && user && user.role === 'user' && (
        <NotificationPanel 
          user={{ ...user, _id: user._id as Id<"users">, createdAt: '' }}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Emergency Details Modal */}
      {showEmergencyDetails && selectedEmergency && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedEmergency.status === 'resolved' ? 'bg-green-500' :
                  selectedEmergency.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                  selectedEmergency.status === 'rejected' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`}></div>
                <h2 className="text-2xl font-bold text-white">Emergency Details</h2>
              </div>
              <button
                onClick={() => setShowEmergencyDetails(false)}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Status & Level */}
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedEmergency.emergencyLevel === 'critical' 
                      ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
                      : selectedEmergency.emergencyLevel === 'urgent'
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                      : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {selectedEmergency.emergencyLevel?.toUpperCase()}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedEmergency.status === 'resolved' 
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                      : selectedEmergency.status === 'in_progress'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : selectedEmergency.status === 'rejected'
                      ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                      : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {selectedEmergency.status.toUpperCase().replace('_', ' ')}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(selectedEmergency.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedEmergency.issueType}</h3>
                <p className="text-gray-300 leading-relaxed">{selectedEmergency.description}</p>
              </div>

              {/* Location Information */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong className="text-gray-400">Address:</strong> <span className="text-white">{selectedEmergency.address}</span></div>
                  <div><strong className="text-gray-400">City:</strong> <span className="text-white">{selectedEmergency.city}</span></div>
                  {selectedEmergency.coordinates && (
                    <div>
                      <strong className="text-gray-400">Coordinates:</strong> 
                      <span className="text-white ml-1">
                        {selectedEmergency.coordinates.lat.toFixed(6)}, {selectedEmergency.coordinates.lng.toFixed(6)}
                      </span>
                      <a 
                        href={`https://www.google.com/maps/place/${selectedEmergency.coordinates.lat}%2C${selectedEmergency.coordinates.lng}/@${selectedEmergency.coordinates.lat},${selectedEmergency.coordinates.lng},17z`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300 underline"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Details */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Emergency Information
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedEmergency.affectedPeopleCount && (
                    <div><strong className="text-gray-400">People Affected:</strong> <span className="text-white">{selectedEmergency.affectedPeopleCount}</span></div>
                  )}
                  {selectedEmergency.emergencyContactNumber && (
                    <div><strong className="text-gray-400">Emergency Contact:</strong> <span className="text-white">{selectedEmergency.emergencyContactNumber}</span></div>
                  )}
                  {selectedEmergency.immediateAction && (
                    <div><strong className="text-gray-400">Immediate Action Required:</strong> <span className="text-white">{selectedEmergency.immediateAction}</span></div>
                  )}
                </div>
              </div>

              {/* Department Routing */}
              {selectedEmergency.department && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Department Assignment
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong className="text-gray-400">Department:</strong> <span className="text-white">{selectedEmergency.department.name}</span></div>
                    {selectedEmergency.routing && (
                      <>
                        <div><strong className="text-gray-400">Priority:</strong> <span className="text-white">{selectedEmergency.routing.priority?.toUpperCase()}</span></div>
                        {selectedEmergency.routing.expectedResolutionTime && (
                          <div><strong className="text-gray-400">Expected Response:</strong> <span className="text-white">{selectedEmergency.routing.expectedResolutionTime}</span></div>
                        )}
                        {selectedEmergency.routing.notes && (
                          <div><strong className="text-gray-400">Routing Notes:</strong> <span className="text-white">{selectedEmergency.routing.notes}</span></div>
                        )}
                        <div><strong className="text-gray-400">Routed At:</strong> <span className="text-white">{new Date(selectedEmergency.routing.routedAt).toLocaleString()}</span></div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedEmergency.photos && selectedEmergency.photos.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2z" />
                    </svg>
                    Emergency Photos ({selectedEmergency.photos.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedEmergency.photos.map((photo: any, index: number) => (
                      <div key={photo._id} className="relative">
                        {photo.url && (
                          <img
                            src={photo.url}
                            alt={`Emergency photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-green-400 mb-2">Emergency Report Submitted!</h3>
              <p className="text-gray-300 mb-4">
                Your emergency report has been received and is being processed immediately by our rapid response team.
              </p>
              
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Emergency ID:</p>
                <p className="font-mono text-green-400 font-bold">{emergencyId}</p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <p>✓ Report automatically routed to appropriate department</p>
                <p>✓ You will receive real-time updates via notifications</p>
                <p>✓ Expected initial response based on emergency level</p>
              </div>
              
              <button
                onClick={closeSuccessModal}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Continue to Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}