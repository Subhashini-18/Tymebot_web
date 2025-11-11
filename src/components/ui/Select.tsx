import React, { forwardRef, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils/cn';
import { Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  error?: string;
  icon?: React.ReactNode;
  label?: string;
  helpText?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    options,
    error,
    success,
    icon,
    label,
    helpText,
    size = 'md',
    ...props
  }, ref) => {
    // Only use RHF register if inside a FormProvider and name is provided
    const formContext = useFormContext();
    const register = useMemo(() => {
      return formContext && props.name ? formContext.register(props.name) : {};
    }, [formContext, props.name]);

    // Memoize options to prevent unnecessary re-renders
    const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

    // Size classes
    const sizeClasses = useMemo(() => {
      switch (size) {
        case 'sm':
          return 'h-8 px-2 text-sm';
        case 'lg':
          return 'h-12 px-4 text-lg';
        default:
          return 'h-10 px-3 text-md';
      }
    }, [size]);

    // Determine variant based on error/success state
    const variant = error ? 'error' : success ? 'success' : 'default';

    // Select classes
    const selectClasses = useMemo(() => cn(
      "block w-full rounded-lg border bg-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      "border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
      error && "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
      success && "border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
      icon && "pl-10",
      sizeClasses,
      className
    ), [error, success, icon, sizeClasses, className]);

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={props.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            {...register}
            {...props}
            className={selectClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${props.name}-error` : undefined}
          >
            {memoizedOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {success && !error && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
          )}
        </div>
        {error && (
          <p
            id={`${props.name}-error`}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </p>
        )}
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };