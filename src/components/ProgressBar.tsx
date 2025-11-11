import React from 'react';
import { Check, ChevronRight, Star, Brain } from 'lucide-react';
import AIAnalyticsModal from './AIAnalyticsModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const progressQuotes = [
  "Beginning the journey of secure partnership",
  "Building trust through thorough assessment",
  "Ensuring compliance at every step",
  "Strengthening our security ecosystem",
  "Almost there! Final steps to success",
  "Creating a secure foundation together",
  "Excellence in vendor governance",
  "Completing the security journey"
];

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(false);
  const completionPercentage = Math.round((currentStep / totalSteps) * 100);
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#01443B] to-[#04AE8A] shadow-sm border-b border-gray-200 rounded-xl">
      <div className="max-w-6xl mx-auto px-4 py-6 ">
        {/* Header Section with Right Side Enhancement */}
        <div className="flex items-center justify-end mb-8">
          {/* Left side - existing TRACS logo */}
          {/* <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-white justify-center rounded-2xl  h-14  "
          >
            <img
              src='/images/G3_sec_ai_logo.png'
              alt="G3 SEC.AI Logo"
              className="w-full h-36 size-10 object- drop-shadow-lg"
              draggable={false}
            />

          </motion.div> */}
          {/* <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="bg-gradient-to-r from-[#01443b] to-[#04AE8A] rounded-lg p-2 mr-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            TRACS
          </h1> */}
          {/* <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-white justify-center mb-10 h-66"
          >
            <img
              src='/images/G3_sec_ai_logo.png'
              alt="G3 SEC.AI Logo"
              className="w-full h-36 size-10 object-none drop-shadow-lg"
              draggable={false}
            />
         
          </motion.div> */}

          {/* Right side - Enhanced Step Indicator */}
          <div className="flex items-center space-x-6">
            {/* Elegant Quote */}
            <div className="hidden lg:block">
              <p className="text-sm italic text-gray-100 font-serif">
                "{progressQuotes[currentStep - 1]}"
              </p>
            </div>

            {/* Vertical Separator */}
            <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

            {/* Progress Stats */}
            <div className="flex items-center space-x-4">
              {/* Circular Progress Indicator */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full bg-blue-50 border-2 border-blue-100"></div>
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    className="text-[#01443B]"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="24"
                    cy="24"
                    strokeDasharray={`${(currentStep / totalSteps) * 125.6} 125.6`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#04AE8A]">{completionPercentage}%</span>
                </div>
              </div>

              {/* Step Counter */}
              <div className="bg-blue-50 px-4 py-2 rounded-full flex items-center space-x-2">
                <Star className="w-4 h-4 text-[#01443b]" />
                <span className="text-sm font-medium text-[#04AE8A]">
                  Step {currentStep} of {totalSteps}
                </span>
                <ChevronRight className="w-4 h-4 text-[#01443b]" />
              </div>

              {/* AI Analytics Button */}
              {/* <button
                onClick={() => setIsAIModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 
                  hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg 
                  shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Brain className="w-4 h-4" />
                <span className="font-medium">AI Analytics</span>
              </button> */}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative pb-12"> {/* Added padding-bottom for labels */}
          {/* Progress Line */}
          <div className="absolute top-4 transform -translate-y-1/2 left-0 w-full h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#01443b] to-[#04AE8A] rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step Points */}
          <div className="relative flex justify-between">
            {stepLabels.map((label, index) => {
              const isCompleted = index < currentStep - 1;
              const isCurrent = index === currentStep - 1;

              return (
                <div key={index} className="relative flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${isCompleted ? 'bg-[#01443B] border-[#01443B]' :
                        isCurrent ? 'bg-white border-[#01443B]' :
                          'bg-white border-gray-300'}`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-sm font-medium
                        ${isCurrent ? 'text-[#01443B]' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Label - Updated positioning */}
                  <div className="absolute top-full pt-4 text-center w-[220px] -translate-x-1/2 left-1/2 p-6 ">
                    <span className={`block w-full text-sm font-medium break-words whitespace-normal  
                      ${isCompleted ? 'text-white' :
                        isCurrent ? 'text-[#04AE8A]' :
                          'text-gray-100'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* <button onClick={() => navigate('/rif-form')} className="ml-6 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-700">
          <span>Fill RIF Form</span>
        </button> */}
        {/* AI Analytics Modal */}
        <AIAnalyticsModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />
      </div>
    </div>
  );
}