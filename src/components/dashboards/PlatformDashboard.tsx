import React, { useState, useEffect, useCallback } from "react";
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
import RoleBasedWelcome from "../RoleBasedWelcome";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchPlatformDashboardData,
  refreshPlatformDashboard,
  setSelectedTimeframe,
  setSelectedRegion,
  clearError,
  selectPlatformDashboardData,
  selectPlatformDashboardLoading,
  selectPlatformDashboardError,
  selectPlatformDashboardLastUpdated,
  selectSelectedTimeframe,
  selectSelectedRegion,
  selectChartData,
} from "@/store/slice/platformDashboardSlice";

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
  const dispatch = useAppDispatch();

  // Redux state
  const dashboardData = useAppSelector(selectPlatformDashboardData);
  const loading = useAppSelector(selectPlatformDashboardLoading);
  const error = useAppSelector(selectPlatformDashboardError);
  const lastUpdated = useAppSelector(selectPlatformDashboardLastUpdated);
  const selectedTimeframe = useAppSelector(selectSelectedTimeframe);
  const selectedRegion = useAppSelector(selectSelectedRegion);
  const chartData = useAppSelector(selectChartData);

  // Local state for UI interactions
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (!dashboardData) {
      dispatch(
        fetchPlatformDashboardData({
          timeframe: selectedTimeframe,
          region: selectedRegion,
        })
      );
    }
  }, [dispatch, dashboardData, selectedTimeframe, selectedRegion]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(refreshPlatformDashboard());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback(
    (timeframe: string) => {
      dispatch(setSelectedTimeframe(timeframe));
      dispatch(
        fetchPlatformDashboardData({
          timeframe,
          region: selectedRegion,
          forceRefresh: true,
        })
      );
    },
    [dispatch, selectedRegion]
  );

  // Handle region change
  const handleRegionChange = useCallback(
    (region: string | null) => {
      dispatch(setSelectedRegion(region));
      dispatch(
        fetchPlatformDashboardData({
          timeframe: selectedTimeframe,
          region,
          forceRefresh: true,
        })
      );
    },
    [dispatch, selectedTimeframe]
  );

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dispatch(refreshPlatformDashboard()).unwrap();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  // Handle error dismissal
  const handleDismissError = useCallback(() => {
    dispatch(clearError());
    setShowErrorDetails(false);
  }, [dispatch]);

  // Chart configurations with dynamic data
  const getStatusDistributionData = () => {
    if (!chartData?.statusDistribution) return null;
    return {
      labels: chartData.statusDistribution.labels,
      datasets: [
        {
          data: chartData.statusDistribution.data,
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
    };
  };

  const getIndustryDistributionData = () => {
    if (!chartData?.industryDistribution) return null;
    return {
      labels: chartData.industryDistribution.labels,
      datasets: [
        {
          data: chartData.industryDistribution.data,
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
    };
  };

  const getBusinessSizeDistributionData = () => {
    if (!chartData?.businessSizeDistribution) return null;
    return {
      labels: chartData.businessSizeDistribution.labels,
      datasets: [
        {
          data: chartData.businessSizeDistribution.data,
          backgroundColor: ["#06B6D4", "#8B5CF6", "#F59E0B", "#10B981"],
          hoverBackgroundColor: ["#0891B2", "#7C3AED", "#D97706", "#059669"],
        },
      ],
    };
  };

  const getSubscriptionTierData = () => {
    if (!chartData?.subscriptionTierDistribution) return null;
    return {
      labels: chartData.subscriptionTierDistribution.labels,
      datasets: [
        {
          data: chartData.subscriptionTierDistribution.data,
          backgroundColor: ["#06B6D4", "#8B5CF6", "#F59E0B"],
          hoverBackgroundColor: ["#0891B2", "#7C3AED", "#D97706"],
        },
      ],
    };
  };

  const getEngagementTrendsData = () => {
    if (!chartData?.engagementTrends) return null;
    return {
      labels: chartData.engagementTrends.labels,
      datasets: [
        {
          label: "Monthly Logins",
          data: chartData.engagementTrends.logins,
          borderColor: "#01443B",
          backgroundColor: "rgba(1, 68, 59, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Active Users",
          data: chartData.engagementTrends.activeUsers,
          borderColor: "#09B591",
          backgroundColor: "rgba(9, 181, 145, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
        {
          label: "New Assessments",
          data: chartData.engagementTrends.assessments,
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

  // Chart options
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
            const percentage = ((context.parsed / total) * 100).toFixed(1);
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

  // Loading state
  if (loading && !dashboardData) {
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

  // Error state
  if (error && !dashboardData) {
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
        {error && dashboardData && (
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
              onClick={handleDismissError}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing || loading ? "animate-spin" : ""
              }`}
            />
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
                {dashboardData?.summary?.clientCount || 0}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {dashboardData?.statusDistribution?.find(
                  (s) => s.clientStatusName === "Active"
                )?.clientCount || 0}{" "}
                active
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
                {dashboardData?.summary?.vendorCount || 0}
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
                {dashboardData?.summary?.licenseCount || 0}
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
                {dashboardData?.summary?.storageUsage || "0 MB"}
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
            {getStatusDistributionData() ? (
              <Doughnut
                data={getStatusDistributionData()!}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
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
            {getIndustryDistributionData() ? (
              <Pie
                data={getIndustryDistributionData()!}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
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
            {getBusinessSizeDistributionData() ? (
              <Doughnut
                data={getBusinessSizeDistributionData()!}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
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
            {getSubscriptionTierData() ? (
              <Pie data={getSubscriptionTierData()!} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Engagement Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Engagement Trends
          </h3>
          <LineChart className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-96">
          {getEngagementTrendsData() ? (
            <Line
              data={getEngagementTrendsData()!}
              options={lineChartOptions}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No engagement data available
            </div>
          )}
        </div>
      </motion.div>

      {/* Top Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
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
              {dashboardData?.topClients?.map((client, index) => (
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
                        <p className="text-sm text-gray-500">
                          Client ID: {client.clientId}
                        </p>
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
                        onClick={() => navigate(`/clients/${client.clientId}`)}
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
              )) || (
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
    </div>
  );
};

export default PlatformDashboard;
