'use client';

import { useState } from 'react';

interface Photo {
  _id: string;
  url?: string | null;
  fileName: string;
}

interface ImageCarouselProps {
  photos: Photo[];
}

export default function ImageCarousel({ photos }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (!photos || photos.length === 0) return null;

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Single image display
  if (photos.length === 1) {
    return (
      <div className="mb-4 rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl mobile-image-container">
        <div className="relative aspect-[4/3] max-w-lg mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          {photos[0].url ? (
            <img
              src={photos[0].url}
              alt={photos[0].fileName}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all duration-300 ease-out touch-manipulation"
              onClick={openModal}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {showModal && (
          <ImageModal photo={photos[0]} onClose={closeModal} />
        )}
      </div>
    );
  }

  // Multiple images carousel
  return (
    <>
      <div className="mb-4 rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl mobile-image-container">
        <div className="relative aspect-[4/3] max-w-lg mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          {/* Main Image */}
          {photos[currentIndex]?.url ? (
            <img
              src={photos[currentIndex].url}
              alt={photos[currentIndex].fileName}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all duration-300 ease-out touch-manipulation"
              onClick={openModal}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm border border-gray-500/30 shadow-xl mobile-touch-target"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm border border-gray-500/30 shadow-xl mobile-touch-target"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {photos.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </div>
          )}

          {/* Dots Indicator */}
          {photos.length > 1 && photos.length <= 10 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip for larger screens */}
        {photos.length > 1 && (
          <div className="hidden lg:flex mt-3 space-x-3 overflow-x-auto pb-2 px-2">
            {photos.map((photo, index) => (
              <button
                key={photo._id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 shadow-lg ${
                  index === currentIndex 
                    ? 'border-blue-500 opacity-100 ring-2 ring-blue-500/30' 
                    : 'border-gray-600 opacity-60 hover:opacity-80 hover:border-gray-500'
                }`}
              >
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen Modal */}
      {showModal && (
        <ImageModal photo={photos[currentIndex]} onClose={closeModal} />
      )}
    </>
  );
}

// Enhanced full-screen image modal component
function ImageModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isZoomed) {
      setIsZoomed(true);
      setScale(2);
    } else {
      setIsZoomed(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
      setPosition({ x, y });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-7xl flex items-center justify-center">
        
        {/* Close Button - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 z-20 transition-all duration-200 backdrop-blur-sm border border-gray-600/50 shadow-xl"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Info - Top Left */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm z-20 border border-gray-600/50 shadow-xl">
          <p className="font-medium">{photo.fileName}</p>
        </div>

        {/* Zoom Instructions - Bottom Center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm z-20 border border-gray-600/50 shadow-xl">
          <p className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>{isZoomed ? 'Click to zoom out' : 'Click to zoom in'}</span>
          </p>
        </div>

        {/* Main Image Container */}
        <div 
          className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.url ? (
            <img
              src={photo.url}
              alt={photo.fileName}
              className={`max-w-full max-h-full object-contain transition-all duration-300 ease-out rounded-2xl shadow-2xl ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center'
              }}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isZoomed && setPosition({ x: 0, y: 0 })}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading image...</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Gesture Indicators */}
        <div className="lg:hidden absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-xs z-20 border border-gray-600/50">
          <p className="flex items-center space-x-2">
            <span>👆</span>
            <span>Tap image to zoom • Tap outside to close</span>
          </p>
        </div>
      </div>
    </div>
  );
}