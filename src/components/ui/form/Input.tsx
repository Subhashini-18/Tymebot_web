import React, { forwardRef } from 'react';
// import { cn } from '../../lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

const inputVariants = cva(
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20",
                error: "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                success: "border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
            },
            size: {
                default: "h-10",
                sm: "h-8 px-2",
                lg: "h-12 px-4",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

// export interface InputProps
//     extends React.InputHTMLAttributes<HTMLInputElement>,
//     VariantProps<typeof inputVariants> {
//     error?: string;
//     success?: boolean;
//     icon?: React.ReactNode;
//     trailing?: React.ReactNode;
//     loading?: boolean;

// }

const Input = forwardRef<HTMLInputElement, any>(
    ({ InputclassName, type, error, success, icon, trailing, variant, size, loading, maxCharacters, ...props }: any, ref) => {
        // Determine variant based on error/success state
        const inputVariant = error ? "error" : success ? "success" : variant;

        return (
            <div className="relative">
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            inputVariants({ variant: inputVariant, size }),
                            icon && "pl-10",
                            trailing && "pr-10",
                            InputclassName

                        )}
                        ref={ref}
                        maxLength={maxCharacters}
                        {...props}
                    />
                    {trailing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {trailing}
                        </div>
                    )}
                    {error && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                    {success && !error && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input, inputVariants };
