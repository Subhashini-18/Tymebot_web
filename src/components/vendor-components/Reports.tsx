import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Share2,
  Plus,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Shield,
  Settings,
  Printer,
  Mail,
} from "lucide-react";
import Button from "../ui/Button";

interface Report {
  id: string;
  name: string;
  type: "summary" | "detailed" | "executive" | "compliance";
  category: string;
  description: string;
  lastGenerated: string;
  generatedBy: string;
  status: "ready" | "generating" | "scheduled" | "error";
  format: "PDF" | "Excel" | "CSV" | "PowerPoint";
  size: string;
  recipients: string[];
  schedule?: "daily" | "weekly" | "monthly" | "quarterly";
  parameters: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  parameters: string[];
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "Monthly Risk Assessment Summary",
    type: "summary",
    category: "Risk Management",
    description:
      "Monthly overview of all vendor risk assessments and key findings",
    lastGenerated: "2024-01-15 09:30",
    generatedBy: "John Doe",
    status: "ready",
    format: "PDF",
    size: "2.4 MB",
    recipients: ["ceo@company.com", "cro@company.com"],
    schedule: "monthly",
    parameters: {
      dateRange: "2024-01-01 to 2024-01-31",
      includedVendors: "All",
      riskLevels: ["High", "Medium", "Low"],
    },
  },
  {
    id: "2",
    name: "High Risk Vendor Analysis",
    type: "detailed",
    category: "Risk Management",
    description:
      "Detailed analysis of high-risk vendors requiring immediate attention",
    lastGenerated: "2024-01-14 15:45",
    generatedBy: "Jane Smith",
    status: "ready",
    format: "Excel",
    size: "1.8 MB",
    recipients: ["risk-team@company.com"],
    parameters: {
      riskThreshold: "High",
      includeRemediation: true,
      timeframe: "30 days",
    },
  },
  {
    id: "3",
    name: "Compliance Dashboard Report",
    type: "compliance",
    category: "Compliance",
    description:
      "Comprehensive compliance status across all regulatory frameworks",
    lastGenerated: "2024-01-13 11:20",
    generatedBy: "Bob Wilson",
    status: "generating",
    format: "PowerPoint",
    size: "-",
    recipients: ["compliance@company.com", "legal@company.com"],
    schedule: "weekly",
    parameters: {
      frameworks: ["GDPR", "SOX", "HIPAA"],
      includeGaps: true,
      executiveSummary: true,
    },
  },
  {
    id: "4",
    name: "Vendor Performance Scorecard",
    type: "executive",
    category: "Vendor Management",
    description: "Executive summary of vendor performance metrics and KPIs",
    lastGenerated: "2024-01-12 14:10",
    generatedBy: "Alice Johnson",
    status: "scheduled",
    format: "PDF",
    size: "3.2 MB",
    recipients: ["board@company.com"],
    schedule: "quarterly",
    parameters: {
      quarter: "Q1 2024",
      includeFinancials: true,
      benchmarking: true,
    },
  },
  {
    id: "5",
    name: "Security Assessment Trends",
    type: "detailed",
    category: "Security",
    description: "Trending analysis of security assessment results over time",
    lastGenerated: "2024-01-11 16:30",
    generatedBy: "Charlie Brown",
    status: "error",
    format: "Excel",
    size: "-",
    recipients: ["security@company.com"],
    parameters: {
      timespan: "6 months",
      includeRemediation: true,
      trendAnalysis: true,
    },
  },
];

const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "Risk Assessment Summary",
    category: "Risk Management",
    description: "Comprehensive overview of vendor risk assessments",
    icon: Shield,
    estimatedTime: "5-10 minutes",
    parameters: ["Date Range", "Vendor Selection", "Risk Levels"],
  },
  {
    id: "2",
    name: "Compliance Report",
    category: "Compliance",
    description: "Regulatory compliance status and gaps analysis",
    icon: CheckCircle,
    estimatedTime: "10-15 minutes",
    parameters: ["Regulatory Framework", "Compliance Status", "Gap Analysis"],
  },
  {
    id: "3",
    name: "Vendor Performance",
    category: "Vendor Management",
    description: "Vendor performance metrics and KPIs",
    icon: TrendingUp,
    estimatedTime: "8-12 minutes",
    parameters: ["Performance Period", "KPI Selection", "Benchmarking"],
  },
  {
    id: "4",
    name: "Executive Dashboard",
    category: "Executive",
    description: "High-level executive summary for leadership",
    icon: BarChart3,
    estimatedTime: "3-5 minutes",
    parameters: ["Reporting Period", "Key Metrics", "Executive Summary"],
  },
  {
    id: "5",
    name: "Security Trends",
    category: "Security",
    description: "Security assessment trends and analysis",
    icon: AlertTriangle,
    estimatedTime: "12-18 minutes",
    parameters: ["Time Period", "Security Metrics", "Trend Analysis"],
  },
  {
    id: "6",
    name: "Audit Trail",
    category: "Audit",
    description: "Complete audit trail of all system activities",
    icon: FileText,
    estimatedTime: "15-20 minutes",
    parameters: ["Audit Period", "Activity Types", "User Selection"],
  },
];

const categories = [
  "All",
  "Risk Management",
  "Compliance",
  "Vendor Management",
  "Security",
  "Executive",
  "Audit",
];
const statusOptions = ["All", "Ready", "Generating", "Scheduled", "Error"];
const formatOptions = ["All", "PDF", "Excel", "CSV", "PowerPoint"];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"reports" | "templates">(
    "reports"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState<string | null>(
    null
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || report.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      report.status === selectedStatus.toLowerCase();
    const matchesFormat =
      selectedFormat === "All" || report.format === selectedFormat;

    return matchesSearch && matchesCategory && matchesStatus && matchesFormat;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4" />;
      case "generating":
        return <Clock className="h-4 w-4 animate-spin" />;
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "PDF":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "Excel":
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case "CSV":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "PowerPoint":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const GenerateReportModal = ({ templateId }: { templateId: string }) => {
    const template = reportTemplates.find((t) => t.id === templateId);
    if (!template) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Generate {template.name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter report name"
                defaultValue={template.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                />
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
                <option value="PowerPoint">PowerPoint</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipients
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter email addresses (comma separated)"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="schedule"
                className="rounded border-gray-300 text-[#01443B] focus:ring-[#01443B]"
              />
              <label htmlFor="schedule" className="ml-2 text-sm text-gray-700">
                Schedule this report
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowGenerateModal(null)}
              variant="primary"
              className="flex-1"
            >
              Generate Report
            </Button>
            <Button
              onClick={() => setShowGenerateModal(null)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ScheduleModal = () =>
    showScheduleModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Schedule Report
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Template
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                {reportTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipients
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter email addresses (comma separated)"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowScheduleModal(false)}
              variant="primary"
              className="flex-1"
            >
              Schedule Report
            </Button>
            <Button
              onClick={() => setShowScheduleModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Generate and manage comprehensive reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowScheduleModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockReports.length}
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
              <p className="text-sm text-gray-600">Ready to Download</p>
              <p className="text-2xl font-bold text-green-600">
                {mockReports.filter((r) => r.status === "ready").length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Download className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-purple-600">
                {mockReports.filter((r) => r.schedule).length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-orange-600">
                {reportTemplates.length}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Generated Reports
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "templates"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Report Templates
          </button>
        </nav>
      </div>

      {activeTab === "reports" && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
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
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                    >
                      {formatOptions.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">
                            {report.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFormatIcon(report.format)}
                          <span className="ml-2 text-sm text-gray-900">
                            {report.format}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.lastGenerated}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {report.generatedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.size}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.schedule ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 capitalize">
                              {report.schedule}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            One-time
                          </span>
                        )}
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
                          {report.status === "ready" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Share2 className="h-3 w-3" />
                            Share
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#01443B]/10 rounded-lg">
                    <template.icon className="h-5 w-5 text-[#01443B]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {template.description}
              </p>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  {template.estimatedTime}
                </div>
                <div className="space-y-1">
                  {template.parameters.slice(0, 3).map((param) => (
                    <div
                      key={param}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <Settings className="h-3 w-3 text-gray-400 mr-2" />
                      {param}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => setShowGenerateModal(template.id)}
                >
                  <FileText className="h-4 w-4" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredReports.length === 0 && activeTab === "reports" && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reports found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ||
            selectedCategory !== "All" ||
            selectedStatus !== "All" ||
            selectedFormat !== "All"
              ? "Try adjusting your search or filters"
              : "Generate your first report to get started"}
          </p>
          <Button onClick={() => setActiveTab("templates")}>
            Browse Templates
          </Button>
        </div>
      )}

      {showGenerateModal && (
        <GenerateReportModal templateId={showGenerateModal} />
      )}
      <ScheduleModal />
    </div>
  );
};

export default Reports;
