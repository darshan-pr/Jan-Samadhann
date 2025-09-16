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
      <div className="mb-4 rounded-xl lg:rounded-2xl overflow-hidden">
        <div className="relative aspect-square max-w-md mx-auto">
          {photos[0].url ? (
            <img
              src={photos[0].url}
              alt={photos[0].fileName}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
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
      <div className="mb-4 rounded-xl lg:rounded-2xl overflow-hidden">
        <div className="relative aspect-square max-w-md mx-auto bg-black">
          {/* Main Image */}
          {photos[currentIndex]?.url ? (
            <img
              src={photos[currentIndex].url}
              alt={photos[currentIndex].fileName}
              className="w-full h-full object-cover cursor-pointer"
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
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="hidden lg:flex mt-2 space-x-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={photo._id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-blue-500 opacity-100' 
                    : 'border-gray-600 opacity-60 hover:opacity-80'
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

// Full-screen image modal component
function ImageModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {photo.url && (
          <img
            src={photo.url}
            alt={photo.fileName}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}