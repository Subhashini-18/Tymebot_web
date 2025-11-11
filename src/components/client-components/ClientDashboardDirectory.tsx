import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Shield,
  Star,
  Users,
  FileText,
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Edit,
  Download,
  Loader2,
  ExternalLink,
  Badge,
  CreditCard,
  Settings,
  Award,
  Target,
  BarChart3,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchClientDetails } from "../../store/slice/clientDirectorySlice";

interface ClientDetails {
  clientOrgInfoId: number;
  organizationName: string;
  industrySectorName: string;
  briefAboutCompany: string;
  yearOfIncorporation: string;
  registrationNumber: string;
  primaryRegistration: string;
  website: string;
  primaryContact: {
    id: number;
    designation: string;
    emailAddress: string;
    contactNumber: string;
    alternateContact: string;
    primaryContactName: string;
  };
  address: {
    id: number;
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    stateProvince: string;
    zipPostalCode: string;
    countryId: number;
    countryName: string;
    gstVatNumber: string;
  };
  commercialDetails: {
    id: number;
    panEinTaxId: string;
    currencyId: number;
    currencyName: string;
    billingEmail: string;
    numberOfUsers: number;
    vendorVolumeId: number;
    vendorVolumeName: string;
    desiredModules: { desiredModuleId: number; desiredModuleName: string }[];
    operationalRegions: {
      operationalRegionId: number;
      operationalRegionName: string;
    }[];
  };
  systemAccess: {
    id: number;
    isIso27001Certified: boolean;
    targetGoLiveDate: string;
    ndaContractStatusFile: string;
    termsAccepted: boolean;
    clientLogoFile: string;
    adminEmails: { id: number; adminEmail: string }[];
    integrationExpectations?: string[];
  };
  geographiesOfOperation: string[];
  orgCertifications: string[];
  regulatoryFrameworks: string[];
  riskLevel: "low" | "medium" | "high";
  status: "active" | "pending" | "inactive";
  rating: number;
  score: number;
  lastAssessment: string;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
}

const ClientDashboardDirectory: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadClientDetails = async () => {
      if (!clientId) return;

      try {
        setLoading(true);
        setError(null);

        const result: any = await dispatch(
          fetchClientDetails(parseInt(clientId))
        );

        // Extract data from API response
        if (result.type === "clientDirectory/fetchClientDetails/fulfilled") {
          setClientDetails(result.payload);
        } else {
          setError(
            (result.payload as string) || "Failed to load client details"
          );
        }
      } catch (err) {
        setError("Failed to load client details");
        console.error("Error loading client details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClientDetails();
  }, [clientId, dispatch]);

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper for admin emails (array of objects)
  const renderAdminEmails = (adminEmails: any[] | undefined) => {
    if (!adminEmails || adminEmails.length === 0)
      return <span className="text-gray-400">No admin emails</span>;
    return (
      <div className="space-y-1">
        {adminEmails.map((emailObj, idx) => (
          <p key={idx} className="text-gray-900">
            {emailObj.adminEmail}
          </p>
        ))}
      </div>
    );
  };

  // Helper for organization logo
  const renderLogo = (logoUrl: string | undefined, orgName: string) => {
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={orgName}
          className="w-16 h-16 rounded-full object-cover border-2 border-[#01443B] shadow-sm mr-6"
        />
      );
    }
    return (
      <div className="w-16 h-16 bg-[#01443B] rounded-full flex items-center justify-center text-white font-bold text-xl mr-6">
        {orgName?.charAt(0) || "C"}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#01443B] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading client details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Client Details
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/client-directory")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Client Directory
          </button>
        </div>
      </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/client-directory")}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Client Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              {renderLogo(
                clientDetails?.systemAccess?.clientLogoFile,
                clientDetails?.organizationName
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {clientDetails?.organizationName}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <div
                    className="flex items-center text-gray-600"
                    title="Location"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>
                      {clientDetails?.address?.city || "N/A"},{" "}
                      {clientDetails?.address?.countryName || "N/A"}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskBadge(
                      clientDetails?.riskLevel
                    )}`}
                    title="Risk Level"
                  >
                    {clientDetails?.riskLevel?.charAt(0).toUpperCase() +
                      clientDetails?.riskLevel?.slice(1) || "N/A"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      clientDetails?.status
                    )}`}
                    title="Status"
                  >
                    {getStatusIcon(clientDetails?.status)}
                    <span className="ml-1">
                      {clientDetails?.status?.charAt(0).toUpperCase() +
                        clientDetails?.status?.slice(1) || "Active"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#01443B] rounded-lg hover:bg-[#01443B]/90 transition-colors">
              <Edit className="w-4 h-4 mr-2" />
              Edit Client
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {clientDetails?.score || "2.5"}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Rating</p>
              <div className="flex items-center mt-1">
                {clientDetails?.rating && renderStars(clientDetails?.rating)}
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  {clientDetails?.rating || "4.9"}
                </span>
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {clientDetails?.commercialDetails?.numberOfUsers || "N/A"}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">ISO 27001</p>
              <p className="text-2xl font-bold text-gray-900">
                {clientDetails?.systemAccess?.isIso27001Certified
                  ? "Yes"
                  : "No"}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: Info },
            { id: "contact", label: "Contact Info", icon: Phone },
            { id: "commercial", label: "Commercial", icon: CreditCard },
            { id: "system", label: "System Access", icon: Settings },
            // { id: 'compliance', label: 'Compliance', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? "border-[#01443B] text-[#01443B]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "overview" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Organization Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.briefAboutCompany ||
                      "No description available"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry Sector
                    </label>
                    <p className="text-gray-900">
                      {clientDetails?.industrySectorName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Incorporation
                    </label>
                    <p className="text-gray-900">
                      {formatDate(clientDetails?.yearOfIncorporation)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <p className="text-gray-900">
                      {clientDetails?.registrationNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    {clientDetails?.website ? (
                      <a
                        href={clientDetails?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#01443B] hover:underline flex items-center"
                      >
                        {clientDetails?.website}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    ) : (
                      <p className="text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Primary Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.primaryContact?.primaryContactName ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.primaryContact?.designation || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.primaryContact?.emailAddress || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.primaryContact?.contactNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Contact
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.primaryContact?.alternateContact ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <hr className="my-4 border-gray-200" />
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.address?.streetAddress1 || "N/A"}
                        {clientDetails?.address?.streetAddress2 && (
                          <>
                            <br />
                            {clientDetails?.address.streetAddress2}
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.address?.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.address?.stateProvince || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip/Postal Code
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.address?.zipPostalCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.address?.countryName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST/VAT Number
                      </label>
                      <p className="text-gray-900">
                        {clientDetails?.address?.gstVatNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "commercial" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Commercial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN/EIN/Tax ID
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.commercialDetails?.panEinTaxId || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.commercialDetails?.currencyName || "$"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Email
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.commercialDetails?.billingEmail || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Users
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.commercialDetails?.numberOfUsers || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Vendor Volume
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.commercialDetails?.vendorVolumeName ||
                      "N/A"}
                  </p>
                </div>
              </div>
              {clientDetails?.commercialDetails?.desiredModules?.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Modules
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {clientDetails?.commercialDetails.desiredModules.map(
                      (module, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {module.desiredModuleName}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
              {clientDetails?.commercialDetails?.operationalRegions?.length >
                0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operational Regions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {clientDetails?.commercialDetails?.operationalRegions?.map(
                      (region, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {region?.operationalRegionName}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "system" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISO 27001 Certified
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.systemAccess?.isIso27001Certified
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Go-Live Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(clientDetails?.systemAccess?.targetGoLiveDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms Accepted
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.systemAccess?.termsAccepted ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NDA Contract Status
                  </label>
                  <p className="text-gray-900">
                    {clientDetails?.systemAccess?.ndaContractStatusFile ||
                      "Yes"}
                  </p>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Emails
                </label>
                {renderAdminEmails(clientDetails?.systemAccess?.adminEmails)}
              </div>
              {clientDetails?.systemAccess?.integrationExpectations &&
                clientDetails?.systemAccess.integrationExpectations.length >
                  0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration Expectations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {clientDetails?.systemAccess.integrationExpectations.map(
                        (expectation, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {expectation}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Compliance & Certifications
              </h3>
              <div className="space-y-6">
                {clientDetails?.geographiesOfOperation &&
                  clientDetails?.geographiesOfOperation.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geographies of Operation
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {clientDetails?.geographiesOfOperation.map(
                          (geography, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {geography}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {clientDetails?.orgCertifications &&
                  clientDetails?.orgCertifications.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Certifications
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {clientDetails?.orgCertifications.map(
                          (certification, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {certification}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {clientDetails?.regulatoryFrameworks &&
                  clientDetails?.regulatoryFrameworks.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Regulatory Frameworks
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {clientDetails?.regulatoryFrameworks.map(
                          (framework, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {framework}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {/* <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#01443B] rounded-lg hover:bg-[#01443B]/90">
                                <Activity className="w-4 h-4 mr-2" />
                                Start Assessment
                            </button> */}
              <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Client onboarded</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Profile updated</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Assessment pending</span>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Dates</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Last Assessment</p>
                                <p className="text-sm text-gray-600">{'24 hours ago'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Next Review</p>
                                <p className="text-sm text-gray-600">{'2 days from now'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Created</p>
                                <p className="text-sm text-gray-600">{'Yesterday'}</p>
                            </div>
                        </div>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardDirectory;
