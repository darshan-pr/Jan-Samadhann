'use client';

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  phone: string;
  city: string;
  role: "user";
  createdAt: string;
}

interface PostModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal = ({ user, isOpen, onClose }: PostModalProps) => {
  const [location, setLocation] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [fullAddress, setFullAddress] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customIssueType, setCustomIssueType] = useState("");

  // Convex mutations
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const addPhotoToPost = useMutation(api.photos.addPhotoToPost);

  const reportTypes = [
    "🕳️ Pothole",
    "🚧 Road Damage", 
    "💧 Water Issue",
    "🗑️ Waste Management",
    "💡 Street Light",
    "🚦 Traffic Signal",
    "🌳 Trees/Vegetation",
    "📋 Other"
  ];

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocationLoading(true);
    setLocationError("");

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      const address = await tryGeocoding(latitude, longitude);
      if (address) {
        setFullAddress(address);
        // Extract city from address for display
        const cityMatch = address.match(/([^,]+),\s*([^,]+),\s*([^,]+)/);
        const city = cityMatch ? cityMatch[1].trim() : address.split(',')[0].trim();
        setLocation(city);
        setLocationError("");
      } else {
        setFullAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocationError("");
      }
    } catch (error: unknown) {
      let errorMessage = "Unable to get location.";
      const geoError = error as GeolocationPositionError;
      
      switch (geoError.code) {
        case 1:
          errorMessage = "Location access denied. Please enable location services.";
          break;
        case 2:
          errorMessage = "Location information unavailable.";
          break;
        case 3:
          errorMessage = "Location request timed out.";
          break;
      }
      
      setLocationError(errorMessage);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const tryGeocoding = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Force English language for Nominatim
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      
      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        if (data.display_name) {
          return data.display_name;
        }
      }
    } catch {
      console.log("Geocoding failed");
    }

    return null;
  };

  const generateComplaintWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBldo07Sqf0DrjmX5mrZtqs-mFkbPsEh0o', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a detailed community issue complaint based on this prompt: "${aiPrompt}". Make it specific, clear, and actionable. Include relevant details about the issue and its impact on the community. Keep it under 200 words.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        setPostContent(generatedText);
        setShowAIGenerator(false);
        setAiPrompt("");
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHashtags = async (description: string): Promise<string[]> => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBldo07Sqf0DrjmX5mrZtqs-mFkbPsEh0o', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate 3-5 relevant hashtags for this community issue: "${description}". Return only the hashtags without # symbol, separated by commas.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const hashtagsText = data.candidates[0].content.parts[0].text;
        return hashtagsText.split(',').map((tag: string) => tag.trim());
      }
    } catch (error) {
      console.error('Hashtag generation failed:', error);
    }
    return [];
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 4) {
        alert("You can upload maximum 4 images per post");
        return;
      }
      setSelectedImages(files);
      setCurrentImageIndex(0);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = selectedImages.filter((_, index) => index !== indexToRemove);
    setSelectedImages(updatedImages);
    
    if (currentImageIndex >= updatedImages.length && updatedImages.length > 0) {
      setCurrentImageIndex(updatedImages.length - 1);
    } else if (updatedImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImages.length === 0) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev === 0 ? selectedImages.length - 1 : prev - 1);
    } else {
      setCurrentImageIndex(prev => prev === selectedImages.length - 1 ? 0 : prev + 1);
    }
  };

  const uploadImages = async (postId: Id<"posts">) => {
    for (const image of selectedImages) {
      try {
        const uploadUrl = await generateUploadUrl();
        
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        
        const { storageId } = await result.json();
        
        await addPhotoToPost({
          postId,
          fileId: storageId,
          fileName: image.name,
          fileSize: image.size,
          mimeType: image.type,
        });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const resetForm = () => {
    setPostContent("");
    setSelectedReportType("");
    setCustomIssueType("");
    setSelectedImages([]);
    setCurrentImageIndex(0);
    setFullAddress("");
    setLocation("");
    setCoordinates(null);
    setLocationError("");
    setAiPrompt("");
    setShowAIGenerator(false);
    setSelectedPriority("medium");
  };

  const handleSubmitReport = async () => {
    if (!postContent.trim()) return;
    
    if (!fullAddress && !location) {
      setLocationError("Please detect your location first.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postId = await createPost({
        userId: user._id as Id<"users">,
        description: postContent,
        issueType: selectedReportType || "General Issue",
        customIssueType: selectedReportType === "📋 Other" ? customIssueType : undefined,
        city: location || user.city,
        address: fullAddress || location || user.city,
        coordinates: coordinates || undefined,
        priority: selectedPriority,
      });

      if (selectedImages.length > 0) {
        await uploadImages(postId);
      }

      // Generate hashtags for trending
      await generateHashtags(postContent);

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 lg:p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-lg lg:max-w-2xl max-h-[95vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white">Create Post</h2>
              <p className="text-xs lg:text-sm text-gray-400">Report a community issue</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 lg:p-5  overflow-y-auto max-h-[80vh] max-w-[50vh]">
          <div className="flex space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm lg:text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's happening in your community?"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-3 lg:p-4 text-lg lg:text-xl placeholder-gray-500 resize-none outline-none focus:border-blue-500 transition-all duration-200 min-h-[100px] lg:min-h-[120px]"
                  maxLength={500}
                />
                {!postContent && (
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 transition-colors rounded-full p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* AI Generator Modal */}
              {showAIGenerator && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                  <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Assistant
                    </h3>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe the issue briefly..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-400 resize-none outline-none focus:border-purple-500 transition-colors"
                      rows={3}
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => setShowAIGenerator(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 transition-colors rounded-xl py-2 px-4"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={generateComplaintWithAI}
                        disabled={!aiPrompt.trim() || isGenerating}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors rounded-xl py-2 px-4 flex items-center justify-center"
                      >
                        {isGenerating ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Generate"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Section */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1 text-sm text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>Auto-detect Location</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={location}
                    readOnly
                    placeholder="Location will appear here..."
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={handleGetLocation}
                    disabled={isLocationLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors rounded-xl px-4 py-3 text-sm font-medium flex items-center space-x-2"
                  >
                    {isLocationLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    )}
                    <span>Detect</span>
                  </button>
                </div>
                
                {locationError && (
                  <p className="text-red-400 text-sm">{locationError}</p>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select issue type...</option>
                    {reportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as "low" | "medium" | "high")}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>
                
                {selectedReportType === "📋 Other" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customIssueType}
                      onChange={(e) => setCustomIssueType(e.target.value)}
                      placeholder="Please specify the issue type..."
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {50 - customIssueType.length} characters remaining
                    </p>
                  </div>
                )}
                
                {/* Image Upload */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                      max="4"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Add photos (max 4)</span>
                    </label>
                    {selectedImages.length > 0 && (
                      <span className="text-sm text-blue-400">{selectedImages.length} file(s) selected</span>
                    )}
                  </div>
                  
                  {/* Image Preview */}
                  {selectedImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                        <img
                          src={URL.createObjectURL(selectedImages[currentImageIndex])}
                          alt={`Preview ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {selectedImages.length > 1 && (
                          <>
                            <button
                              onClick={() => navigateImage('prev')}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => navigateImage('next')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                        
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                          {currentImageIndex + 1} / {selectedImages.length}
                        </div>
                        
                        <button
                          onClick={() => removeImage(currentImageIndex)}
                          className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 text-xs transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {selectedImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {selectedImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'border-blue-500 ring-2 ring-blue-500/30' 
                                  : 'border-gray-600 hover:border-gray-400'
                              }`}
                            >
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {index === currentImageIndex && (
                                <div className="absolute inset-0 bg-blue-500/20"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Character Count and Submit */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`${
                    postContent.length > 450 ? "text-red-400" : 
                    postContent.length > 400 ? "text-yellow-400" : ""
                  }`}>
                    {500 - postContent.length} characters left
                  </span>
                </div>
                
                <button
                  onClick={handleSubmitReport}
                  disabled={!postContent.trim() || !location || isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-2xl px-6 lg:px-8 py-3 font-bold text-sm shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};