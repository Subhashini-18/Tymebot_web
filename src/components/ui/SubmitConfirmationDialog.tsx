import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react';

interface SubmitConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'info' | 'success';
    questionCount?: number;
    isSubmitting?: boolean;
}

const SubmitConfirmationDialog: React.FC<SubmitConfirmationDialogProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title = "Confirm Submission",
    message = "Are you sure you want to proceed?",
    confirmText = "Submit",
    cancelText = "Cancel",
    type = 'warning',
    questionCount = 0,
    isSubmitting = false
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'info':
                return <AlertCircle className="w-6 h-6 text-blue-500" />;
            default:
                return <AlertCircle className="w-6 h-6 text-orange-500" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700';
            default:
                return 'bg-orange-600 hover:bg-orange-700';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={onCancel}
                    >
                        {/* Dialog */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    {getIcon()}
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {title}
                                    </h3>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    {message}
                                </p>

                                {questionCount > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">
                                                {questionCount} question{questionCount > 1 ? 's' : ''} ready to submit
                                            </span>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Your responses will be saved and submitted to the system.
                                        </p>
                                    </div>
                                )}

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">
                                                Please note:
                                            </p>
                                            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                                <li>• Once submitted, responses cannot be modified</li>
                                                <li>• Make sure all information is accurate</li>
                                                <li>• You will receive a confirmation after submission</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={onCancel}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </div>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SubmitConfirmationDialog;