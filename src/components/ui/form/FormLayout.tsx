import React from 'react';
import { cn } from '@/utils/cn';

export interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const FormLayout = React.forwardRef<HTMLDivElement, FormLayoutProps>(
  ({ children, className, spacing = 'md' }, ref) => {
    const spacingClasses = {
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-2xl mx-auto p-6',
          spacingClasses[spacing],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

FormLayout.displayName = 'FormLayout'; 