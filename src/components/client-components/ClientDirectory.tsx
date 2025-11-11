import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Star,
  Shield,
  Phone,
  Mail,
  Globe,
  Calendar,
  Tag,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Activity,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchClientDirectory,
  setCurrentPage,
  clearError,
  resetFilters,
  ClientDirectoryItem,
} from "../../store/slice/clientDirectorySlice";
import DataTable from "../ui/DataTable";

const ClientDirectory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    clients,
    loading,
    error,
    currentPage,
    totalPages,
    totalClients,
    searchTerm,
    filterRisk,
    filterCountry,
    filterStatus,
    sortBy,
  } = useAppSelector((state) => state.clientDirectory);

  console.log(clients);
  // Get unique countries from clients

  // Load client directory on component mount
  useEffect(() => {
    const loadClientDirectory = async () => {
      try {
        await dispatch(
          fetchClientDirectory({
            page: 1,
            limit: 20,
            search: searchTerm,
            riskLevel: filterRisk,
            country: filterCountry,
            status: filterStatus,
            sortBy,
          })
        );
      } catch (error) {
        console.error("Error loading client directory:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadClientDirectory();
  }, []);

  // Handle filter changes
  // useEffect(() => {
  //     if (!isInitialLoad) {
  //         const timeoutId = setTimeout(() => {
  //             dispatch(fetchClientDirectory({
  //                 page: 1,
  //                 limit: 20,
  //                 search: searchTerm,
  //                 riskLevel: filterRisk,
  //                 country: filterCountry,
  //                 status: filterStatus,
  //                 sortBy
  //             }));
  //             dispatch(setCurrentPage(1));
  //         });

  //         return () => clearTimeout(timeoutId);
  //     }
  // }, [searchTerm, filterRisk, filterCountry, filterStatus, sortBy, isInitialLoad]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(
      fetchClientDirectory({
        page,
        limit: 20,
        search: searchTerm,
        riskLevel: filterRisk,
        country: filterCountry,
        status: filterStatus,
        sortBy,
      })
    );
  };

  // Handle client click - navigate to client dashboard

  // Handle refresh
  const handleRefresh = () => {
    dispatch(
      fetchClientDirectory({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        riskLevel: filterRisk,
        country: filterCountry,
        status: filterStatus,
        sortBy,
      })
    );
  };

  // Table/grid columns definition
  const columns = [
    {
      key: "organizationName",
      label: "Organization",
      sortable: true,
      filterable: true,
      render: (client: ClientDirectoryItem) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#01443B] rounded-full flex items-center justify-center text-white font-semibold text-base mr-2">
            {client.organizationName?.charAt(0) || "C"}
          </div>
          <span>{client.organizationName || "Unknown Client"}</span>
        </div>
      ),
    },
    {
      key: "city",
      label: "Location",
      sortable: true,
      filterable: true,
      render: (client: ClientDirectoryItem) =>
        client.city && client.countryName
          ? `${client.city}, ${client.countryName}`
          : "N/A",
    },
    {
      key: "industrySectorName",
      label: "Industry",
      sortable: true,
      filterable: true,
    },
    {
      key: "registrationNumber",
      label: "Reg. Number",
      sortable: false,
      filterable: true,
    },
    {
      key: "primaryContactName",
      label: "Contact",
      sortable: false,
      filterable: true,
    },
    {
      key: "actions",
      label: "View Details",
      render: (client: ClientDirectoryItem) => (
        <button
          className="text-[#01443B] hover:text-[#01443B]/80 text-sm font-medium flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/client-dashboard/${client.clientOrgInfoId}`);
          }}
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      ),
    },
  ];

  // Custom grid item for DataTable
  const renderGridItem = (client: ClientDirectoryItem) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/client-dashboard/${client.clientOrgInfoId}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-[#01443B] rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {client.organizationName?.charAt(0) || "C"}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {client.organizationName || "Unknown Client"}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {client.city && client.countryName
                ? `${client.city}, ${client.countryName}`
                : "Location not specified"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(
              client.riskLevel
            )}`}
          >
            {client.riskLevel?.charAt(0).toUpperCase() +
              client.riskLevel?.slice(1)}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadge(
              client.status
            )}`}
          >
            {getStatusIcon(client.status)}
            <span className="ml-1">
              {client.status
                ? client.status.charAt(0).toUpperCase() + client.status.slice(1)
                : "N/A"}
            </span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between ">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {client.industrySectorName ||
            client.description ||
            "No description available"}
        </p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {client.registrationNumber ||
            client.description ||
            "No Registration Number available"}
        </p>
      </div>
      <p className="text-md font-semibold text-gray-600 mb-4 line-clamp-2">
        {client.primaryContactName || "No description available"}
      </p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {client.rating && renderStars(client.rating)}
          {client.rating && (
            <span className="ml-2 text-sm text-gray-600">{client.rating}</span>
          )}
        </div>
        <div className="text-right">
          {client.score && (
            <div className="text-sm font-semibold text-gray-900">
              Score: {client.score}
            </div>
          )}
          {client.yearsOfService && (
            <div className="text-xs text-gray-500">
              {client.yearsOfService} years
            </div>
          )}
        </div>
      </div>
      {client.services && client.services.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {client.services.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {service}
            </span>
          ))}
          {client.services.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{client.services.length - 3} more
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-1" />
            <span className="text-xs">
              {client.primaryContactEmail || "No email"}
            </span>
          </div>
          {client.primaryContactNumber && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              <span className="text-xs">{client.primaryContactNumber}</span>
            </div>
          )}
        </div>
        <button
          className="text-[#01443B] hover:text-[#01443B]/80 text-sm font-medium flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/client-dashboard/${client.clientOrgInfoId}`);
          }}
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );

  // Show loading state on initial load
  if (isInitialLoad && loading) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#01443B] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading client directory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Client Directory
            </h1>
            <p className="text-gray-600">
              Browse and manage your client ecosystem
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => c.status === "active").length ||
                  clients.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => c.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter((c) => c.riskLevel === "high").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search clients, industries, or locations..."
                                value={searchTerm}
                                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent w-full sm:w-64"
                            />
                        </div>

                        <select
                            value={filterRisk}
                            onChange={(e) => dispatch(setFilterRisk(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {countries.length > 0 && (
                            <select
                                value={filterCountry}
                                onChange={(e) => dispatch(setFilterCountry(e.target.value))}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                            >
                                <option value="all">All Countries</option>
                                {countries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => dispatch(setSortBy(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                        >
                            <option value="organizationName">Sort by Name</option>
                            <option value="score">Sort by Score</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="riskLevel">Sort by Risk</option>
                            <option value="status">Sort by Status</option>
                        </select>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 ">
        <DataTable
          columns={columns}
          data={clients}
          itemsPerPage={20}
          sortKey={sortBy}
          sortDirection="asc"
          emptyMessage="No clients found matching your criteria."
          renderGridItem={renderGridItem}
          actions={null}
        />
      </div>
      {/* DataTable for both grid and table view */}

      {/* Loading Overlay */}
      {loading && !isInitialLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center">
            <Loader2 className="w-6 h-6 text-[#01443B] animate-spin mr-3" />
            <p className="text-gray-700">Loading clients...</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * 20 + 1} to{" "}
            {Math.min(currentPage * 20, totalClients)} of {totalClients} clients
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-lg disabled:cursor-not-allowed ${
                  currentPage === i + 1
                    ? "bg-[#01443B] text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions
  function getRiskBadge(riskLevel: string) {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return (
      colors[riskLevel as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  }

  function getStatusBadge(status: string) {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "inactive":
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  }
};

export default ClientDirectory;
