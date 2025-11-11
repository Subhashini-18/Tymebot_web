import { HTMLInputTypeAttribute, ReactNode } from "react";
import { useFormContext as useRHFContext, Controller } from "react-hook-form";
import { Input } from "./Input";
import { TextArea } from "./TextArea";
import { DatePicker } from "./DatePicker";
import { parseDate } from "@/utils/dateUtils";

interface FormFieldProps {
  label: string;
  name: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  className?: string;
  children?: ReactNode;
  helpText?: string;
  error?: string;
  icon?: ReactNode;
  textarea?: boolean;
  maxCharacters?: number;
  maxCharactersInput?: number;
  showCharacterCount?: boolean;
  rows?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>; // <-- Add this line
  InputclassName?: string;
  options?: { label: string; value: any }[]; // <-- Add this line
  disabled?: boolean;
}

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  className = "",
  children,
  helpText,
  error,
  icon,
  textarea = false,
  maxCharacters,
  maxCharactersInput,
  showCharacterCount,
  rows = 4,
  inputProps, // <-- Add this line
  InputclassName, // <-- Add this line
  options, // <-- Add this line
  disabled = false, // <-- Add this line
}: FormFieldProps) {
  const formContext = useRHFContext();
  console.log(maxCharactersInput)
  // If no form context is provided but children exist, render them
  if (!formContext && children) {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const { control } = formContext || {};

  // If no form context and no children, return null or an error message
  if (!control) {
    console.error('FormField must be used within a FormProvider');
    return null;
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children ? (
        children
      ) : (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: { error: fieldError } }) =>
            textarea ? (
              <TextArea
                {...field}
                rows={rows}
                maxCharacters={maxCharacters}
                showCharacterCount={showCharacterCount}
                placeholder={placeholder}
                icon={icon}
                error={fieldError?.message || error}
                helpText={helpText}
              />
            ) : type === 'select' && options ? (
              <select
                {...field}
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${InputclassName || ''} ${fieldError ? 'border-red-500' : 'border-gray-300'}`}
                required={required}
              >
                <option value="">{placeholder || 'Select an option'}</option>
                {options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : type === 'date' ? (
              <div className="w-full">
                <DatePicker
                  label={undefined}
                  value={parseDate(field.value)}
                  onChange={(date) => {
                    console.log(`Date changed for field ${name}:`, date);
                    // Save as ISO string if date is picked, else null
                    const isoString = date ? date.toISOString() : null;
                    console.log(`Setting field ${name} to:`, isoString);
                    field.onChange(isoString);
                  }}
                  error={fieldError?.message || error}
                  required={required}
                  placeholder={placeholder}
                  className="w-full"
                />
              </div>
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                icon={icon}
                error={fieldError?.message || error}
                success={type !== 'checkbox' && !fieldError && field.value}
                value={field.value || ""}
                checked={type === 'checkbox' ? field.value : undefined}
                {...inputProps}
                maxCharacters={maxCharactersInput}
                InputclassName={InputclassName}
              />
            )
          }
        />
      )}
    </div>
  );
}
