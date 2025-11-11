import { cn } from '@/utils/cn';
import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, HTMLMotionProps, motion, MotionStyle } from 'framer-motion';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'xxl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  position?: 'center' | 'top' | 'bottom';
}
//
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      isOpen,
      onClose,
      size = 'md',
      closeOnOverlayClick = true,
      showCloseButton = true,
      preventScroll = true,
      position = 'center',
      children,
      style = {},
      ...props
    },
    ref,
  ) => {
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      },
      [onClose],
    );

    useEffect(() => {
      if (isOpen && preventScroll) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, handleEscape, preventScroll]);

    const modalVariants = {
      hidden: {
        opacity: 0,
        y: position === 'top' ? -100 : position === 'bottom' ? 100 : 0,
        scale: 0.95,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
      },
      exit: {
        opacity: 0,
        scale: 0.95,
      },
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <div
            className={cn(
              'fixed inset-0 z-50',
              position === 'center' && 'flex items-center justify-center',
              position === 'top' && 'flex items-start justify-center pt-20',
              position === 'bottom' && 'flex items-end justify-center pb-20',
            )}
            role='dialog'
            aria-modal='true'
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm'
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
            <motion.div
              ref={ref}
              variants={modalVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{ type: 'spring', duration: 0.5 }}
              className={cn(
                'relative z-50 rounded-lg bg-white dark:bg-gray-800 shadow-xl',
                'max-h-[90vh] overflow-y-auto',
                {
                  'w-full max-w-md': size === 'md',
                  'w-full max-w-sm': size === 'sm',
                  'w-full max-w-lg': size === 'lg',
                  'w-full max-w-xl': size === 'xl',
                  'w-full h-full': size === 'full',
                },
                className,
              )}
              style={style as MotionStyle}
              {...(props as Omit<HTMLMotionProps<'div'>, 'ref'>)}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className='absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                  aria-label='Close modal'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              )}
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);

Modal.displayName = 'Modal';

{
  /* <Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="md"
  position="center"
  showCloseButton={true}
  preventScroll={true}
>
  <div className="p-6">
    <h2>Modal Content</h2>
    <p>Your content here...</p>
  </div>
</Modal> */
}
