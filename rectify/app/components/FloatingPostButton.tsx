'use client';

import { useState } from "react";

interface FloatingPostButtonProps {
  onClick: () => void;
}

export const FloatingPostButton = ({ onClick }: FloatingPostButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 lg:w-16 lg:h-16
        bg-gradient-to-r from-blue-600 to-purple-600
        hover:from-blue-700 hover:to-purple-700
        rounded-full shadow-2xl hover:shadow-3xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        border-2 border-white/20
        backdrop-blur-sm
        ${isPressed ? 'scale-95 shadow-lg' : 'scale-100 hover:scale-110'}
        group
      `}
    >
      {/* Animated Plus Icon */}
      <svg 
        className={`
          w-6 h-6 lg:w-7 lg:h-7 text-white 
          transition-transform duration-200 
          ${isPressed ? 'rotate-45' : 'group-hover:rotate-90'}
        `} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M12 4v16m8-8H4" 
        />
      </svg>

      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
      
      {/* Tooltip for desktop */}
      <div className="absolute bottom-full right-0 mb-2 hidden lg:group-hover:block">
        <div className="bg-gray-900/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700">
          Create Post
          <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900/90"></div>
        </div>
      </div>
    </button>
  );
};