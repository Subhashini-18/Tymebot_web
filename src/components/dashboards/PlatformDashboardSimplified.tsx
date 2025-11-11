import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
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
import { usePlatformDashboard } from "@/hooks/usePlatformDashboard";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Use the custom hook
  const {
    data,
    summary,
    charts,
    topClients,
    loading,
    error,
    lastUpdated,
    selectedTimeframe,
    selectedRegion,
    isStale,
    hasData,
    isEmpty,
    fetchData,
    refresh,
    changeTimeframe,
    changeRegion,
    dismissError,
    reset,
  } = usePlatformDashboard({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    initialTimeframe: "monthly",
    initialRegion: null,
  });

  // Mock data for additional sections (keeping the old functionality)
  const mockData = {
    clientGeoDistribution: {
      "North America": 45,
      Europe: 32,
      "Asia Pacific": 28,
      "Latin America": 15,
      "Middle East": 12,
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
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = async (timeframe: string) => {
    try {
      await changeTimeframe(timeframe);
    } catch (error) {
      console.error("Failed to change timeframe:", error);
    }
  };

  // Helper function for activity type colors
  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  // Chart configurations
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
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage =
              total > 0 ? ((context.parsed / total) * 100).toFixed(1) : "0";
            return `${context.label}: ${context.parsed} (${percentage}%)`;
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
          text: "Active Users",
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

  // Helper function to create chart data
  const createChartData = (
    labels: string[],
    data: number[],
    colors: string[]
  ) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        hoverBackgroundColor: colors.map((color) => color + "CC"), // Add transparency for hover
      },
    ],
  });

  // Helper function to create line chart data
  const createLineChartData = () => {
    if (!charts?.engagementTrends) return null;

    const { labels, logins, activeUsers, assessments } =
      charts.engagementTrends;

    return {
      labels,
      datasets: [
        {
          label: "Monthly Logins",
          data: logins,
          borderColor: "#01443B",
          backgroundColor: "rgba(1, 68, 59, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Active Users",
          data: activeUsers,
          borderColor: "#09B591",
          backgroundColor: "rgba(9, 181, 145, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
        {
          label: "New Assessments",
          data: assessments,
          borderColor: "#6366F1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y2",
        },
      ],
    };
  };

  // Loading state
  if (loading && !hasData) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#01443B] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600">Fetching platform analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (when no data is available)
  if (error && !hasData) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
              >
                {showErrorDetails ? "Hide Details" : "Show Details"}
              </Button>
            </div>
            {showErrorDetails && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                <pre className="text-sm text-red-700 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Error Banner */}
      <AnimatePresence>
        {error && hasData && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Failed to refresh dashboard data
                </p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={dismissError}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stale Data Warning */}
      {/* <AnimatePresence>
                {isStale && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    Dashboard data may be outdated
                                </p>
                                <p className="text-sm text-yellow-600">
                                    Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
                        >
                            Refresh Now
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence> */}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage your third-party risk intelligence platform
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            disabled={loading}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          {/* <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button> */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""
                }`}
            />
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
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {summary?.totalClients || 0}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {summary?.activeClients || 0} active
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
                {summary?.totalVendors || 0}
              </p>
              <p className="text-sm text-blue-600 mt-1">Across all clients</p>
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
              <p className="text-sm font-medium text-gray-600">
                Total Licenses
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {summary?.totalLicenses || 0}
              </p>
              <p className="text-sm text-purple-600 mt-1">Active licenses</p>
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
                {summary?.storageUsage || "0 MB"}
              </p>
              <p className="text-sm text-orange-600 mt-1">Platform storage</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <HardDrive className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Client Status Distribution
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            {charts?.statusDistribution &&
              charts.statusDistribution.data.length > 0 ? (
              <Doughnut
                data={createChartData(
                  charts.statusDistribution.labels,
                  charts.statusDistribution.data,
                  ["#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#6B7280"]
                )}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No status data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Industry Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Industry Distribution
            </h3>
            <BarChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            {charts?.industryDistribution &&
              charts.industryDistribution.data.length > 0 ? (
              <Pie
                data={createChartData(
                  charts.industryDistribution.labels,
                  charts.industryDistribution.data,
                  [
                    "#01443B",
                    "#09B591",
                    "#6366F1",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                  ]
                )}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No industry data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Business Size Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Business Size Distribution
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            {charts?.businessSizeDistribution &&
              charts.businessSizeDistribution.data.length > 0 ? (
              <Doughnut
                data={createChartData(
                  charts.businessSizeDistribution.labels,
                  charts.businessSizeDistribution.data,
                  ["#06B6D4", "#8B5CF6", "#F59E0B", "#10B981"]
                )}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No business size data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Subscription Tier Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Tiers
            </h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            {charts?.subscriptionTierDistribution &&
              charts.subscriptionTierDistribution.data.length > 0 ? (
              <Pie
                data={createChartData(
                  charts.subscriptionTierDistribution.labels,
                  charts.subscriptionTierDistribution.data,
                  ["#06B6D4", "#8B5CF6", "#F59E0B"]
                )}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No subscription data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Global Client Distribution and Engagement Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
                regionData={mockData.clientGeoDistribution}
                onRegionClick={(region) => changeRegion(region)}
                selectedRegion={selectedRegion}
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Engagement Trends
              </h3>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-96">
              {createLineChartData() ? (
                <Line
                  data={createLineChartData()!}
                  options={lineChartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No engagement data available
                </div>
              )}
            </div>
          </motion.div>
        </div>
        {/* Global Client Distribution */}

        {/* Engagement Trends */}
      </div>

      {/* License Management */}
      {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">License Management</h3>
                        <p className="text-sm text-gray-600">Monitor client license usage and expiration</p>
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
                                <th className="text-left py-3 text-sm font-medium text-gray-500">Client</th>
                                <th className="text-left py-3 text-sm font-medium text-gray-500">Tier</th>
                                <th className="text-left py-3 text-sm font-medium text-gray-500">Usage</th>
                                <th className="text-left py-3 text-sm font-medium text-gray-500">Storage</th>
                                <th className="text-left py-3 text-sm font-medium text-gray-500">Expiry</th>
                                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockData.licenseData.map((license) => (
                                <tr key={license.id} className="border-b border-gray-100">
                                    <td className="py-4">
                                        <div className="font-medium text-gray-900">{license.clientName}</div>
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
                                                    style={{ width: `${(license.used / license.allocated) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600">{license.used}/{license.allocated}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${(license.storage.used / license.storage.total) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600">{license.storage.used}/{license.storage.total}GB</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-sm text-gray-600">{license.expiry}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${license.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            license.status === 'Expiring' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {license.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div> */}

      {/* System Health & Performance */}
      {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">System Health & Performance</h3>
                        <p className="text-sm text-gray-600">Real-time platform performance metrics and system status</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Monitor className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">All Systems Operational</span>
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
            </motion.div> */}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
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
            onClick={() => navigate("/client-onboard")}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Add Client</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/client-directory")}
          >
            <Shield className="h-6 w-6" />
            <span className="text-sm">Client Directory</span>
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
        {/* Top Clients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white rounded-xl col-span-2 shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                navigate("/client-directory");
              }}
            >
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Users
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Vendors
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {topClients.length > 0 ? (
                  topClients.map((client) => (
                    <tr
                      key={client.clientId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#01443B]/10 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-[#01443B]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.organizationName}
                            </p>
                            {/* <p className="text-sm text-gray-500">Client ID: {client.clientId}</p> */}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          <Users className="h-3 w-3" />
                          {client.userCount}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          <Shield className="h-3 w-3" />
                          {client.vendorCount}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/client-dashboard/${client.clientId}`)
                            }
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
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No client data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <p className="text-sm text-gray-600">Latest platform activities</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Activity className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {mockData.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-4">
                                <div className={`p-2 rounded-lg ${getActivityTypeColor(activity.type)}`}>
                                    <activity.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div> */}
      </div>
    </div>
  );
};

export default PlatformDashboard;
