import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
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
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchVendorDirectory,
  setSearchTerm,
  setFilterRisk,
  setFilterCountry,
  setFilterStatus,
  setSortBy,
  setCurrentPage,
  clearError,
  resetFilters,
  VendorDirectoryItem,
} from "../../store/slice/vendorDirectorySlice";
import { selectPendingVendorIdSet } from "../../store/slice/approverSlice";


const VendorDirectory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    vendors,
    loading,
    error,
    currentPage,
    totalPages,
    totalVendors,
    searchTerm,
    filterRisk,
    filterCountry,
    filterStatus,
    sortBy,
  } = useAppSelector((state) => state.vendorDirectory);
  console.log(vendors)

  const pendingVendorIds = useAppSelector(selectPendingVendorIdSet);
console.log(pendingVendorIds)
  // Get unique countries from vendors
  const countries = [
    ...new Set(vendors.map((vendor) => vendor.countryNames || vendor.country)),
  ].filter(Boolean);

  // Load vendor directory on component mount
  useEffect(() => {
    const loadVendorDirectory = async () => {
      try {
        await dispatch(
          fetchVendorDirectory({
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
        console.error("Error loading vendor directory:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadVendorDirectory();
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (!isInitialLoad) {
      const timeoutId = setTimeout(() => {
        dispatch(
          fetchVendorDirectory({
            page: 1,
            limit: 20,
            search: searchTerm,
            riskLevel: filterRisk,
            country: filterCountry,
            status: filterStatus,
            sortBy,
          })
        );
        dispatch(setCurrentPage(1));
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchTerm,
    filterRisk,
    filterCountry,
    filterStatus,
    sortBy,
    isInitialLoad,
  ]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(
      fetchVendorDirectory({
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

  // Handle vendor click - navigate to vendor dashboard
  const handleVendorClick = (vendor: VendorDirectoryItem) => {
    const vendorId = vendor.thirdPartyVendorId || vendor.id;
    navigate(`/vendor-dashboard/${vendorId}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(
      fetchVendorDirectory({
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

  // Handle reset filters
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return (
      colors[riskLevel as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
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
  };

  const getEffectiveStatus = (vendor: VendorDirectoryItem) => {
    const isPending = pendingVendorIds.has(vendor.thirdPartyVendorId);
    return isPending ? "pending" : "active";
  };

  const VendorCard = ({ vendor }: { vendor: VendorDirectoryItem }) => {
    const effectiveStatus = getEffectiveStatus(vendor);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => handleVendorClick(vendor)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#01443B] rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {(
                vendor.legalName ||
                vendor.organizationName ||
                vendor.name
              )?.charAt(0) || "V"}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {vendor.legalName ||
                  vendor.organizationName ||
                  vendor.name ||
                  "Unknown Vendor"}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {vendor.countryNames ||
                  vendor.country ||
                  "Location not specified"}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(
                vendor.riskLevel
              )}`}
            >
              {vendor.riskLevel
                ? vendor.riskLevel.charAt(0).toUpperCase() +
                vendor.riskLevel.slice(1)
                : "N/A"}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadge(
                effectiveStatus
              )}`}
            >
              {getStatusIcon(effectiveStatus)}
              <span className="ml-1">
                {effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}

              </span>
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {vendor.briefAboutCompany ||
            vendor.description ||
            `Third party vendor of type: ${vendor.natureOfThirdParty}` ||
            "No description available"}
        </p>

        <div className="flex items-center justify-end mb-4">
          <div className="text-right">
            {vendor.score && (
              <div className="text-sm font-semibold text-gray-900">
                Score: {vendor.score}
              </div>
            )}
            {vendor.yearsOfService && (
              <div className="text-xs text-gray-500">
                {vendor.yearsOfService} years
              </div>
            )}
          </div>
        </div>

        {(vendor.services && vendor.services.length > 0) ||
          vendor.natureOfThirdParty ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {vendor.natureOfThirdParty && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {vendor.natureOfThirdParty}
              </span>
            )}
            {/* {vendor.services && vendor.services.slice(0, 2).map((service, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {service}
                        </span>
                    ))} */}
            {vendor.services && vendor.services.length > 2 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{vendor.services.length - 2} more
              </span>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              <span className="text-xs">
                {vendor.spocEmail ||
                  vendor.primaryContactEmail ||
                  vendor.email ||
                  "No email"}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">
                {vendor.spocContactName ||
                  vendor.primaryContactName ||
                  "No contact"}
              </span>
            </div>
          </div>
          <button className="text-[#01443B] hover:text-[#01443B]/80 text-sm font-medium flex items-center">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </motion.div>
    );
  }
  // Show loading state on initial load
  if (isInitialLoad && loading) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#01443B] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading vendor directory...</p>
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
              Vendor Directory
            </h1>
            <p className="text-gray-600">
              Browse and manage your vendor ecosystem
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
            <button
              onClick={handleResetFilters}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendors.length}
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
                {vendors.filter((v) => v.status === "active").length}
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
                {vendors.filter((v) => v.status === "pending").length}
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
                {vendors.filter((v) => v.riskLevel === "high").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search vendors, services, or locations..."
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
              value={filterCountry}
              onChange={(e) => dispatch(setFilterCountry(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
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
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="score">Sort by Score</option>
              <option value="risk">Sort by Risk Level</option>
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {vendors.length} vendors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {/* Empty State */}
      {vendors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No vendors found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Vendors
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorDirectory;
