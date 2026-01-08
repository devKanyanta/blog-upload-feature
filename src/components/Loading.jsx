import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-gray-300"></div>
        <div className="h-12 w-12 rounded-full border-2 border-gray-900 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`${sizes[size]} rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin`} />
  );
};

export default Loading;