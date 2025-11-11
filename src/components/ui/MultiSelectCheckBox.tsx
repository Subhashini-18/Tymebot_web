import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils/cn';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    required?: boolean;
    icon?: React.ReactNode;
    error?: string;
    helpText?: string;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
    ({ label, name, options, required, icon, error, helpText }, ref) => {
        const { register, setValue, watch } = useFormContext();
        const [isOpen, setIsOpen] = useState(false);
        const selectedValues = watch(name) || [];
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const toggleOption = (value: string) => {
            const newValues = selectedValues.includes(value)
                ? selectedValues.filter((v:any) => v !== value)
                : [...selectedValues, value];
            setValue(name, newValues, { shouldValidate: true });
        };

        const removeValue = (value: string) => {
            setValue(name, selectedValues.filter((v:any) => v !== value), { shouldValidate: true });
        };

        return (
            <div ref={dropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {icon && <span className="inline-block mr-2">{icon}</span>}
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Selected Items Display */}
                <div className="min-h-[42px] p-1 border rounded-lg bg-white flex flex-wrap gap-1 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}>
                    {selectedValues.length > 0 ? (
                        selectedValues.map((value:any) => {
                            const option = options.find(opt => opt.value === value);
                            return (
                                <span key={value}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm">
                                    {option?.label}
                                    <X className="w-4 h-4 ml-1 cursor-pointer hover:text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeValue(value);
                                        }} />
                                </span>
                            );
                        })
                    ) : (
                        <span className="px-2 py-1.5 text-gray-500">Select options...</span>
                    )}
                    <ChevronDown className={`w-4 h-4 ml-auto self-center transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {options.map(({ value, label }) => (
                            <div
                                key={value}
                                className={cn(
                                    "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50",
                                    selectedValues.includes(value) && "bg-blue-50"
                                )}
                                onClick={() => toggleOption(value)}
                            >
                                <div className={cn(
                                    "w-4 h-4 border rounded mr-2 flex items-center justify-center",
                                    selectedValues.includes(value) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                                )}>
                                    {selectedValues.includes(value) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm text-gray-700">{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}

                {/* Hidden input for form handling */}
                <input type="hidden" {...register(name)} value={selectedValues} />
            </div>
        );
    }
);

MultiSelect.displayName = 'MultiSelect';
