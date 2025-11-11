import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Building,
  User,
  RefreshCw,
  Eye,
  Settings,
  Plus,
} from "lucide-react";
import Button from "../ui/Button";

interface ReassessmentSchedule {
  id: string;
  vendorName: string;
  assessmentType: string;
  lastAssessment: string;
  nextDue: string;
  frequency: string;
  status: "upcoming" | "due" | "overdue" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo: string;
  riskLevel: "low" | "medium" | "high";
  daysUntilDue: number;
  autoReminder: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "assessment" | "reminder" | "review";
  vendor: string;
  status: "upcoming" | "due" | "overdue";
}

const mockSchedules: ReassessmentSchedule[] = [
  {
    id: "1",
    vendorName: "TechCorp Solutions",
    assessmentType: "Cybersecurity Assessment",
    lastAssessment: "2024-01-15",
    nextDue: "2024-04-15",
    frequency: "Quarterly",
    status: "upcoming",
    priority: "high",
    assignedTo: "John Doe",
    riskLevel: "high",
    daysUntilDue: 30,
    autoReminder: true,
  },
  {
    id: "2",
    vendorName: "DataVault Inc.",
    assessmentType: "Data Privacy Compliance",
    lastAssessment: "2023-12-10",
    nextDue: "2024-01-20",
    frequency: "Monthly",
    status: "due",
    priority: "high",
    assignedTo: "Jane Smith",
    riskLevel: "medium",
    daysUntilDue: 3,
    autoReminder: true,
  },
  {
    id: "3",
    vendorName: "CloudServices Ltd.",
    assessmentType: "Operational Resilience",
    lastAssessment: "2023-11-01",
    nextDue: "2024-01-15",
    frequency: "Semi-annually",
    status: "overdue",
    priority: "high",
    assignedTo: "Bob Wilson",
    riskLevel: "high",
    daysUntilDue: -2,
    autoReminder: true,
  },
  {
    id: "4",
    vendorName: "FinancePartner Corp",
    assessmentType: "Financial Controls Review",
    lastAssessment: "2023-10-15",
    nextDue: "2024-01-25",
    frequency: "Annually",
    status: "upcoming",
    priority: "medium",
    assignedTo: "Alice Johnson",
    riskLevel: "low",
    daysUntilDue: 8,
    autoReminder: false,
  },
  {
    id: "5",
    vendorName: "SecureNet Systems",
    assessmentType: "Cybersecurity Assessment",
    lastAssessment: "2024-01-08",
    nextDue: "2024-04-08",
    frequency: "Quarterly",
    status: "completed",
    priority: "medium",
    assignedTo: "John Doe",
    riskLevel: "low",
    daysUntilDue: 67,
    autoReminder: true,
  },
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "TechCorp Solutions - Cybersecurity Assessment",
    date: "2024-01-20",
    type: "assessment",
    vendor: "TechCorp Solutions",
    status: "upcoming",
  },
  {
    id: "2",
    title: "DataVault Inc. - Privacy Review",
    date: "2024-01-18",
    type: "reminder",
    vendor: "DataVault Inc.",
    status: "due",
  },
  {
    id: "3",
    title: "CloudServices Ltd. - Operational Review",
    date: "2024-01-15",
    type: "assessment",
    vendor: "CloudServices Ltd.",
    status: "overdue",
  },
];

const statusOptions = ["All", "Upcoming", "Due", "Overdue", "Completed"];
const priorityOptions = ["All", "Low", "Medium", "High"];
const frequencyOptions = [
  "All",
  "Monthly",
  "Quarterly",
  "Semi-annually",
  "Annually",
];

const ContinuousAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"schedule" | "calendar">(
    "schedule"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedFrequency, setSelectedFrequency] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const filteredSchedules = mockSchedules.filter((schedule) => {
    const matchesSearch =
      schedule.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.assessmentType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      schedule.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      schedule.status === selectedStatus.toLowerCase();
    const matchesPriority =
      selectedPriority === "All" ||
      schedule.priority === selectedPriority.toLowerCase();
    const matchesFrequency =
      selectedFrequency === "All" || schedule.frequency === selectedFrequency;

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesFrequency
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "due":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      case "due":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const ScheduleModal = () =>
    showScheduleModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Schedule New Assessment
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="">Select vendor</option>
                <option value="vendor1">TechCorp Solutions</option>
                <option value="vendor2">DataVault Inc.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="">Select assessment type</option>
                <option value="security">Cybersecurity Assessment</option>
                <option value="privacy">Data Privacy Compliance</option>
                <option value="operations">Operational Resilience</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="">Select frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annually">Semi-annually</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowScheduleModal(false)}
              variant="primary"
              className="flex-1"
            >
              Schedule Assessment
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
              Continuous Assessment
            </h1>
            <p className="text-gray-600">
              Track upcoming reassessments and maintain continuous vendor
              monitoring
            </p>
          </div>
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Schedule Assessment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due This Week</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  mockSchedules.filter(
                    (s) => s.status === "due" && s.daysUntilDue <= 7
                  ).length
                }
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {mockSchedules.filter((s) => s.status === "overdue").length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockSchedules.filter((s) => s.status === "upcoming").length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Auto Reminders</p>
              <p className="text-2xl font-bold text-green-600">
                {mockSchedules.filter((s) => s.autoReminder).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "schedule"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Schedule View
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "calendar"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Calendar View
          </button>
        </nav>
      </div>

      {activeTab === "schedule" && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors, assessments, or assigned users..."
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
                      Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={selectedFrequency}
                      onChange={(e) => setSelectedFrequency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                    >
                      {frequencyOptions.map((frequency) => (
                        <option key={frequency} value={frequency}>
                          {frequency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Schedule Table */}
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
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auto Reminder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule, index) => (
                    <motion.tr
                      key={schedule.id}
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
                              {schedule.vendorName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {schedule.assessmentType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            schedule.status
                          )}`}
                        >
                          {getStatusIcon(schedule.status)}
                          <span className="ml-1 capitalize">
                            {schedule.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {schedule.nextDue}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.daysUntilDue > 0
                            ? `${schedule.daysUntilDue} days`
                            : schedule.daysUntilDue === 0
                            ? "Due today"
                            : `${Math.abs(schedule.daysUntilDue)} days overdue`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {schedule.frequency}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${getPriorityColor(
                              schedule.priority
                            )}`}
                          />
                          <span className="text-sm text-gray-900 capitalize">
                            {schedule.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {schedule.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {schedule.autoReminder ? (
                            <div className="flex items-center text-green-600">
                              <Bell className="h-4 w-4 mr-1" />
                              <span className="text-sm">On</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Off</span>
                          )}
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            Edit
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

      {activeTab === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Calendar View
            </h3>
            <p className="text-gray-600 mb-6">
              Interactive calendar view for reassessment scheduling
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCalendarEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-600">{event.vendor}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSchedules.length === 0 && activeTab === "schedule" && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No schedules found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ||
            selectedStatus !== "All" ||
            selectedPriority !== "All" ||
            selectedFrequency !== "All"
              ? "Try adjusting your search or filters"
              : "Schedule assessments to track vendor compliance continuously"}
          </p>
          <Button onClick={() => setShowScheduleModal(true)}>
            Schedule First Assessment
          </Button>
        </div>
      )}

      <ScheduleModal />
    </div>
  );
};

export default ContinuousAssessment;
