import React from 'react';
import { motion } from 'framer-motion';
 
export const FileUploadBox = ({ onChange, uploadedPhoto, imageBase64 }: { onChange: (file: File | null) => void, uploadedPhoto: string | null, imageBase64: string | null }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
  
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
    };
  
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    };
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
      
      const file = e.dataTransfer.files[0];
      console.log(file);
      if (file) {
        if (file.type.startsWith('image/')) {
          if (file.size <= 5 * 1024 * 1024) { // 5MB limit
            onChange(file);
          } else {
            alert('File size should be less than 5MB');
          }
        } else {
          alert('Please upload an image file');
        }
      }
    };
  
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Upload Photo</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={handleDragOver}
          onDrop={handleDrop}
          className="relative group cursor-pointer"
        >
          {(uploadedPhoto || imageBase64) ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={imageBase64 || uploadedPhoto || undefined}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-sm">Click or drag to change photo</p>
              </div>
            </div>
          ) : (
            <motion.div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-blue-500 hover:bg-blue-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 rounded-full bg-blue-50">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-500">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
            </motion.div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
          />
        </div>
      </div>
    );
  };