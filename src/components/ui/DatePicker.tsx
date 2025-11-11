import React, { forwardRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "../../lib/utils/cn";
import { Calendar } from "lucide-react";
// import { FiCalendar } from "react-icons/fi";

// ...existing interface and component code...


export interface DatePickerProps {
    label?: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
    ({
        label,
        value,
        onChange,
        error,
        required,
        placeholder = "Select date",
        minDate,
        maxDate,
        className,
        ...props
    }, ref) => {
        return (
            <div className={cn("w-full space-y-1", className)} ref={ref} {...props}>
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <ReactDatePicker
                        selected={value}
                        onChange={onChange}
                        placeholderText={placeholder}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                            { "border-red-500 focus:border-red-500 focus:ring-red-500": !!error }
                        )}
                        dateFormat="MMMM d, yyyy"
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Calendar size={16} />
                    </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";
