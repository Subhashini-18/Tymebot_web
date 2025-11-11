import React, { useState } from 'react';

const CallButtonWithPopup = ({ onSubmit }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        onSubmit(reason);
        setReason('');
        setIsPopupOpen(false);
    };

    return (
        <div className="relative">
            {/* Call Button */}
            <button
                className="flex items-center bg-violet-600 text-white rounded-full transition-all duration-300 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
                style={{
                    padding: isHovered ? '0.75rem 1.5rem 0.75rem 0.75rem' : '0.75rem',
                    width: isHovered ? 'auto' : 'auto',
                    overflow: 'hidden',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsPopupOpen(true)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                </svg>
                <span
                    className="ml-2 whitespace-nowrap overflow-hidden transition-all duration-300"
                    style={{
                        maxWidth: isHovered ? '150px' : '0',
                        opacity: isHovered ? 1 : 0,
                    }}
                >
                    Request to Call
                </span>
            </button>

            {/* Popup */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            onClick={() => setIsPopupOpen(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Popup Content */}
                        <h2 className="text-xl font-bold text-violet-800 mb-4">Request to Call</h2>
                        <div className="mb-4">
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Reason for Call
                            </label>
                            <textarea
                                id="reason"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                placeholder="Please provide a reason for your call request..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
                            onClick={handleSubmit}
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallButtonWithPopup;