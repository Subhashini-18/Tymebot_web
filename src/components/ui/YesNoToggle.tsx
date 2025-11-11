import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface YesNoToggleProps {
    name: string;
    methods: UseFormReturn<any>;
    defaultValue?: boolean;
    onChange?: (value: boolean) => void;
    className?: string;
    disabled?: boolean;
}

const YesNoToggle: React.FC<YesNoToggleProps> = ({
    name,
    methods,
    defaultValue = false,
    onChange,
    className = '',
    disabled = false
}) => {
    const { register, watch } = methods;
    const value = watch(name);

    const handleChange = (newValue: boolean) => {
        methods.setValue(name, newValue, { shouldValidate: true });
        onChange?.(newValue);
    };

    return (
        <div className={`flex gap-6 ${className}`}>
            {[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' }
            ].map(({ value: optionValue, label }) => (
                <label
                    key={optionValue.toString()}
                    className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input
                        type="radio"
                        {...register(name, {
                            value: defaultValue,
                            onChange: (e) => handleChange(e.target.value === 'true')
                        })}
                        value={optionValue.toString()}
                        checked={value === optionValue}
                        disabled={disabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
            ))}
        </div>
    );
};

export default YesNoToggle;
