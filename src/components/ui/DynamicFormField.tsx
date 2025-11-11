import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
// import { Input } from '../Input';
import { TextArea } from './TextArea';
import { Select } from './Select';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { DatePicker } from './DatePicker';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Input } from './form/Input';

interface DynamicFormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select' | 'multiselect' | 'date' | 'textarea' | 'file';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  className?: string;
  helpText?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (value: any) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  name,
  label,
  type = 'text',
  options = [],
  required = false,
  placeholder,
  className = '',
  helpText,
  disabled = false,
  loading = false,
  onChange,
  minDate,
  maxDate,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error: any = errors[name];

  const renderField = (field: any) => {
    const commonProps = {
      ...field,
      disabled: disabled || loading,
      className: `transition-all duration-200 ${field.className || ''}`,
    };

    switch (type) {
      case 'select':
        return (
          <Select
            {...commonProps}
            options={[
              { value: '', label: placeholder || `Select ${label}` },
              ...options
            ]}
            error={error?.message}
            success={field.value && !error}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e.target.value);
            }}
          />
        );

      case 'multiselect':
        return (
          <MultiSelectDropdown
            label=''
            name={name}
            options={options}
            error={error?.message}
            success={field.value?.length > 0 && !error}
            disabled={disabled || loading}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={field.value ? new Date(field.value) : null}
            onChange={(date) => {
              const value = date ? date.toISOString() : '';
              field.onChange(value);
              onChange?.(value);
            }}
            error={error?.message}
            placeholder={placeholder || `Select ${label}`}
            className="w-full"
            minDate={minDate}
            maxDate={maxDate}
          />
        );

      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            error={error?.message}
            success={field.value && !error}
            rows={4}
          />
        );

      case 'file':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type="file"
              error={error?.message}
              success={field.value && !error}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                field.onChange(file);
                onChange?.(file);
              }}
            />
            {field.value && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {field.value.name || 'File selected'}
              </p>
            )}
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={type}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            error={error?.message}
            success={field.value && !error}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 ${className}`}
    >
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {loading && (
          <span className="ml-2 text-xs text-gray-500">Loading...</span>
        )}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => renderField(field)}
      />

      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.message as string}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DynamicFormField;