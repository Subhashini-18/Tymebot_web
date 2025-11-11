import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  ChevronDown,
  BarChart3,
  FileText,
  PlayCircle,
} from "lucide-react";
import Button from "./ui/Button";

interface Assessment {
  id: string;
  vendorName: string;
  assessmentType: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  score: number | null;
  riskLevel: "low" | "medium" | "high";
  startDate: string;
  completedDate: string | null;
  assignedTo: string;
  questionsTotal: number;
  questionsCompleted: number;
  domain: string;
  lastActivity: string;
}

const mockAssessments: Assessment[] = [
  {
    id: "1",
    vendorName: "TechCorp Solutions",
    assessmentType: "Cybersecurity Assessment",
    status: "completed",
    score: 85,
    riskLevel: "low",
    startDate: "2024-01-10",
    completedDate: "2024-01-15",
    assignedTo: "John Doe",
    questionsTotal: 45,
    questionsCompleted: 45,
    domain: "Security",
    lastActivity: "2024-01-15",
  },
  {
    id: "2",
    vendorName: "DataVault Inc.",
    assessmentType: "Data Privacy Compliance",
    status: "in_progress",
    score: null,
    riskLevel: "medium",
    startDate: "2024-01-12",
    completedDate: null,
    assignedTo: "Jane Smith",
    questionsTotal: 28,
    questionsCompleted: 18,
    domain: "Privacy",
    lastActivity: "2024-01-14",
  },
  {
    id: "3",
    vendorName: "CloudServices Ltd.",
    assessmentType: "Operational Resilience",
    status: "pending",
    score: null,
    riskLevel: "high",
    startDate: "2024-01-16",
    completedDate: null,
    assignedTo: "Bob Wilson",
    questionsTotal: 38,
    questionsCompleted: 0,
    domain: "Operations",
    lastActivity: "2024-01-16",
  },
  {
    id: "4",
    vendorName: "FinancePartner Corp",
    assessmentType: "Financial Controls Review",
    status: "overdue",
    score: null,
    riskLevel: "high",
    startDate: "2024-01-05",
    completedDate: null,
    assignedTo: "Alice Johnson",
    questionsTotal: 32,
    questionsCompleted: 15,
    domain: "Finance",
    lastActivity: "2024-01-08",
  },
  {
    id: "5",
    vendorName: "SecureNet Systems",
    assessmentType: "Cybersecurity Assessment",
    status: "completed",
    score: 92,
    riskLevel: "low",
    startDate: "2024-01-01",
    completedDate: "2024-01-08",
    assignedTo: "John Doe",
    questionsTotal: 45,
    questionsCompleted: 45,
    domain: "Security",
    lastActivity: "2024-01-08",
  },
];

const statusOptions = ["All", "Completed", "In Progress", "Pending", "Overdue"];
const riskLevels = ["All", "Low", "Medium", "High"];
const domains = ["All", "Security", "Privacy", "Operations", "Finance"];

const Assessments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAssessments = mockAssessments.filter((assessment) => {
    const matchesSearch =
      assessment.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.assessmentType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assessment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      assessment.status === selectedStatus.toLowerCase().replace(" ", "_");
    const matchesRisk =
      selectedRisk === "All" ||
      assessment.riskLevel === selectedRisk.toLowerCase();
    const matchesDomain =
      selectedDomain === "All" || assessment.domain === selectedDomain;

    return matchesSearch && matchesStatus && matchesRisk && matchesDomain;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <PlayCircle className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessments</h1>
        <p className="text-gray-600">
          Track and manage vendor assessments and their progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockAssessments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {mockAssessments.filter((a) => a.status === "completed").length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  mockAssessments.filter((a) => a.status === "in_progress")
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {mockAssessments.filter((a) => a.status === "overdue").length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments, vendors, or assigned users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                >
                  {riskLevels.map((risk) => (
                    <option key={risk} value={risk}>
                      {risk}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                >
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Assessments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor & Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssessments.map((assessment, index) => (
                <motion.tr
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#01443B]/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-[#01443B]" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.vendorName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assessment.assessmentType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          assessment.status
                        )}`}
                      >
                        {getStatusIcon(assessment.status)}
                        <span className="ml-1 capitalize">
                          {assessment.status.replace("_", " ")}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assessment.questionsCompleted}/
                      {assessment.questionsTotal}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#01443B] h-2 rounded-full"
                        style={{
                          width: `${getProgressPercentage(
                            assessment.questionsCompleted,
                            assessment.questionsTotal
                          )}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${getRiskColor(
                          assessment.riskLevel
                        )}`}
                      />
                      <span className="text-sm text-gray-900 capitalize">
                        {assessment.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assessment.score ? (
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {assessment.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {assessment.assignedTo}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {assessment.lastActivity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {assessment.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Report
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No assessments found
          </h3>
          <p className="text-gray-600">
            {searchTerm ||
            selectedStatus !== "All" ||
            selectedRisk !== "All" ||
            selectedDomain !== "All"
              ? "Try adjusting your search or filters"
              : "Assessments will appear here once vendors complete questionnaires"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Assessments;
