import React from 'react';
import { Hotel } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4 animate-pulse">
        <Hotel className="w-8 h-8 text-amber-600" />
      </div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;