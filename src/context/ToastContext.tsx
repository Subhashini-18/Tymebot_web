import { createContext, useContext, useState } from 'react';
import { 
  Check,
  X, 
  Info,
  AlertCircle
} from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: string;
}

interface ToastContextType {
  showToast: (toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const MAX_TOASTS = 3; // Maximum number of visible toasts

  const showToast = (toast: { message: string; type: string }) => {
    const id = Date.now();

    setToasts((prev) => {
      // Check if a toast with the same message already exists
      const isDuplicate = prev.some((t) => t.message === toast.message);
      if (isDuplicate) {
        return prev; // Don't add duplicate toast
      }

      // Add new toast and limit to MAX_TOASTS
      const newToasts = [...prev, { ...toast, id }];
      return newToasts.slice(-MAX_TOASTS);
    });

    // Remove this specific toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };
  
  // Function to get toast title based on type
  const getToastTitle = (type: string): string => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Info';
      default: return '';
    }
  };
  
  // Function to get toast icon based on type
  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
            <Check className="w-5 h-5 text-white" />
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500">
            <X className="w-5 h-5 text-white" />
          </div>
        );
      case 'info':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
            <Info className="w-5 h-5 text-white" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  // Function to get toast style based on type
  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500';
      case 'error':
        return 'border-l-4 border-red-500';
      case 'warning':
        return 'border-l-4 border-yellow-500';
      case 'info':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 w-96">
        {toasts.map((toast) => {
          return (
            <div
              key={toast.id}
              className={`mb-4 bg-white rounded shadow-lg ${getToastStyle(toast.type)}`}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <div className="relative flex items-center px-4 py-3">
                {getToastIcon(toast.type)}
                
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-900">{getToastTitle(toast.type)}</p>
                  <p className="text-sm text-gray-600">{toast.message}</p>
                </div>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Demo component to show all toast types
export default function ToastDemo() {
  const { showToast } = useToast();
  
  return (
    <div className="p-4">
      <ToastProvider>
        <div className="space-y-2">
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => showToast({ message: 'Your changes saved successfully', type: 'success' })}
          >
            Show Success Toast
          </button>
          
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => showToast({ message: 'Error has occured while saving changes.', type: 'error' })}
          >
            Show Error Toast
          </button>
          
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => showToast({ message: 'New settings available on your account.', type: 'info' })}
          >
            Show Info Toast
          </button>
          
          <button 
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={() => showToast({ message: 'Username you have entered is invalid.', type: 'warning' })}
          >
            Show Warning Toast
          </button>
        </div>
        
        {/* Static preview of all toast types to match the image */}
        <div className="mt-8">
          <div className="mb-4 bg-white rounded shadow-lg border-l-4 border-green-500" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div className="relative flex items-center px-4 py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900">Success</p>
                <p className="text-sm text-gray-600">Your changes saved successfully</p>
              </div>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mb-4 bg-white rounded shadow-lg border-l-4 border-red-500" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div className="relative flex items-center px-4 py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500">
                <X className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900">Error</p>
                <p className="text-sm text-gray-600">Error has occured while saving changes.</p>
              </div>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mb-4 bg-white rounded shadow-lg border-l-4 border-blue-500" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div className="relative flex items-center px-4 py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900">Info</p>
                <p className="text-sm text-gray-600">New settings available on your account.</p>
              </div>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mb-4 bg-white rounded shadow-lg border-l-4 border-yellow-500" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div className="relative flex items-center px-4 py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900">Warning</p>
                <p className="text-sm text-gray-600">Username you have entered is invalid.</p>
              </div>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </ToastProvider>
    </div>
  );
}