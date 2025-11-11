import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
// import { ThirdPartyTypeOption } from '../../data/formOptions';

interface MultiSelectDropdownProps {
    name: string;
    label: string;
    categories?: any[];
    options?: { value: string; label: string }[];
    required?: boolean;
    dropdownClassName?: string;
    disabled?: boolean; // <-- Add this line
    error?: string; // <-- Add this line
    success?: boolean; // <-- Add this line
}

export const MultiSelectDropdown = ({
    name,
    label,
    categories,
    options,
    required,
    dropdownClassName = 'max-h-60',
    disabled = false,// <-- Add this line
    error, // <-- Add this line
    success // <-- Add this line
}: MultiSelectDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { register, setValue, watch } = useFormContext();
    const selectedValues = watch(name) || [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    };

    const handleOptionSelect = (optionValue: string) => {
        const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v: any) => v !== optionValue)
            : [...selectedValues, optionValue];
        setValue(name, newValues, { shouldValidate: true });
    };

    const getSelectedLabels = () => {
        if (categories) {
            return selectedValues.map((value: any) => {
                const category = categories.find(cat =>
                    cat.subOptions?.includes(value)
                );
                return value;
            });
        }
        return selectedValues.map((value: any) =>
            options?.find(opt => opt.value === value)?.label || value
        );
    };

    // Hidden input for form registration
    register(name, { required });

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div
                className={`relative border border-gray-300 rounded-lg p-2 cursor-pointer bg-white ${disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
            >
                <div className="flex flex-wrap gap-1">
                    {selectedValues.length === 0 ? (
                        <span className="text-gray-500">Select options...</span>
                    ) : (
                        getSelectedLabels().map((label: any, i: any) => (
                            <span
                                key={i}
                                className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full flex items-center"
                            >
                                {label}
                                {!disabled && (
                                    <X
                                        className="ml-1 h-3 w-3 cursor-pointer hover:text-purple-900"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionSelect(selectedValues[i]);
                                        }}
                                    />
                                )}
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className={`${dropdownClassName} absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto custom-scrollbar`}>
                    {categories ? (
                        categories.map((category) => (
                            <div key={category.id} className="border-b border-gray-100 last:border-0">
                                <div
                                    className="px-3 py-2 font-medium cursor-pointer hover:bg-gray-50 text-gray-700"
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    {category.label}
                                </div>
                                {selectedCategory === category.id && category.subOptions && (
                                    <div className="pl-6 pb-2">
                                        {category.subOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="flex items-center px-3 py-1.5 cursor-pointer hover:bg-purple-50"
                                                onClick={() => handleOptionSelect(option)}
                                            >
                                                <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center
                          ${selectedValues.includes(option) ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}
                                                >
                                                    {selectedValues.includes(option) && (
                                                        <Check className="h-3 w-3 text-white" />
                                                    )}
                                                </div>
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        options?.map((option) => (
                            <div
                                key={option.value}
                                className="px-3 py-2 cursor-pointer hover:bg-purple-50 flex items-center"
                                onClick={() => handleOptionSelect(option.value)}
                            >
                                <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center
                  ${selectedValues.includes(option.value) ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}
                                >
                                    {selectedValues.includes(option.value) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </div>
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {success && !error && (
                <Check className="absolute right-9 bottom-1 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
        </div>
    );
};
