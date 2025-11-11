import { ChevronDown, ChevronUp, Minimize2 } from "lucide-react";
import Button from "../ui/Button";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils/cn";
import { TimelineItem } from "../../types/FormTypes";

const RenderFullScreenTimeline = ({
  timelineItems,
  expandedYear,
  setIsFullScreen,
  toggleYearExpand,
}: {
  timelineItems: TimelineItem[];
  expandedYear: string | null;
  setIsFullScreen: (value: boolean) => void;
  toggleYearExpand: (year: string) => void;
}) => (
  <div className="fixed inset-0 bg-white z-50 overflow-auto custom-scrollbar">
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 sticky top-0 bg-white py-4 z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Partner Journey
            </h2>
            <p className="text-gray-500 mt-2">
              Tracking the spiritual growth and contributions since{" "}
              {timelineItems[0].date}
            </p>
          </div>
          <Button
            onClick={() => setIsFullScreen(false)}
            className="p-2 bg-gray-200 hover:bg-gray-400 rounded-full transition-colors"
          >
            <Minimize2 className="w-6 h-6 text-gray-600" />
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

          <div className="space-y-16">
            {timelineItems.map((item, index) => (
              <div key={item.date} className="relative">
                {/* Year Section with Expand/Collapse */}
                <div
                  className={cn(
                    "p-6 rounded-lg border border-gray-200 shadow-sm transition-all duration-300",
                    expandedYear === item.date ? "bg-gray-50" : "bg-white",
                    "hover:shadow-md cursor-pointer"
                  )}
                  onClick={() => toggleYearExpand(item.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: item.color }}
                      >
                        <div className="text-white">{item.icon}</div>
                      </div>
                      <div>
                        <h3
                          className="text-2xl font-bold"
                          style={{ color: item.color }}
                        >
                          {item.date}
                        </h3>
                        <p className="text-gray-600">{item.title}</p>
                      </div>
                    </div>
                    {expandedYear === item.date ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedYear === item.date && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pl-18"
                    >
                      <div className="border-l-2 border-gray-200 pl-6 ml-7 space-y-6">
                        {/* Key Responsibilities */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Key Responsibilities
                          </h4>
                          <ul className="space-y-3">
                            {getVendorDetails(item.date).responsibilities.map(
                              (resp, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-3"
                                >
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  <span className="text-gray-600">{resp}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        {/* Vendor Metrics */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <p className="text-sm text-gray-500">
                              Annual Contract Value
                            </p>
                            <p className="text-xl font-bold text-blue-600">
                              $
                              {getVendorDetails(
                                item.date
                              ).metrics.contractValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              USD/Year
                            </p>
                          </div>
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <p className="text-sm text-gray-500">
                              Criticality Score
                            </p>
                            <p className="text-xl font-bold text-purple-600">
                              {
                                getVendorDetails(item.date).metrics
                                  .criticalityScore
                              }
                              %
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Business Impact
                            </p>
                          </div>
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <p className="text-sm text-gray-500">
                              Compliance Score
                            </p>
                            <p className="text-xl font-bold text-green-600">
                              {
                                getVendorDetails(item.date).metrics
                                  .complianceScore
                              }
                              %
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Regulatory Alignment
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface VendorDetails {
  responsibilities: string[];
  metrics: {
    contractValue: number;
    criticalityScore: number;
    complianceScore: number;
  };
}

const getVendorDetails = (type: string): VendorDetails => {
  const details: { [key: string]: VendorDetails } = {
    "1st Party": {
      responsibilities: [
        "Primary service delivery and management",
        "Direct customer data handling",
        "Core infrastructure maintenance",
      ],
      metrics: {
        contractValue: 500000,
        criticalityScore: 95,
        complianceScore: 98,
      },
    },
    "2nd Party": {
      responsibilities: [
        "Cloud infrastructure and hosting services",
        "Data center operations and management",
        "Backup and disaster recovery",
      ],
      metrics: {
        contractValue: 250000,
        criticalityScore: 85,
        complianceScore: 92,
      },
    },
    "3rd Party": {
      responsibilities: [
        "Security monitoring and threat detection",
        "Compliance reporting and auditing",
        "Incident response support",
      ],
      metrics: {
        contractValue: 150000,
        criticalityScore: 75,
        complianceScore: 88,
      },
    },
    "4th Party": {
      responsibilities: [
        "Specialized security testing",
        "Penetration testing and vulnerability assessment",
        "Security training and awareness",
      ],
      metrics: {
        contractValue: 75000,
        criticalityScore: 65,
        complianceScore: 82,
      },
    },
  };
  return details[type] || details["4th Party"];
};

export default RenderFullScreenTimeline;
