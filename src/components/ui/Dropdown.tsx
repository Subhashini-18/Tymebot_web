// import { useTheme ,themes} from '../../contexts/ThemeContext';
import { useTheme } from '../../context/ThemeContext';
import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  items: DropdownItem[];
  value?: string;
  Icon?: any,
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Dropdown = ({
  items,
  value,
  onChange,
  placeholder = 'Select an option',
  Icon,
  className,
  disabled
}: DropdownProps) => {
  const { currentTheme }: any = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(item => item.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className} `}>

      <div className={`absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none`}>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2
          flex items-center justify-between
          border rounded-lg
          ${Icon ? 'pl-10 ' : ''} 
          ${currentTheme?.secondary}
          ${currentTheme?.text}
          border-gray-300
          hover:border-gray-400
          focus:outline-none focus:ring-2
          focus:ring-${currentTheme?.accent}
        `}
        disabled={disabled}
      >
        <span className={!selectedItem ? 'text-gray-400' : ''}>
          {selectedItem ? selectedItem?.label : placeholder}
        </span>

        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`
          absolute z-10 w-full mt-1
          border rounded-lg shadow-lg 
          bg-white
          border-gray-300
          max-h-60 overflow-auto
        `}>
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onChange?.(item.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2 bg-white
                flex items-center gap-2
                hover:${currentTheme?.accent} hover:bg-opacity-10
                ${item.value === value ? `bg-gray-400 bg-opacity-10` : ''}
                ${currentTheme?.text}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 