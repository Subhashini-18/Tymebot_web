import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield, Database, Users, Globe } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  type?: 'default' | 'sophisticated' | 'data-loading';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  type = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  if (type === 'sophisticated') {
    return (
      <div className={containerClasses}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-gray-200 border-t-[#01443b] rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#01443b]" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Your Request
              </h3>
              <p className="text-gray-600 text-sm">
                {text}
              </p>
            </div>

            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-[#01443b] rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'data-loading') {
    const icons = [Shield, Database, Users, Globe];

    return (
      <div className={containerClasses}>
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-2">
              {icons.map((Icon, index) => (
                <motion.div
                  key={index}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 }}
                  className="p-2 bg-[#01443b] bg-opacity-10 rounded-lg"
                >
                  <Icon className="w-5 h-5 text-[#01443b]" />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-700 font-medium">Loading Master Data</p>
              <p className="text-gray-500 text-sm mt-1">{text}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-[#01443b]`} />
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;