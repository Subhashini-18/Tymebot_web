import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building,
  Shield,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  Users,
  Activity,
  Target,
  Award,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import Button from "../ui/Button";
import RoleBasedWelcome from "../RoleBasedWelcome";
import { getAuthData } from "@/utils/auth";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const vendorName = getAuthData();
  console.log(vendorName);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("monthly");

  const vendorData = {
    stats: {
      totalQuestionnaires: 18,
      completedQuestionnaires: 15,
      pendingQuestionnaires: 3,
      riskScore: 72,
      complianceScore: 85,
      clients: 12,
    },
    questionnaires: {
      byStatus: {
        Completed: 15,
        "In Progress": 2,
        Pending: 1,
      },
      byCategory: {
        Security: 8,
        Compliance: 4,
        Financial: 3,
        Operational: 3,
      },
    },
    riskTrends: {
      last6Months: [68, 70, 72, 69, 71, 72],
      labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
    recentActivity: [
      {
        id: 1,
        title: "Security Questionnaire Submitted",
        description: "ISO 27001 compliance questionnaire completed",
        time: "2 hours ago",
        type: "success",
        icon: Shield,
      },
      {
        id: 2,
        title: "Risk Assessment Updated",
        description: "Your risk score has been updated to 72",
        time: "1 day ago",
        type: "info",
        icon: Target,
      },
      {
        id: 3,
        title: "New Questionnaire Assigned",
        description: "Financial compliance questionnaire requires attention",
        time: "2 days ago",
        type: "warning",
        icon: FileText,
      },
      {
        id: 4,
        title: "Client Onboarding Complete",
        description: "Successfully onboarded with TechCorp Inc.",
        time: "3 days ago",
        type: "success",
        icon: Building,
      },
    ],
    clients: [
      {
        id: 1,
        name: "TechCorp Inc.",
        industry: "Technology",
        relationship: "Active",
        lastAssessment: "2024-01-15",
        status: "Compliant",
      },
      {
        id: 2,
        name: "Global Manufacturing",
        industry: "Manufacturing",
        relationship: "Active",
        lastAssessment: "2024-01-10",
        status: "Under Review",
      },
      {
        id: 3,
        name: "Financial Services Ltd",
        industry: "Finance",
        relationship: "Active",
        lastAssessment: "2024-01-08",
        status: "Compliant",
      },
      {
        id: 4,
        name: "Healthcare Solutions",
        industry: "Healthcare",
        relationship: "Active",
        lastAssessment: "2024-01-05",
        status: "Pending",
      },
    ],
    upcomingDeadlines: [
      {
        id: 1,
        title: "SOC 2 Type II Report",
        client: "TechCorp Inc.",
        dueDate: "2024-01-25",
        priority: "High",
        status: "Pending",
      },
      {
        id: 2,
        title: "Data Privacy Assessment",
        client: "Financial Services Ltd",
        dueDate: "2024-01-30",
        priority: "Medium",
        status: "In Progress",
      },
      {
        id: 3,
        title: "Business Continuity Plan",
        client: "Healthcare Solutions",
        dueDate: "2024-02-05",
        priority: "Low",
        status: "Not Started",
      },
    ],
  };

  const getQuestionnaireStatusData = () => ({
    labels: Object.keys(vendorData.questionnaires.byStatus),
    datasets: [
      {
        data: Object.values(vendorData.questionnaires.byStatus),
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        hoverBackgroundColor: ["#059669", "#D97706", "#DC2626"],
      },
    ],
  });

  const getQuestionnaireCategoryData = () => ({
    labels: Object.keys(vendorData.questionnaires.byCategory),
    datasets: [
      {
        label: "Questionnaires by Category",
        data: Object.values(vendorData.questionnaires.byCategory),
        backgroundColor: "#01443B",
        borderColor: "#01443B",
        borderWidth: 1,
      },
    ],
  });

  const getRiskTrendsData = () => ({
    labels: vendorData.riskTrends.labels,
    datasets: [
      {
        label: "Risk Score",
        data: vendorData.riskTrends.last6Months,
        borderColor: "#01443B",
        backgroundColor: "rgba(1, 68, 59, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#f3f4f6",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          color: "#f3f4f6",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Non-Compliant":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-600";
      case "info":
        return "bg-blue-50 text-blue-600";
      case "warning":
        return "bg-yellow-50 text-yellow-600";
      case "error":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Role-based Welcome */}
      {/* <RoleBasedWelcome /> */}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {vendorName.tenantName} Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your compliance and risk assessments
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Questionnaires
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {vendorData.stats.totalQuestionnaires}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {vendorData.stats.completedQuestionnaires} completed
              </p>
            </div>
            <div className="p-3 bg-[#01443B]/10 rounded-lg">
              <FileText className="h-8 w-8 text-[#01443B]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {vendorData.stats.riskScore}
              </p>
              <p className="text-sm text-green-600 mt-1">+4% from last month</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Compliance Score
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {vendorData.stats.complianceScore}%
              </p>
              <p className="text-sm text-blue-600 mt-1">Excellent rating</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Clients
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {vendorData.stats.clients}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Strong partnerships
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questionnaire Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Questionnaire Status
              </h3>
              <p className="text-sm text-gray-600">Current completion status</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <PieChart className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="h-80">
            <Doughnut
              data={getQuestionnaireStatusData()}
              options={chartOptions}
            />
          </div>
        </motion.div>

        {/* Risk Score Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Risk Score Trends
              </h3>
              <p className="text-sm text-gray-600">Performance over time</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="h-80">
            <Line data={getRiskTrendsData()} options={lineChartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Questionnaire Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Questionnaires by Category
            </h3>
            <p className="text-sm text-gray-600">
              Distribution across different assessment types
            </p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="h-80">
          <Bar
            data={getQuestionnaireCategoryData()}
            options={barChartOptions}
          />
        </div>
      </motion.div>

      {/* Upcoming Deadlines and Active Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Deadlines
              </h3>
              <p className="text-sm text-gray-600">
                Important dates to remember
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-4">
            {vendorData.upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {deadline.title}
                    </h4>
                    <p className="text-sm text-gray-600">{deadline.client}</p>
                    <p className="text-xs text-gray-500">
                      Due: {deadline.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      deadline.priority
                    )}`}
                  >
                    {deadline.priority}
                  </span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600">
                Latest updates and actions
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4">
            {vendorData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-lg ${getActivityTypeColor(
                    activity.type
                  )}`}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Client Relationships */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Client Relationships
            </h3>
            <p className="text-sm text-gray-600">
              Your active client partnerships
            </p>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Users className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Client Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Industry
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Relationship
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Last Assessment
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vendorData.clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {client.name.substring(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{client.industry}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {client.relationship}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {client.lastAssessment}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        client.status
                      )}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorDashboard;
