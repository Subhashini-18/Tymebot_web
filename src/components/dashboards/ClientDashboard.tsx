import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAuthData } from "../../utils/auth";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import {
  Building,
  Shield,
  AlertTriangle,
  Users,
  Download,
  RefreshCw,
  Globe,
  Target,
  BarChart3,
  PieChart,
  Award,
  Calendar,
  Clock,
  Eye,
  Edit,
  Filter,
  ExternalLink,
  Activity,
  FileText,
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
  DoughnutController,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import Button from "../ui/Button";
import WorldMap from "../WorldMap";
import RoleBasedWelcome from "../RoleBasedWelcome";
// import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  DoughnutController
  // ChartDataLabels
);

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("monthly");
  const [clientName, setClientName] = useState<string>("Client Dashboard");
  const [clientLogoUrl, setClientLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const authData = getAuthData();
    if (authData?.clientName) {
      setClientName(authData.clientName);
    }
    if (authData?.clientLogoUrl) {
      setClientLogoUrl(authData.clientLogoUrl);
    }
  }, []);

  // Data hook (fetches dynamic client dashboard)
  const {
    data: clientData,
    charts: clientCharts,
    summary: clientSummary,
    loading,
    error,
    refresh,
  } = useClientDashboard({ autoRefresh: true, refreshInterval: 300000 });

  console.log(clientCharts);

  // Remove vendorsByRegion aggregation
  // Instead, prepare countryData for WorldMap
  const countryData = useMemo(() => {
    // API gives: { labels: [...], data: [...] }
    const countries = clientCharts?.countryDistribution?.labels || [];
    const counts = clientCharts?.countryDistribution?.data || [];
    // Map to array of { countryName, count }
    return countries.map((country: string, idx: number) => ({
      countryName: country,
      count: counts[idx] || 0,
    }));
  }, [clientCharts]);

  // Component-level mocks requested by you for specific widgets (keep local only)
  const exceptionalVendors = [
    {
      id: 1,
      name: "TechCorp Solutions",
      status: "Approved without full review",
      reason: "Business Critical",
      date: "2024-01-15",
      risk: "Medium",
    },
    {
      id: 2,
      name: "DataVault Ltd",
      status: "Only RIF Completed",
      reason: "Pending Documentation",
      date: "2024-01-14",
      risk: "High",
    },
    {
      id: 3,
      name: "CloudServices Inc",
      status: "Skipped due to business exception",
      reason: "Executive Override",
      date: "2024-01-13",
      risk: "Low",
    },
  ];

  const continuousAssessment = {
    upcoming: [
      {
        vendor: "PaymentGateway Ltd",
        date: "2024-01-20",
        type: "Quarterly",
        status: "Scheduled",
      },
      {
        vendor: "SecurityServices Inc",
        date: "2024-01-22",
        type: "Bi-annually",
        status: "Pending",
      },
      {
        vendor: "CloudStorage Corp",
        date: "2024-01-18",
        type: "Annual",
        status: "Missed",
      },
    ],
  };

  const recentVendors = [
    {
      id: 1,
      name: "TechCorp Solutions",
      category: "Technology",
      status: "Active",
      lastAssessment: "2024-01-15",
      riskTier: "Medium",
    },
    {
      id: 2,
      name: "DataVault Ltd",
      category: "Data Storage",
      status: "Under Review",
      lastAssessment: "2024-01-10",
      riskTier: "High",
    },
    {
      id: 3,
      name: "PaymentGateway Ltd",
      category: "Financial Services",
      status: "Active",
      lastAssessment: "2024-01-08",
      riskTier: "Critical",
    },
    {
      id: 4,
      name: "CloudServices Inc",
      category: "Cloud Computing",
      status: "Active",
      lastAssessment: "2024-01-05",
      riskTier: "Low",
    },
    {
      id: 5,
      name: "SecurityServices Inc",
      category: "Security",
      status: "Pending",
      lastAssessment: "2024-01-03",
      riskTier: "High",
    },
  ];

  // Chart configurations
  const getAssessmentStatusChartData = () => ({
    labels: clientCharts?.assessmentByStatus?.labels || [
      "Not Started",
      "In Progress",
      "Submitted",
      "Reviewed",
      "Closed",
    ],
    datasets: [
      {
        label: "Assessments by Status",
        data: clientCharts?.assessmentByStatus?.data || [12, 8, 15, 25, 67],
        backgroundColor: [
          "#2563EB", // Not Started - blue-600
          "#14B8A6", // In Progress - teal-500
          "#F59E42", // Submitted - amber-400
          "#8B5CF6", // Reviewed - purple-500
          "#6B7280", // Closed - gray-500
        ],
        borderRadius: 6,
        borderSkipped: false,
        borderWidth: 0,
      },
    ],
  });

  const getRiskTierChartData = () => ({
    labels: clientCharts?.riskTier?.labels || [
      "Low",
      "Medium",
      "High",
      "Critical",
    ],
    datasets: [
      {
        data: clientCharts?.riskTier?.data || [45, 38, 28, 16],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#7C2D12"],
        hoverBackgroundColor: ["#059669", "#D97706", "#DC2626", "#991B1B"],
      },
    ],
  });

  const getRifProgressDonutData = () => ({
    labels: clientCharts?.rifProgress?.labels || [
      "Initiated",
      "Under Review",
      "Approved",
      "Rejected",
      "Awaiting Q",
    ],
    datasets: [
      {
        data: clientCharts?.rifProgress?.data || [15, 8, 45, 3, 6],
        backgroundColor: [
          "#60A5FA", // blue
          "#FBBF24", // yellow
          "#10B981", // green
          "#EF4444", // red
          "#A78BFA", // purple
        ],
        borderWidth: 0,
        hoverOffset: 8,
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

  const rifDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      datalabels: {
        color: "#222",
        font: { weight: "bold", size: 14 },
        formatter: (value: number, ctx: any) => {
          const total = ctx.chart.data.datasets[0].data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const pct = total ? Math.round((value / total) * 100) : 0;
          return pct > 0 ? `${pct}%` : "";
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Missed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading && !clientData) {
    return (
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B]"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">
              Error Loading Dashboard
            </h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <Button onClick={() => refresh()} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Role-based Welcome */}
      {/* <RoleBasedWelcome /> */}

      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Client Logo or Initials */}
          {clientLogoUrl ? (
            <img
              src={clientLogoUrl}
              alt={clientName || "Client Logo"}
              className="h-12 w-12 rounded-full object-cover border border-gray-200 shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<div class='h-12 w-12 bg-gradient-to-br from-[#01443B] to-[#09B591] rounded-full flex items-center justify-center text-white font-bold text-xl'>
                                        ${(clientName || "U")[0]}
                                    </div>`;
                }
              }}
            />
          ) : (
            <div className="h-12 w-12 bg-gradient-to-br from-[#01443B] to-[#09B591] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {(clientName || "U")[0]}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {clientName}
            </h1>
            <p className="text-gray-600">
              Comprehensive third-party risk management overview
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* <select
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
                        Export PDF
                    </Button> */}
          <Button
            className="flex items-center gap-2"
            onClick={() => refresh()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. Summary Metrics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {clientSummary?.vendorCount || 0}
              </p>
              {/* <p className="text-sm text-green-600 mt-1">+12% from last month</p> */}
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
              <p className="text-sm font-medium text-gray-600">License Count</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {clientSummary?.licenseCount || 0}
              </p>
              <p className="text-sm text-blue-600 mt-1">Active licenses</p>
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
                Total Assessments
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {clientSummary?.totalAssessments || 0}
              </p>
              <p className="text-sm text-purple-600 mt-1">Active assessments</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="h-8 w-8 text-purple-600" />
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
                High Risk Vendors
              </p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {clientSummary?.highRiskVendors || 0}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Require immediate attention
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Vendors by Region - World Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Global Vendor Distribution
            </h3>
            <p className="text-sm text-gray-600">
              Interactive world map showing vendor partnerships by region
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#01443B]" />
              <span className="text-sm text-gray-600">Interactive Map</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Real-time Data</span>
            </div>
          </div>
        </div>
        <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
          <WorldMap
            countryData={countryData}
            onRegionClick={(region) =>
              setSelectedRegion(selectedRegion === region ? null : region)
            }
            selectedRegion={selectedRegion}
          />
        </div>

        {/* Region Details Panel */}
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedRegion}
                </h4>
                <p className="text-sm text-gray-600">
                  {countryData[selectedRegion] || 0} vendors in this region
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/vendor-directory")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Vendors
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRegion(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* RIF Snapshot and Assessment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Risk Intake (RIF) Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                RIF Progress Snapshot
              </h3>
              <p className="text-sm text-gray-600">
                Risk Intake Form processing status
              </p>
            </div>
            <div className="p-2 bg-[#01443B]/10 rounded-lg">
              <Target className="h-5 w-5 text-[#01443B]" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-2/3 h-full">
              <Doughnut
                data={getRifProgressDonutData()}
                options={rifDonutOptions}
                // plugins={[ChartDataLabels]}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {clientData?.dashboard?.rifProgress?.approved || 0}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {clientData?.dashboard?.rifProgress?.underReview || 0}
              </p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
          </div>
        </motion.div>

        {/* 3. Assessment Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Assessment Status
              </h3>
              <p className="text-sm text-gray-600">
                Distribution by status and risk tier
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={getAssessmentStatusChartData()}
              options={barChartOptions}
            />
          </div>
        </motion.div>
      </div>

      {/* Risk Tier Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Risk Tier Distribution
            </h3>
            <p className="text-sm text-gray-600">
              Vendors categorized by risk level
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg">
            <PieChart className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        <div className="h-80">
          <Pie data={getRiskTierChartData()} options={chartOptions} />
        </div>
      </motion.div>

      {/* 4. Exceptional Vendors Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Exceptional Vendors
            </h3>
            <p className="text-sm text-gray-600">
              Vendors requiring special attention
            </p>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
        </div>
        <div className="space-y-4">
          {exceptionalVendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {vendor.name.substring(0, 2)}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 cursor-pointer hover:text-[#01443B]">
                    {vendor.name}
                  </h4>
                  <p className="text-sm text-gray-600">{vendor.status}</p>
                  <p className="text-xs text-gray-500">
                    {vendor.reason} • {vendor.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                    vendor.risk
                  )}`}
                >
                  {vendor.risk}
                </span>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 5. Continuous Assessment Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Continuous Assessment Calendar
            </h3>
            <p className="text-sm text-gray-600">
              Upcoming assessment deadlines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#01443B]">
              <option>All Frequencies</option>
              <option>Quarterly</option>
              <option>Bi-annually</option>
              <option>Annual</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {continuousAssessment.upcoming.map((assessment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {assessment.vendor}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {assessment.type} Assessment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{assessment.date}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getAssessmentStatusColor(
                    assessment.status
                  )}`}
                >
                  {assessment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6. Quick Access / Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Reports
            </h3>
            <p className="text-sm text-gray-600">
              Generate custom reports instantly
            </p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Download className="h-6 w-6" />
            <span className="text-sm">Dashboard PDF</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-sm">Monthly Report</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Activity className="h-6 w-6" />
            <span className="text-sm">Risk Trends</span>
          </Button>
        </div>
      </motion.div>

      {/* 7. Vendor Table Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Vendors
            </h3>
            <p className="text-sm text-gray-600">
              Latest vendor activities and updates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Vendor Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Last Assessment
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Risk Tier
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentVendors.map((vendor, index) => (
                <tr
                  key={vendor.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {vendor.name.substring(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {vendor.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{vendor.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        vendor.status
                      )}`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {vendor.lastAssessment}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                        vendor.riskTier
                      )}`}
                    >
                      {vendor.riskTier}
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

export default ClientDashboard;
