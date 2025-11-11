import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGeminiAI } from './common/geminiApi'; // <-- Use common Gemini API util
import {
    Brain,
    Bot,
    FileSearch,
    MessageSquare,
    History,
    FileSignature,
    X,
    Loader2,
    AlertCircle,
    BarChart,
    Shield,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { calculateRiskAssessment } from '../utils/riskCalculations';

interface AIAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AnalyticMetric {
    name: string;
    score: number;
    description: string;
    confidence: number;
    icon: React.ElementType;
    question?: string;
}

export default function AIAnalyticsModal({ isOpen, onClose }: AIAnalyticsModalProps) {
    const { formData }: any = useFormContext();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [metrics, setMetrics] = React.useState<AnalyticMetric[]>([]);
    const [aiText, setAiText] = React.useState<string | null>(null);

    // For Smart Questionnaire
    const [question, setQuestion] = React.useState<string | null>(null);
    const [userAnswer, setUserAnswer] = React.useState<string>('');
    const [followupLoading, setFollowupLoading] = React.useState(false);
    const [followupResponse, setFollowupResponse] = React.useState<string | null>(null);

    // Calculate risk metrics using the same logic as RiskSummaryDashboard
    const riskAssessment = React.useMemo(() => calculateRiskAssessment(formData), [formData]);

    React.useEffect(() => {
        if (isOpen) {
            fetchAIAnalytics();
        }
        // eslint-disable-next-line
    }, [isOpen]);

    const fetchAIAnalytics = async () => {
        setLoading(true);
        setError(null);
        setMetrics([]);
        setAiText(null);
        setQuestion(null);
        setUserAnswer('');
        setFollowupResponse(null);

        try {
            const { genAI, model } = getGeminiAI();
            // Use dynamic context from formData for more relevant AI analytics
            const prompt = `
        Given the following third-party risk assessment context:
        Vendor Name: ${formData.thirdPartyLegalName || 'N/A'}
        Country: ${formData.countryOfOperations || 'N/A'}
        Data Types: ${(formData.dataAccessTypes || []).join(', ') || 'N/A'}
        Contract Value: ${formData.contractValue || 'N/A'}
        Certifications: ${(formData.vendorCertifications || []).join(', ') || 'None'}
        Inherent Risk Score: ${riskAssessment.inherentRiskScore}
        Control Effectiveness Score: ${riskAssessment.controlEffectivenessScore}
        Residual Risk Score: ${riskAssessment.residualRiskScore}
        Risk Domains: ${[
                    riskAssessment.regulatoryRisk && 'Regulatory',
                    riskAssessment.financialRisk && 'Financial',
                    riskAssessment.operationalRisk && 'Operational',
                    riskAssessment.reputationalRisk && 'Reputational'
                ].filter(Boolean).join(', ') || 'None'}

        Analyze and rate the following AI smart functions for this scenario (score 1-100, confidence 1-100):
        1. Smart questionnaire suggestion using classification + risk score (also provide a sample question relevant to this scenario as "question")
        2. AI-based evidence evaluation (text/image verification)
        3. Chatbot-guided answering
        4. AI-prompted risk insights from historic data
        5. Similarity score matching of evidence text

        Format response as JSON array with objects containing:
        {
          "name": "function name",
          "score": numeric score,
          "description": "detailed analysis",
          "confidence": confidence percentage,
          "question": "sample question" // only for the first metric
        }
        Then, provide a 2-3 sentence summary of the overall AI analytics for this risk assessment.
      `;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const response = await result.response;
            const text = await response.text();

            // Try to extract JSON array and summary
            const match = text.match(/\[.*?\]/s);
            let parsed: any[] = [];
            if (match) {
                try {
                    parsed = JSON.parse(match[0]);
                } catch {
                    parsed = [];
                }
            }
            setMetrics(
                (parsed || []).map((metric: any, idx: number) => ({
                    ...metric,
                    icon: [Brain, FileSearch, Bot, History, FileSignature][idx]
                }))
            );
            // Extract summary after JSON
            const summary = text.replace(/\[.*?\]/s, '').trim();
            setAiText(summary);

            // Set the smart question if present
            if (parsed && parsed[0] && parsed[0].question) {
                setQuestion(parsed[0].question);
            }
        } catch (err) {
            setError('Failed to fetch AI analytics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle follow-up AI call with user answer
    const handleFollowup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question || !userAnswer) return;
        setFollowupLoading(true);
        setFollowupResponse(null);
        try {
            const { genAI, model } = getGeminiAI();

            const followupPrompt = `
        Given the following risk assessment context:
        Vendor Name: ${formData.thirdPartyLegalName || 'N/A'}
        Country: ${formData.countryOfOperations || 'N/A'}
        Data Types: ${(formData.dataAccessTypes || []).join(', ') || 'N/A'}
        Inherent Risk Score: ${riskAssessment.inherentRiskScore}
        Control Effectiveness Score: ${riskAssessment.controlEffectivenessScore}
        Residual Risk Score: ${riskAssessment.residualRiskScore}

        The user was asked: "${question}"
        The user's answer: "${userAnswer}"

        Based on this answer, provide a concise AI-driven risk insight and actionable recommendation (max 3 sentences).
      `;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: followupPrompt }] }]
            });

            const response = await result.response;
            const text = await response.text();
            setFollowupResponse(text.trim());
        } catch (err) {
            setFollowupResponse('Failed to get AI insight. Please try again.');
        } finally {
            setFollowupLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 ">
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={onClose}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative inline-block  transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-5xl border border-blue-100"
                        >
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50  px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 rounded-lg p-2 mr-3">
                                            <Brain className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            AI Analytics Dashboard
                                        </h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-blue-600"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Risk Metrics Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4 border border-blue-200 flex items-center gap-3">
                                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                                        <div>
                                            <div className="text-xs text-blue-600 font-medium">Inherent Risk</div>
                                            <div className="text-lg font-bold text-blue-900">{riskAssessment.inherentRiskScore}</div>
                                            <div className="text-xs text-gray-500">{riskAssessment.riskMetrics.inherentRisk.level}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-4 border border-green-200 flex items-center gap-3">
                                        <Shield className="w-6 h-6 text-green-600" />
                                        <div>
                                            <div className="text-xs text-green-700 font-medium">Control Effectiveness</div>
                                            <div className="text-lg font-bold text-green-900">{riskAssessment.controlEffectivenessScore}</div>
                                            <div className="text-xs text-gray-500">{riskAssessment.riskMetrics.controlEffectiveness.level}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg p-4 border border-amber-200 flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-amber-600" />
                                        <div>
                                            <div className="text-xs text-amber-700 font-medium">Residual Risk</div>
                                            <div className="text-lg font-bold text-amber-900">{riskAssessment.residualRiskScore}</div>
                                            <div className="text-xs text-gray-500">{riskAssessment.riskMetrics.residualRisk.level}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analytics Section */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart className="w-5 h-5 text-blue-500" />
                                        <span className="font-semibold text-gray-900">AI-Based Smart Functions</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Real-time Gemini AI evaluation of advanced risk management features for this assessment.
                                    </p>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                            <span className="text-blue-700 font-medium">Analyzing with Gemini AI...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            {error}
                                        </div>
                                    ) : (
                                        <div className="space-y-4 overflow-y-auto max-h-screen w-full custom-scrollbar">
                                            {metrics.map((item, idx) => (
                                                <motion.div
                                                    key={item.name}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="bg-white rounded-xl p-4 border border-blue-100 flex items-start gap-4 shadow-sm"
                                                >
                                                    <div className="flex-shrink-0">
                                                        <item.icon className="w-6 h-6 text-blue-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-blue-900">{item.name}</span>
                                                            <span className="flex items-center">
                                                                <span className="text-yellow-500 font-bold mr-1">{item.score}</span>
                                                                <span className="text-xs text-gray-400">/100</span>
                                                            </span>
                                                        </div>
                                                        <div className="text-gray-700 text-sm mb-1">{item.description}</div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>Confidence: {item.confidence}%</span>
                                                            <BarChart className="w-4 h-4" />
                                                        </div>
                                                        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.score}%` }}
                                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                                                className="h-full bg-blue-500"
                                                            />
                                                        </div>
                                                        {/* Smart Questionnaire Interaction */}
                                                        {idx === 0 && question && (
                                                            <div className="mt-4">
                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                                    <div className="font-semibold text-blue-800 mb-2">AI-Suggested Question:</div>
                                                                    <div className="text-gray-900 mb-3">{question}</div>
                                                                    <form onSubmit={handleFollowup} className="flex flex-col md:flex-row gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                            placeholder="Type your answer..."
                                                                            value={userAnswer}
                                                                            onChange={e => setUserAnswer(e.target.value)}
                                                                            required
                                                                            disabled={followupLoading}
                                                                        />
                                                                        <button
                                                                            type="submit"
                                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                                                                            disabled={followupLoading || !userAnswer}
                                                                        >
                                                                            {followupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get AI Insight"}
                                                                        </button>
                                                                    </form>
                                                                    {followupResponse && (
                                                                        <div className="mt-3 bg-blue-100 border border-blue-200 rounded-lg p-3 text-blue-900">
                                                                            <strong>AI Insight:</strong> {followupResponse}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {aiText && (
                                                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-900 text-sm">
                                                    <strong>AI Summary:</strong> {aiText}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

