import { getRiskColor, getRiskLevel } from "../utils/riskCalculations";
import { motion } from 'framer-motion';

const RiskScoreCard = ({ title, score, icon: Icon, description }: {
  title: string;
  score: number;
  icon: React.ComponentType<any>;
  description: string;
}) => {
  const riskLevel = getRiskLevel(score);
  const riskColor = getRiskColor(score);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${score >= 2.5 ? 'from-red-50 to-red-100' :
              score >= 2.0 ? 'from-amber-50 to-amber-100' :
                'from-green-50 to-green-100'
              }`}>
              <Icon className={`w-6 h-6 ${score >= 2.5 ? 'text-red-600' :
                score >= 2.0 ? 'text-amber-600' :
                  'text-green-600'
                }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${riskColor} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${score >= 2.5 ? 'bg-red-500' :
              score >= 2.0 ? 'bg-amber-500' :
                'bg-green-500'
              }`}></span>
            {riskLevel}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{score.toFixed(2)}</span>
              <span className="text-sm text-gray-500">/3.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-1 text-xs rounded-md ${score >= 2.5 ? 'bg-red-50 text-red-700' :
                score >= 2.0 ? 'bg-amber-50 text-amber-700' :
                  'bg-green-50 text-green-700'
                }`}>
                {score >= 2.5 ? 'Action Required' :
                  score >= 2.0 ? 'Monitor' :
                    'Acceptable'}
              </span>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="30"
                cx="40"
                cy="40"
              />
              <circle
                className={score >= 2.5 ? "text-red-500" : score >= 2.0 ? "text-amber-500" : "text-green-500"}
                strokeWidth="6"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="30"
                cx="40"
                cy="40"
                strokeDasharray={`${(score / 3) * 188.5}, 188.5`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className={`w-6 h-6 ${score >= 2.5 ? 'text-red-600' :
                score >= 2.0 ? 'text-amber-600' :
                  'text-green-600'
                }`} />
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Trend</span>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                className={`w-2 h-2 rounded-full ${score >= 2.5 ? 'bg-red-500' :
                  score >= 2.0 ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}
              />
              <span className="text-gray-700 font-medium">
                {score >= 2.5 ? 'High Priority' :
                  score >= 2.0 ? 'Moderate' :
                    'Stable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default RiskScoreCard;