import React from 'react';
import { Tooltip } from './ToolTip';
import { cn } from '@/utils/cn';

interface CheckboxProps { 
  id?: string;
  label: string;
  checked?: any;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
  toolTipText?: string;
  toolTipPosition?: 'top' | 'right' | 'bottom' | 'left';
  isHighlighted?: boolean;
  highlightedMessage?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  error,
  toolTipText,
  className = '',
  toolTipPosition,
  isHighlighted,
  highlightedMessage,
  disabled = false,
  
}) => {
  return (
    <div className={className}>
      <div className='flex items-center'>
        <input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={cn(
            'h-4 w-4 border-gray-300 rounded focus:ring-primary cursor-pointer',
            isHighlighted ? 'border-amber-500 bg-amber-50/40 text-amber-600' : 'text-primary'
          )}
        />
        <label id={id} htmlFor={id} className='ml-2 block text-sm text-gray-700 cursor-pointer'>
          {label}
          {toolTipText && <Tooltip text={toolTipText} position={toolTipPosition} />}
        </label>
      </div>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
      {highlightedMessage && (
        <p className='text-sm mt-1.5 flex items-center gap-1.5 animate-fadeIn'>
          <span className='text-slate-600 font-medium'>Previous:</span>
          <span className='text-amber-600 font-medium underline decoration-amber-400 decoration-2 underline-offset-2'>
            {highlightedMessage}
          </span>
        </p>
      )}
    </div>
  );
};
