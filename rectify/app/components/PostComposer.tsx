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

interface PostComposerProps {
  user: User;
}

export const PostComposer = ({ user }: PostComposerProps) => {
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
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
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
    if (!postContent.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Improve existing content
      const prompt = `Improve and enhance this community issue description while keeping the same context and meaning: "${postContent}". Make it clearer, more detailed, and more actionable while maintaining the same tone. Don't change it to a letter format - keep it as a natural description. Keep it under 200 words and maintain the core message.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        setPostContent(generatedText);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHashtags = async (description: string): Promise<string[]> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
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
      setCurrentImageIndex(0); // Reset to first image
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = selectedImages.filter((_, index) => index !== indexToRemove);
    setSelectedImages(updatedImages);
    
    // Adjust current index if needed
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

      setPostContent("");
      setSelectedReportType("");
      setCustomIssueType("");
      setSelectedImages([]);
      setCurrentImageIndex(0);
      setFullAddress("");
      setLocation("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-800 p-4 lg:p-6 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="flex space-x-3 lg:space-x-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm lg:text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          {/* Emergency Disclaimer Banner */}
          <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-red-400 font-bold text-sm mb-1">Emergency Situations</h4>
                <p className="text-red-300 text-sm leading-relaxed">
                  For life-threatening emergencies or situations requiring immediate response (fire, medical, safety threats), please use our 
                  <a href="/emergency" className="text-red-200 font-bold underline hover:text-white transition-colors mx-1">
                    Emergency Report System
                  </a>
                  for faster processing and priority routing to emergency departments.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening in your community?"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-3 lg:p-4 text-lg lg:text-xl placeholder-gray-500 resize-none outline-none focus:border-blue-500 transition-all duration-200 min-h-[100px] lg:min-h-[120px]"
              maxLength={500}
            />
            {postContent.trim() && (
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={generateComplaintWithAI}
                  disabled={isGenerating}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors rounded-full p-2 flex items-center justify-center"
                  title="Improve description"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Location Section */}
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
            
            {/* Location Preview Map */}
            {coordinates && (
              <div className="mt-4">
                <div className="relative bg-gray-800 rounded-xl overflow-hidden h-40 lg:h-48 border border-gray-700">
                  <iframe
                    src={`https://api.maptiler.com/maps/satellite/?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}#16.2/${coordinates.lat}/${coordinates.lng}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    📍 Location Preview
                  </div>
                </div>
                {fullAddress && (
                  <div className="mt-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <p className="text-sm text-gray-400 line-clamp-2">
                      📍 {fullAddress}
                    </p>
                  </div>
                )}
              </div>
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
            
            {/* Custom Issue Type Input */}
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
              
              {/* Enhanced Image Preview with Instagram-style Navigation */}
              {selectedImages.length > 0 && (
                <div className="space-y-3">
                  {/* Main Image Display */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                    <img
                      src={URL.createObjectURL(selectedImages[currentImageIndex])}
                      alt={`Preview ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation arrows - only show if more than 1 image */}
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
                    
                    {/* Image counter */}
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1} / {selectedImages.length}
                    </div>
                    
                    {/* Remove current image button */}
                    <button
                      onClick={() => removeImage(currentImageIndex)}
                      className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 text-xs transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Thumbnail strip - only show if more than 1 image */}
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

          {/* Action Buttons */}
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
  );
};