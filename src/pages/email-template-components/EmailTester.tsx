import React, { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';

interface EmailTesterProps {
    templateId: string;
    companyId: string;
    templateProps: Record<string, any>;
}

const EmailTester: React.FC<EmailTesterProps> = ({ templateId, companyId, templateProps }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendTest = async () => {
        if (!testEmail) {
            setMessage('Please enter an email address');
            return;
        }

        setIsSending(true);
        try {
            // Simulate sending test email
            await new Promise(resolve => setTimeout(resolve, 2000));
            setMessage('Test email sent successfully!');
            setTestEmail('');
            setTimeout(() => {
                setMessage('');
                setIsOpen(false);
            }, 3000);
        } catch (error) {
            setMessage('Failed to send test email');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
                title="Send Test Email"
            >
                <Mail size={24} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Send Test Email</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Test Email Address
                        </label>
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.includes('success')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleSendTest}
                            disabled={isSending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                        >
                            {isSending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Send size={16} />
                            )}
                            {isSending ? 'Sending...' : 'Send Test'}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailTester;