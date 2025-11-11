import React from 'react';
// import { cn } from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
// import { cn } from '../../lib/utils/cn';

const textAreaVariants = cva(
    'w-full min-h-[80px] rounded-lg transition-colors focus:outline-none resize-vertical',
    {
        variants: {
            variant: {
                default: 'border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
                error: 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500',
                success: 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500',
            },
            size: {
                default: 'px-4 py-3 text-sm',
                sm: 'px-3 py-2 text-sm',
                lg: 'px-6 py-4 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textAreaVariants> {
    error?: string;
    icon?: React.ReactNode;
    label?: string;
    helpText?: string;
    maxCharacters?: number;
    showCharacterCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            className='border',
            error,
            icon,
            label,
            helpText,
            variant = 'default',
            size,
            maxCharacters,
            showCharacterCount,
            value = '',
            onChange,
            ...props
        },
        ref
    ) => {
        const [characterCount, setCharacterCount] = React.useState(0);

        React.useEffect(() => {
            setCharacterCount(value?.toString().length || 0);
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (maxCharacters && e.target.value.length > maxCharacters) {
                return;
            }
            if (onChange) {
                onChange(e);
            }
        };

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {icon && <span className="inline-block mr-2">{icon}</span>}
                        {label}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        ref={ref}
                        className={cn(
                            textAreaVariants({ variant: error ? 'error' : variant, size }),
                            icon && 'pl-10',
                            className
                        )}
                        onChange={handleChange}
                        value={value}
                        {...props}
                    />
                    {icon && (
                        <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                            {icon}
                        </div>
                    )}
                </div>
                <div className="flex justify-between mt-1">
                    {(error || helpText) && (
                        <div className="flex-1">
                            {error && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {error}
                                </p>
                            )}
                            {helpText && !error && (
                                <p className="text-sm text-gray-500">{helpText}</p>
                            )}
                        </div>
                    )}
                    {showCharacterCount && (
                        <div className={cn(
                            "text-xs",
                            maxCharacters && characterCount >= maxCharacters ? "text-red-500" : "text-gray-500"
                        )}>
                            {characterCount}/{maxCharacters || '∞'}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

export { TextArea, textAreaVariants };
