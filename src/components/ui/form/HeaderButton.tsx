import React, { JSX } from 'react';
import { FileText } from 'lucide-react'; // Default icon fallback
import Button from '../ui/Button';
// import { Button } from './Button';

const HeaderButtons = ({
  activeButton,
  setActiveButton,
  incomingModes,
  onHeaderButtonClick,
  iconMap = {}
}: {
  activeButton: string;
  setActiveButton: (val: string) => void;
  incomingModes: any[];
  onHeaderButtonClick: (mode: any) => void;
  iconMap?: Record<string, JSX.Element>; // modeName (lowercase) -> icon component
}) => {
  const getButtonIcon = (modeName: string) => {
    return iconMap?.[modeName?.toLowerCase()] || <FileText className="w-5 h-5" />;
  };

  return (
    <div className="flex gap-10 w-full">
      {incomingModes?.map((mode: any) => {
        const name = mode?.modeOfPrintingName;
        const isActive = activeButton === name;
        return (
          <Button
            key={name}
            onClick={() => {
              onHeaderButtonClick(mode);
              setActiveButton(name);
            }}
            className={`
              group relative flex items-center
              h-12 w-[170px] mx-1
              transition-all duration-300 ease-in-out
              hover:transform hover:scale-[1.02]
              !ring-0
            `}
          >
            {/* Circle */}
            <div
              className={`
                absolute z-20 left-2
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isActive ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-white border-2 border-gray-100'}
              `}
            >
              <span className={isActive ? 'text-white' : 'text-gray-600'}>
                {getButtonIcon(name)}
              </span>
            </div>

            {/* Rectangle */}
            <div
              className={`absolute left-6 right-0 h-10 rounded-r-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg shadow-purple-200/50'
                  : 'bg-white'
              }`}
            >
              <span
                className={`absolute left-6 h-full flex items-center justify-start font-medium text-xs transition-all duration-300 truncate pr-4 ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}
              >
                {name}
              </span>
            </div>

            {/* Hover/Active */}
            {!isActive && (
              <div className="absolute inset-0 z-10 rounded-r-xl opacity-0 transition-all duration-300 bg-gradient-to-r from-purple-50 to-purple-100/50" />
            )}
            {isActive && (
              <div className="absolute inset-0 rounded-r-xl animate-pulse z-0 border-0" />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default HeaderButtons;
