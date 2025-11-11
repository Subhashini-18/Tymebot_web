import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building,
  Shield,
  Users,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  Globe,
  Settings,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Activity,
  Target,
  Award,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Zap,
  AlertCircle,
  TrendingDown,
  Filter,
  ExternalLink,
  Search,
  ChevronRight,
  CircleDot,
  Layers,
  Database,
  CreditCard,
  AlertOctagon,
  Briefcase,
  PieChart,
  BarChart,
  LineChart,
  Map,
  Mail,
  Phone,
  Monitor,
  HardDrive,
  Wifi,
  Server,
  CloudOff,
  CheckCircle2,
  XCircle,
  Bell,
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
  RadialLinearScale,
} from "chart.js";
import { Bar, Line, Doughnut, Radar, Pie } from "react-chartjs-2";
import Button from "../ui/Button";
import WorldMap from "../WorldMap";
import RoleBasedWelcome from "../RoleBasedWelcome";

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
  Filler,
  RadialLinearScale
);

const PlatformDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("monthly");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const platformData = {
    stats: {
      activeClients: 24,
      totalVendors: 342,
      totalAssessments: 1247,
      avgRiskScore: 72,
      clientsThisMonth: 3,
      clientsThisQuarter: 8,
      clientChurn: 2,
      totalLicenses: 1250,
      usedLicenses: 1035,
      expiringSoon: 5,
      storageUsed: 850, // GB
      storageTotal: 2000, // GB
      regulatoryRequests: 23,
      openRequests: 7,
      avgResponseTime: 24, // hours
      clientEngagement: 82, // percentage
    },
    clientDistribution: {
      Enterprise: 12,
      "Mid-Market": 8,
      "Small Business": 4,
    },
    clientStatusBreakdown: {
      Active: 18,
      Expired: 3,
      Suspended: 1,
      Trial: 1,
      Pending: 1,
    },
    subscriptionTiers: {
      Basic: 8,
      Pro: 11,
      Enterprise: 5,
    },
    riskTrends: {
      last30Days: [65, 68, 70, 72, 69, 74, 71, 73, 72, 75],
      labels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
        "Week 8",
        "Week 9",
        "Week 10",
      ],
    },
    clientGeoDistribution: {
      "North America": 45,
      Europe: 32,
      "Asia Pacific": 28,
      "Latin America": 15,
      "Middle East": 12,
    },
    industryDistribution: {
      Technology: 8,
      Finance: 6,
      Healthcare: 4,
      Manufacturing: 3,
      Retail: 2,
      Other: 1,
    },
    engagementMetrics: {
      logins: [120, 135, 142, 158, 165, 172, 168, 175, 182, 190],
      assessments: [45, 52, 48, 61, 58, 65, 62, 68, 70, 73],
      users: [89, 92, 95, 98, 101, 104, 107, 110, 113, 116],
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
      ],
    },
    licenseData: [
      {
        id: 1,
        clientName: "TechCorp Inc.",
        allocated: 50,
        used: 45,
        tier: "Enterprise",
        expiry: "2024-06-15",
        storage: { used: 35, total: 50 },
        status: "Active",
      },
      {
        id: 2,
        clientName: "Global Manufacturing",
        allocated: 30,
        used: 28,
        tier: "Pro",
        expiry: "2024-02-28",
        storage: { used: 18, total: 25 },
        status: "Expiring",
      },
      {
        id: 3,
        clientName: "Financial Services Ltd",
        allocated: 75,
        used: 68,
        tier: "Enterprise",
        expiry: "2024-08-20",
        storage: { used: 42, total: 75 },
        status: "Active",
      },
      {
        id: 4,
        clientName: "Healthcare Solutions",
        allocated: 25,
        used: 25,
        tier: "Pro",
        expiry: "2024-05-10",
        storage: { used: 20, total: 25 },
        status: "Near Limit",
      },
      {
        id: 5,
        clientName: "Retail Enterprise",
        allocated: 40,
        used: 35,
        tier: "Pro",
        expiry: "2024-07-30",
        storage: { used: 28, total: 40 },
        status: "Active",
      },
    ],
    regulatoryRequests: [
      {
        id: 1,
        type: "Data Export",
        client: "TechCorp Inc.",
        region: "EU",
        status: "Open",
        priority: "High",
        sla: "24 hours",
        submitted: "2024-01-14",
        remaining: 8,
      },
      {
        id: 2,
        type: "Data Deletion",
        client: "Global Manufacturing",
        region: "US",
        status: "In Progress",
        priority: "Medium",
        sla: "72 hours",
        submitted: "2024-01-13",
        remaining: 48,
      },
      {
        id: 3,
        type: "Audit Report",
        client: "Financial Services Ltd",
        region: "UK",
        status: "Resolved",
        priority: "Low",
        sla: "168 hours",
        submitted: "2024-01-10",
        remaining: 0,
      },
      {
        id: 4,
        type: "Regulatory Inquiry",
        client: "Healthcare Solutions",
        region: "CA",
        status: "Escalated",
        priority: "Critical",
        sla: "12 hours",
        submitted: "2024-01-15",
        remaining: 2,
      },
    ],
    recentActivity: [
      {
        id: 1,
        title: "New Client Onboarded",
        description: "TechCorp Inc. has been successfully onboarded",
        time: "2 hours ago",
        type: "success",
        icon: Building,
      },
      {
        id: 2,
        title: "Risk Assessment Completed",
        description: "Global Manufacturing completed vendor assessment",
        time: "4 hours ago",
        type: "info",
        icon: Shield,
      },
      {
        id: 3,
        title: "High Risk Vendor Identified",
        description: "DataSync Solutions flagged as high risk",
        time: "6 hours ago",
        type: "warning",
        icon: AlertTriangle,
      },
      {
        id: 4,
        title: "Monthly Report Generated",
        description: "December 2024 platform report available",
        time: "1 day ago",
        type: "info",
        icon: FileText,
      },
    ],
    topClients: [
      {
        id: 1,
        name: "TechCorp Inc.",
        industry: "Technology",
        vendors: 45,
        riskScore: 68,
        status: "Active",
        lastActivity: "2024-01-15",
      },
      {
        id: 2,
        name: "Global Manufacturing",
        industry: "Manufacturing",
        vendors: 32,
        riskScore: 74,
        status: "Active",
        lastActivity: "2024-01-14",
      },
      {
        id: 3,
        name: "Financial Services Ltd",
        industry: "Finance",
        vendors: 28,
        riskScore: 81,
        status: "Active",
        lastActivity: "2024-01-13",
      },
      {
        id: 4,
        name: "Healthcare Solutions",
        industry: "Healthcare",
        vendors: 22,
        riskScore: 69,
        status: "Active",
        lastActivity: "2024-01-12",
      },
      {
        id: 5,
        name: "Retail Enterprise",
        industry: "Retail",
        vendors: 18,
        riskScore: 72,
        status: "Active",
        lastActivity: "2024-01-11",
      },
    ],
  };

  // Chart configurations
  const getClientDistributionData = () => ({
    labels: Object.keys(platformData.clientDistribution),
    datasets: [
      {
        data: Object.values(platformData.clientDistribution),
        backgroundColor: ["#01443B", "#09B591", "#6366F1"],
        hoverBackgroundColor: ["#023d34", "#08a082", "#5856eb"],
      },
    ],
  });

  const getClientStatusData = () => ({
    labels: Object.keys(platformData.clientStatusBreakdown),
    datasets: [
      {
        data: Object.values(platformData.clientStatusBreakdown),
        backgroundColor: [
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#3B82F6",
          "#6B7280",
        ],
        hoverBackgroundColor: [
          "#059669",
          "#D97706",
          "#DC2626",
          "#2563EB",
          "#4B5563",
        ],
      },
    ],
  });

  const getSubscriptionTierData = () => ({
    labels: Object.keys(platformData.subscriptionTiers),
    datasets: [
      {
        data: Object.values(platformData.subscriptionTiers),
        backgroundColor: ["#06B6D4", "#8B5CF6", "#F59E0B"],
        hoverBackgroundColor: ["#0891B2", "#7C3AED", "#D97706"],
      },
    ],
  });

  const getIndustryData = () => ({
    labels: Object.keys(platformData.industryDistribution),
    datasets: [
      {
        data: Object.values(platformData.industryDistribution),
        backgroundColor: [
          "#01443B",
          "#09B591",
          "#6366F1",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
        hoverBackgroundColor: [
          "#023d34",
          "#08a082",
          "#5856eb",
          "#D97706",
          "#DC2626",
          "#7C3AED",
        ],
      },
    ],
  });

  const getEngagementTrendsData = () => ({
    labels: platformData.engagementMetrics.labels,
    datasets: [
      {
        label: "Monthly Logins",
        data: platformData.engagementMetrics.logins,
        borderColor: "#01443B",
        backgroundColor: "rgba(1, 68, 59, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "New Assessments",
        data: platformData.engagementMetrics.assessments,
        borderColor: "#09B591",
        backgroundColor: "rgba(9, 181, 145, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        yAxisID: "y1",
      },
      {
        label: "Active Users",
        data: platformData.engagementMetrics.users,
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        yAxisID: "y2",
      },
    ],
  });

  const getRiskTrendsData = () => ({
    labels: platformData.riskTrends.labels,
    datasets: [
      {
        label: "Average Risk Score",
        data: platformData.riskTrends.last30Days,
        borderColor: "#01443B",
        backgroundColor: "rgba(1, 68, 59, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed} (${(
              (context.parsed /
                context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                )) *
              100
            ).toFixed(1)}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeOutQuart",
    },
    elements: {
      arc: {
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    },
  };

  const lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        intersect: false,
        mode: "index" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#f3f4f6",
          lineWidth: 1,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const multiAxisChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        intersect: false,
        mode: "index" as const,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Logins",
          color: "#01443B",
          font: {
            size: 12,
            weight: "600",
          },
        },
        grid: {
          color: "#f3f4f6",
          lineWidth: 1,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Assessments",
          color: "#09B591",
          font: {
            size: 12,
            weight: "600",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y2: {
        type: "linear" as const,
        display: false,
        position: "right" as const,
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#f3f4f6",
          lineWidth: 1,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
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
            Platform Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage your third-party risk intelligence platform
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
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Clients
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.activeClients}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{platformData.stats.clientsThisMonth} this month
              </p>
            </div>
            <div className="p-3 bg-[#01443B]/10 rounded-lg">
              <Building className="h-8 w-8 text-[#01443B]" />
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
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.totalVendors}
              </p>
              <p className="text-sm text-blue-600 mt-1">+8% from last month</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">License Usage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.usedLicenses}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                of {platformData.stats.totalLicenses} total
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard className="h-8 w-8 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Storage Usage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.storageUsed}GB
              </p>
              <p className="text-sm text-green-600 mt-1">
                of {platformData.stats.storageTotal}GB
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <HardDrive className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.avgRiskScore}
              </p>
              <p className="text-sm text-yellow-600 mt-1">Platform Average</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.totalAssessments}
              </p>
              <p className="text-sm text-blue-600 mt-1">+15% from last month</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Regulatory Requests
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.openRequests}
              </p>
              <p className="text-sm text-red-600 mt-1">
                of {platformData.stats.regulatoryRequests} total
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertOctagon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {platformData.stats.clientEngagement}%
              </p>
              <p className="text-sm text-green-600 mt-1">Client Activity</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Client Distribution
              </h3>
              <p className="text-sm text-gray-600">Clients by business size</p>
            </div>
            <div className="p-2 bg-[#01443B]/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-[#01443B]" />
            </div>
          </div>
          <div className="h-80">
            <Doughnut
              data={getClientDistributionData()}
              options={chartOptions}
            />
          </div>
        </motion.div>

        {/* Client Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Client Status
              </h3>
              <p className="text-sm text-gray-600">
                Active vs inactive clients
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="h-80">
            <Pie data={getClientStatusData()} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Charts Section - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Industry Distribution
              </h3>
              <p className="text-sm text-gray-600">
                Clients by industry sector
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="h-80">
            <Doughnut data={getIndustryData()} options={chartOptions} />
          </div>
        </motion.div>

        {/* Subscription Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Subscription Tiers
              </h3>
              <p className="text-sm text-gray-600">
                Revenue by subscription level
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="h-80">
            <Pie data={getSubscriptionTierData()} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Large Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Global Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Global Client Distribution
              </h3>
              <p className="text-sm text-gray-600">
                Interactive map showing client locations worldwide
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Regional View
              </Button>
            </div>
          </div>
          <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
            <WorldMap
              regionData={platformData.clientGeoDistribution}
              onRegionClick={(region) => setSelectedRegion(region)}
              selectedRegion={selectedRegion}
            />
          </div>
        </motion.div>

        {/* Engagement Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Platform Engagement Trends
              </h3>
              <p className="text-sm text-gray-600">
                Monthly platform usage metrics across different activities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option>Last 10 Months</option>
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
              </select>
            </div>
          </div>
          <div className="h-96">
            <Line
              data={getEngagementTrendsData()}
              options={multiAxisChartOptions}
            />
          </div>
        </motion.div>

        {/* Risk Trends */}
        {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Risk Score Trends</h3>
                            <p className="text-sm text-gray-600">Platform average risk score trends over time</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-600">Good (80+)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-600">Medium (60-79)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-600">High Risk (60)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-80">
                        <Line data={getRiskTrendsData()} options={lineChartOptions} />
                    </div>
                </motion.div> */}
      </div>

      {/* License Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              License Management
            </h3>
            <p className="text-sm text-gray-600">
              Monitor client license usage and expiration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add License
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  Client
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  Tier
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  Usage
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  Storage
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  Expiry
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {platformData.licenseData.map((license) => (
                <tr key={license.id} className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="font-medium text-gray-900">
                      {license.clientName}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {license.tier}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (license.used / license.allocated) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {license.used}/{license.allocated}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (license.storage.used / license.storage.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {license.storage.used}/{license.storage.total}GB
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm text-gray-600">
                      {license.expiry}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        license.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : license.status === "Expiring"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {license.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Regulatory Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Regulatory Requests
            </h3>
            <p className="text-sm text-gray-600">
              Track compliance and regulatory submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertOctagon className="h-5 w-5 text-red-600" />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {platformData.regulatoryRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      request.priority === "Critical"
                        ? "bg-red-100 text-red-800"
                        : request.priority === "High"
                        ? "bg-orange-100 text-orange-800"
                        : request.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {request.priority}
                  </span>
                  <span className="font-medium text-gray-900">
                    {request.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {request.client}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      request.status === "Open"
                        ? "bg-blue-100 text-blue-800"
                        : request.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {request.region}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">SLA: {request.sla}</span>
                <span className="text-gray-600">
                  {request.remaining > 0
                    ? `${request.remaining} hours remaining`
                    : "Overdue"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System Health & Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.55 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              System Health & Performance
            </h3>
            <p className="text-sm text-gray-600">
              Real-time platform performance metrics and system status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Monitor className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">99.8%</div>
            <div className="text-sm text-gray-600">Server Uptime</div>
            <div className="text-xs text-green-600 mt-1">+0.2% this month</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">245ms</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
            <div className="text-xs text-green-600 mt-1">-12ms improved</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">42%</div>
            <div className="text-sm text-gray-600">Database Load</div>
            <div className="text-xs text-green-600 mt-1">Optimal range</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <Wifi className="h-5 w-5 text-yellow-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">Active Connections</div>
            <div className="text-xs text-blue-600 mt-1">+5% increase</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-600">
              Commonly used platform functions
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/create-credentials")}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Add Client</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/risk-assessments")}
          >
            <Shield className="h-6 w-6" />
            <span className="text-sm">Risk Assessment</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/reports")}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Generate Report</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/audit-logs")}
          >
            <Database className="h-6 w-6" />
            <span className="text-sm">Audit Logs</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/alerts-notifications")}
          >
            <Bell className="h-6 w-6" />
            <span className="text-sm">Alerts</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-6 w-6" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </motion.div>

      {/* Top Clients and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Top Clients
              </h3>
              <p className="text-sm text-gray-600">
                Most active clients on the platform
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="space-y-4">
            {platformData.topClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {client.name.substring(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-600">
                      {client.industry} • {client.vendors} vendors
                    </p>
                    <p className="text-xs text-gray-500">
                      Last active: {client.lastActivity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div
                      className={`text-sm font-semibold ${getRiskScoreColor(
                        client.riskScore
                      )}`}
                    >
                      {client.riskScore}
                    </div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600">
                Latest platform activities
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-4">
            {platformData.recentActivity.map((activity) => (
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
    </div>
  );
};

export default PlatformDashboard;
