import React from 'react';
import { Construction, Clock, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#01443B] to-[#09B591] rounded-full blur opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[#01443B] to-[#09B591] p-4 rounded-full">
                <Construction className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">Coming Soon</span>
            <Sparkles className="h-5 w-5 text-gray-500" />
          </div>
          
          {description && (
            <p className="text-gray-600 mb-6">
              {description}
            </p>
          )}
          
          <div className="bg-gradient-to-r from-[#01443B] to-[#09B591] bg-clip-text text-transparent font-semibold">
            This feature is currently under development
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-[#01443B] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#09B591] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#01443B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;