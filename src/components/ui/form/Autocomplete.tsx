import React, { useState, useRef, useEffect } from 'react';
// import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useFormContext } from 'react-hook-form';
// import { get } from '@/services/api/apiService';
import { useToast } from '@/context/ToastContext';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { Tooltip } from './ToolTip';
import { cn } from '@/utils/cn';
import { apiService } from '@/service/apiservice';

export interface AutocompleteProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSelect'> {
  label?: string | React.ReactNode;
  name: string;
  options?: { value: string; label: string }[];
  endpoint?: string;  
  dependsOn?: string;
  port?: number;
  value?: any;
  optionsMapping?: {
    value?: string;
    label?: string;
  };
  errors?: any;
  onChange?: any;
  onSelect?: (value: string) => void;
  onValuSelect?: (value: string) => void;
  initialValue?: { value?: string; label?: string } | null;
  tooltipText?: string;
  error?: any;
  rules?: any;
  toolTipPosition?: 'top' | 'right' | 'bottom' | 'left';
  labelValue?: string;
  isUpwardOptions?: boolean;
  isAllowNumeric?: boolean;
  isHighlighted?: boolean;
  highlightedMessage?: string;

}

export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      className,
      label,
      name,
      port,
      options: staticOptions = [],
      endpoint,
      dependsOn,
      optionsMapping = { value: 'id', label: 'name' },
      onSelect,
      onValuSelect,
      initialValue,
      tooltipText,
      error,
      rules,
      toolTipPosition,
      labelValue,
      isUpwardOptions = false,
      isAllowNumeric = false,
      isHighlighted,
      highlightedMessage,
      ...props
    },
    ref,
  ) => {
    const { currentTheme }:any = useTheme();
    const {
      setValue,
      getValues,
      formState: { errors },
      watch,
      clearErrors,
    } = useFormContext();
    const { showToast } = useToast();
    error = errors[name]?.message as string;

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialValue?.label || '');
    const [options, setOptions] = useState<{ value: string; label: string }[]>(staticOptions);
    const [filteredOptions, setFilteredOptions] =
      useState<{ value: string; label: string }[]>(staticOptions);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Add this function to find option by label
    const findOptionByLabel = (options: { value: string; label: string }[], searchLabel: string) => {
      return options.find(opt => opt.label === searchLabel);
    };

    // Initialize with form values or initialValue
    useEffect(() => {
      if (staticOptions.length > 0) {
        setOptions(staticOptions);
        setFilteredOptions(staticOptions);
      }
    }, [staticOptions]);

    useEffect(() => {
      const formValue = getValues(name);
      if (formValue) {
        const selectedOption = findOptionByLabel(options, formValue.toString()) ||
          options.find(opt => opt.value === formValue.toString());
        if (selectedOption) {
          setInputValue(selectedOption.label);
        }
      } else if (initialValue) {
        setInputValue(initialValue.label || '');
        setValue(name, initialValue.value || '');
      }
    }, [options]);

    // Modify the fetchOptions function
    useEffect(() => {
      const fetchOptions = async () => {
        if (!endpoint) return;

        try {
          const formValues = watch();
          const dependsOnValue = dependsOn ? formValues[dependsOn] : null;
          const url = dependsOn ? `${endpoint}?${dependsOn}=${dependsOnValue}` : endpoint;

          if (!dependsOn || dependsOnValue) {
            const response: any = await apiService.get(url, port);
            const fetchedOptions = (response?.data || [])
              ?.filter((item: any) => item.isActive === true)
              ?.map((item: any) => ({
                value: item[optionsMapping.value || 'id']?.toString(),
                label: item[optionsMapping.label || 'name'],
              }));

            setOptions(fetchedOptions);
            setFilteredOptions(fetchedOptions);

            // Handle initial form value using labelValue
            if (labelValue) {
              const selectedOption = fetchedOptions.find(opt => opt.label === labelValue);
              if (selectedOption) {
                setInputValue(selectedOption.label);
                setValue(name, selectedOption.value);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching options:', error);
          showToast({
            message: `Failed to load ${label} options`,
            type: 'error',
          });
        }
      };

      fetchOptions();
    }, [endpoint, dependsOn, watch(dependsOn ?? ''), labelValue]);

    // Handle outside clicks
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!isAllowNumeric && !/^[a-zA-Z]*$/.test(value)) {
        return; // Exit early if input is not valid
      }
      setInputValue(value);
      setIsOpen(true);

      const filtered =
        value === ''
          ? options
          : options.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredOptions(filtered);
    };

    const handleOptionSelect = (option: { value: string; label: string }) => {
      setInputValue(option.label);
      setValue(name, option.value);
      clearErrors(name);
      setIsOpen(false);
      onSelect?.(option.value);
      onValuSelect?.(option.label);
    };

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFilteredOptions(options);
      }
    };

    return (
      <div className='space-y-2' ref={wrapperRef}>
        {label && (
          <div className='flex items-center gap-2'>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
              {tooltipText && <Tooltip text={tooltipText} position={toolTipPosition} />}
            </label>
          </div>
        )}
        <div className='relative'>
          <div className='relative flex items-center'>
            <input
              type='text'
              style={{
                backgroundColor: '#fff',
                // || currentTheme.colors.background,
                color: '#000',
                // || currentTheme.colors.text,
              }}
              className={cn(
                'w-full rounded-lg border border-primaryBorder/50 bg-background pr-10 pl-4 py-2.5 text-text shadow-sm',
                'transition-all duration-200 ease-in-out',
                'focus:border-accent/50 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background/50',
                error
                  ? 'border-red-600/60 focus:border-red-600/70 focus:ring-red-600/10 bg-red-50/10'
                  : 'border-slate-300/70 bg-slate-50',
                isHighlighted
                  ? 'border-amber-500 bg-amber-50/40 text-amber-900 placeholder:text-amber-600'
                  : '',
                className,
              )}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              ref={ref}
              {...props}
            />
            <button
              type='button'
              onClick={toggleDropdown}
              className={cn(
                'absolute right-3 p-1 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {isOpen && filteredOptions.length > 0 && (
            <ul
              style={{
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
              }}
              className={cn(
                'absolute z-10 w-full overflow-auto rounded-lg border border-primaryBorder/50',
                'bg-white shadow-lg divide-y divide-gray-100',
                isUpwardOptions
                  ? 'bottom-full mb-1'
                  : 'top-full mt-1',
                'max-h-[205px]',
                'scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
              )}
            >
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={cn(
                    'px-4 py-2.5 cursor-pointer text-sm text-gray-700',
                    'hover:bg-accent/10 hover:text-accent',
                    'transition-colors duration-150 ease-in-out',
                    'h-[41px]'
                  )}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>{error}</p>}
        {highlightedMessage && (
          <p className='text-sm mt-1.5 flex items-center gap-1.5 animate-fadeIn'>
            <span className='text-slate-600 font-medium'>Previous:</span>
            <span className='text-amber-600 font-medium underline decoration-amber-400 decoration-2 underline-offset-2'>
              {options.find((item: any) => item.value == highlightedMessage)?.label || 'Not found'}           </span>
          </p>
        )}
      </div>
    );
  },
);

Autocomplete.displayName = 'Autocomplete';

export default Autocomplete;
