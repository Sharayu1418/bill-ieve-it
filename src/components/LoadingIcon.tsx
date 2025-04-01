import React from 'react';

interface LoadingIconProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const LoadingIcon: React.FC<LoadingIconProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-pulse"
        >
          {/* Capitol Dome */}
          <path
            d="M50 10 L20 70 H80 L50 10Z"
            className="fill-blue-600"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="15" y="70" width="70" height="10" className="fill-blue-700" />
          <circle cx="50" cy="40" r="8" className="fill-white" />
          
          {/* Pillars */}
          <rect x="25" y="50" width="4" height="20" className="fill-blue-500" />
          <rect x="35" y="50" width="4" height="20" className="fill-blue-500" />
          <rect x="45" y="50" width="4" height="20" className="fill-blue-500" />
          <rect x="55" y="50" width="4" height="20" className="fill-blue-500" />
          <rect x="65" y="50" width="4" height="20" className="fill-blue-500" />
          
          {/* Base */}
          <rect x="10" y="80" width="80" height="10" className="fill-blue-800" />
          
          {/* Loading circles */}
          <circle cx="30" cy="85" r="2" className="fill-white animate-[ping_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
          <circle cx="50" cy="85" r="2" className="fill-white animate-[ping_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
          <circle cx="70" cy="85" r="2" className="fill-white animate-[ping_1.5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
        </svg>
      </div>
      {showText && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading...</p>
      )}
    </div>
  );
};

export default LoadingIcon;