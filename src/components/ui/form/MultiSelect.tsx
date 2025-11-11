import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  name: string;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  singleSelect?: boolean;
  onChange?: (selectedOptions: string[]) => void;
  value?: string[];
  disabled?: boolean;
  searchPlaceholder?: string;
}

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({
    className,
    label,
    name,
    options,
    placeholder = "Select options",
    searchPlaceholder = "Search...",
    singleSelect,
    onChange,
    value = [],
    disabled,
    ...props
  }, ref) => {
    const { currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    // Filter options based on search query
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = value.filter(v => v !== optionValue);
      onChange?.(newValue);
    };

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    // Add click outside listener to close dropdown
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery(''); // Clear search query when closing
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className='space-y-1 relative' ref={containerRef}>
        {label && (
          <label className='block text-sm font-medium text-gray-600 mb-1'>
            {label}
          </label>
        )}
        <div
          className={cn(
            'min-h-[42px] rounded-md border border-gray-200 bg-white px-3 py-2',
            'transition-all duration-200 ease-in-out cursor-pointer',
            'hover:border-purple-300 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-100',
            disabled && 'cursor-not-allowed opacity-50 bg-gray-50',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1.5">
            {selectedOptions.length === 0 && (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            )}
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-100"
              >
                {option.label}
                {!disabled && (
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-purple-800 transition-colors"
                    onClick={(e) => handleRemoveOption(option.value, e)}
                  />
                )}
              </span>
            ))}
          </div>
          {/* Hidden select element */}
          <select
            multiple
            value={value}
            className="hidden"
            ref={ref}
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
              onChange?.(selectedValues);
            }}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="overflow-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'px-3 py-1.5 text-sm cursor-pointer transition-colors',
                      'hover:bg-purple-50',
                      value.includes(option.value) && 'bg-purple-50 text-purple-700'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newValue = value.includes(option.value)
                        ? value.filter(v => v !== option.value)
                        : singleSelect ? [option.value] : [...value, option.value];

                      onChange?.(newValue);

                      // Clear search after selection
                      if (singleSelect) {
                        setIsOpen(false);
                        setSearchQuery('');
                      }
                    }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);



MultiSelect.displayName = 'MultiSelect';
