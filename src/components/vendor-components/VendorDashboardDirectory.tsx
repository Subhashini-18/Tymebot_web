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
import { fetchVendorDetails } from "../../store/slice/vendorDirectorySlice";
import DataTable from "../ui/DataTable";
import RiskSummaryDashboard from "@/pages/rif-form-vendors/RiskSummaryDashboard";
import { apiService } from "@/services/api/apiservice";

const BASE_API_PATH = import.meta.env.VITE_API_PATH || "/api/g3/tracs/tracs/v1/";
const BASE_PORT = import.meta.env.VITE_BASE_PORT || "8082";

interface VendorDetails {
  thirdPartyVendorId: number;
  legalName: string;
  websiteUrl: string;
  spocEmail: string;
  spocContactName: string;
  spocPhoneNumber: string;
  type: { id: number; name: string }[];
  countries: { countryId: number; countryName: string; isoCode: string }[];
  dataVolume: {
    id: number;
    totalDataVolume: { id: number; dataVolumeName: string };
    personalDataVolume: { id: number; dataVolumeName: string };
    typeOfSystemAccess: string;
    clientSystemsAccess: boolean;
  };
  engagement: {
    id: number;
    currency: { id: number; currencyCode: string; currencyName: string };
    isRenewal: boolean;
    contractType: { id: number; contractTypeName: string };
    contractValue: number;
    contractDuration: { id: number; contractDurationName: string };
    expectedStartDate: string;
    descriptionOfServices: string;
    isFourthPartyInvolved: boolean;
  };
  dataAccessTypes: { dataAccessTypeId: number; dataAccessTypeName: string }[];
  personalDataTypes: {
    personalDataTypeId: number;
    personalDataTypeName: string;
  }[];
  riskConsideration: {
    id: number;
    knownRisks: boolean;
    annualVolume: { id: number; annualVolumeName: string };
    customerImpact: boolean;
    itNetworkAccess: boolean;
    businessDisruption: boolean;
    crossBorderTransfer: boolean;
    crossBorderCountries: string;
    knownRisksDescription: string;
    serviceReplaceability: { id: number; serviceReplaceabilityName: string };
    serviceLocationDomestic: boolean;
    customerImpactDescription: string;
    itNetworkAccessDescription: string;
    serviceLocationDescription: string;
    dataHostingProcessingCountry: string;
    businessDisruptionDescription: string;
  };
  supportingDetails: {
    id: number;
    exemptionReason: string;
    additionalComments: string;
    exemptionRequested: boolean;
    supportingDocuments: string;
    expectedAssessmentCompletion: string;
  };
  natureOfThirdParty: { id: number; name: string }[];
  sanctionsScreening: {
    id: number;
    supportingDocuments: string;
    sanctionsListDetails: string;
    sanctionsListScreened: boolean;
    litigationOrAdverseMedia: boolean;
    sanctionedCountryDetails: string;
    sanctionsListCriticalRisk: boolean;
    sanctionedCountryAffiliation: boolean;
    litigationAdverseMediaDetails: string;
  };
  complianceFrameworks: {
    frameworkName: string;
    complianceFrameworkId: number;
  }[];
  vendorCertifications: {
    certificationName: string;
    vendorCertificationId: number;
  }[];
  dataClassifications: {
    dataClassificationId: number;
    dataClassificationName: string;
  }[];
  dataHostingArrangements: {
    dataHostingArrangementId: number;
    dataHostingArrangementName: string;
  }[];
}

const VendorDashboardDirectory: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(
    null
  );
  console.log(vendorDetails, "Vendor Details"); // Debugging line to check fetched vendor details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [riskSummary, setRiskSummary] = useState<any | null>(null);

  useEffect(() => {
    const loadVendorDetails = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        setError(null);

        // Parse the vendorId as thirdPartyVendorId
        const thirdPartyVendorId = parseInt(vendorId);
        const result: any = await dispatch(
          fetchVendorDetails(thirdPartyVendorId)
        );

        // Extract data from API response
        if (result.type === "vendorDirectory/fetchVendorDetails/fulfilled") {
          setVendorDetails(result.payload);
          // Fetch RIF calculation summary for this vendor
          try {
            const rifResp: any = await apiService.get(
              `${BASE_API_PATH}get_third_party_vendor_risk_summary`,
              { id: thirdPartyVendorId },
              Number(BASE_PORT)
            );
            setRiskSummary(rifResp?.data || null);
          } catch (e) {
            console.error("Failed to fetch risk summary:", e);
          }
        } else {
          setError(
            (result.payload as string) || "Failed to load vendor details"
          );
        }
      } catch (err) {
        setError("Failed to load vendor details");
        console.error("Error loading vendor details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVendorDetails();
  }, [vendorId, dispatch]);

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

  // Prepare data for DataTable
  const getVendorInfoData = () => {
    if (!vendorDetails) return [];
    return [
      { field: "Legal Name", value: vendorDetails.legalName },
      {
        field: "Type",
        value: vendorDetails.type?.map((t) => t.name).join(", "),
      },
      {
        field: "Country",
        value: vendorDetails.countries?.map((c) => c.countryName).join(", "),
      },
      { field: "SPOC Name", value: vendorDetails.spocContactName },
      { field: "SPOC Email", value: vendorDetails.spocEmail },
      { field: "SPOC Phone", value: vendorDetails.spocPhoneNumber },
      { field: "Website", value: vendorDetails.websiteUrl },
      {
        field: "Nature of Third Party",
        value: vendorDetails.natureOfThirdParty?.map((n) => n.name).join(", "),
      },
      {
        field: "Data Access Types",
        value: vendorDetails.dataAccessTypes
          ?.map((d) => d.dataAccessTypeName)
          .join(", "),
      },
      {
        field: "Personal Data Types",
        value: vendorDetails.personalDataTypes
          ?.map((d) => d.personalDataTypeName)
          .join(", "),
      },
      {
        field: "Data Classifications",
        value: vendorDetails.dataClassifications
          ?.map((d) => d.dataClassificationName)
          .join(", "),
      },
      {
        field: "Data Hosting",
        value: vendorDetails.dataHostingArrangements
          ?.map((d) => d.dataHostingArrangementName)
          .join(", "),
      },
    ];
  };

  // Animate tab content
  const AnimatedTab: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#01443B] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading vendor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-10 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Vendor Details
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/vendor-directory")}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to Vendor Directory
          </button>
        </div>
      </div>
    );
  }

  if (!vendorDetails) {
    return (
      <div className="p-6 max-w-8xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow p-10 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vendor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/vendor-directory")}
              className="mr-4 p-2 text-gray-600 hover:text-[#01443B] hover:bg-gray-100 rounded-full transition"
              title="Back to Vendor Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {vendorDetails.legalName}
              </h1>
              <div className="flex flex-wrap items-center mt-3 space-x-4">
                <div
                  className="flex items-center text-gray-600"
                  title="Location"
                >
                  <MapPin className="w-4 h-4 mr-1 text-[#01443B]" />
                  <span className="font-medium">
                    {vendorDetails.countries
                      ?.map((c) => c.countryName)
                      .join(", ") || "N/A"}
                  </span>
                </div>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800"
                  title="Type"
                >
                  <Badge className="w-4 h-4 mr-1" />
                  {vendorDetails.type?.map((t) => t.name).join(", ") || "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={vendorDetails.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-5 py-2 text-base font-semibold text-white bg-[#01443B] rounded-lg shadow hover:bg-[#01695a] transition"
            >
              <Globe className="w-5 h-5 mr-2" />
              Visit Website
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-10">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-8">
            {[
              { id: "overview", label: "Overview", icon: Info },
              { id: "details", label: "Details", icon: FileText },
              { id: "services", label: "Services", icon: Settings },
              { id: "compliance", label: "Compliance", icon: Shield },
              { id: "rif", label: "RIF Calculation", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-5 px-2 border-b-2 font-semibold text-base transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-[#01443B] text-[#01443B] bg-gradient-to-t from-[#e6f4f1] to-white"
                    : "border-transparent text-gray-500 hover:text-[#01443B] hover:border-[#b2e2d6]"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 min-h-[350px]">
          <AnimatedTab>
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#01443B] mb-4 flex items-center">
                    <Info className="w-6 h-6 mr-2 text-[#01443B]" />
                    Company Overview
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {vendorDetails.engagement?.descriptionOfServices ||
                      "No description available."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-[#f0fdfa] to-white rounded-xl shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-[#01443B]" />
                      Key Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center">
                          <Badge className="w-4 h-4 mr-1" />
                          Type:
                        </span>
                        <span className="text-gray-900 font-medium">
                          {vendorDetails.type?.map((t) => t.name).join(", ") ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Country:
                        </span>
                        <span className="text-gray-900 font-medium">
                          {vendorDetails.countries
                            ?.map((c) => c.countryName)
                            .join(", ") || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Nature:
                        </span>
                        <span className="text-gray-900 font-medium">
                          {vendorDetails.natureOfThirdParty
                            ?.map((n) => n.name)
                            .join(", ") || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#f0fdfa] to-white rounded-xl shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-[#01443B]" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {vendorDetails.spocEmail || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {vendorDetails.spocPhoneNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {vendorDetails.spocContactName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div>
                <h3 className="text-2xl font-bold text-[#01443B] mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-[#01443B]" />
                  Vendor Details
                </h3>
                <DataTable
                  columns={[
                    {
                      key: "field",
                      label: "Field",
                      render: (item: any) => (
                        <span className="font-semibold text-gray-900">
                          {item.field}
                        </span>
                      ),
                    },
                    {
                      key: "value",
                      label: "Value",
                      render: (item: any) => (
                        <span className="text-gray-700">
                          {item.value || "N/A"}
                        </span>
                      ),
                    },
                  ]}
                  data={getVendorInfoData()}
                  itemsPerPage={20}
                  emptyMessage="No vendor information available"
                />
              </div>
            )}

            {activeTab === "services" && (
              <section className="space-y-6">
                <header className="flex items-center text-[#01443B]">
                  <Settings className="w-6 h-6 mr-2" />
                  <h3 className="text-2xl font-bold">Services & Data</h3>
                </header>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base">
                  <div>
                    <dt className="font-semibold text-[#01443B]">
                      Description:
                    </dt>
                    <dd>
                      {vendorDetails.engagement?.descriptionOfServices || "N/A"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#01443B]">
                      Personal Data Types:
                    </dt>
                    <dd>
                      {vendorDetails.personalDataTypes
                        ?.map((d) => d.personalDataTypeName)
                        .join(", ") || "N/A"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#01443B]">
                      Data Access Types:
                    </dt>
                    <dd>
                      {vendorDetails.dataAccessTypes
                        ?.map((d) => d.dataAccessTypeName)
                        .join(", ") || "N/A"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#01443B]">
                      Data Classifications:
                    </dt>
                    <dd>
                      {vendorDetails.dataClassifications
                        ?.map((d) => d.dataClassificationName)
                        .join(", ") || "N/A"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-[#01443B]">
                      Data Hosting:
                    </dt>
                    <dd>
                      {vendorDetails.dataHostingArrangements
                        ?.map((d) => d.dataHostingArrangementName)
                        .join(", ") || "N/A"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            {activeTab === "compliance" && (
              <div>
                <h3 className="text-2xl font-bold text-[#01443B] mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-[#01443B]" />
                  Compliance & Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-[#f0fdfa] to-white rounded-xl shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-[#01443B]" />
                      Certifications
                    </h4>
                    {vendorDetails.vendorCertifications?.length ? (
                      <ul className="list-disc ml-6 text-lg">
                        {vendorDetails.vendorCertifications.map((cert) => (
                          <li key={cert.vendorCertificationId}>
                            {cert.certificationName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">
                        No certifications available.
                      </p>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-[#f0fdfa] to-white rounded-xl shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-[#01443B]" />
                      Compliance Frameworks
                    </h4>
                    {vendorDetails.complianceFrameworks?.length ? (
                      <ul className="list-disc ml-6 text-lg">
                        {vendorDetails.complianceFrameworks.map((fw) => (
                          <li key={fw.complianceFrameworkId}>
                            {fw.frameworkName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No frameworks available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rif" && (
              <div>
                <h3 className="text-2xl font-bold text-[#01443B] mb-3 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-[#01443B]" />
                  RIF Calculation
                </h3>
                {riskSummary ? (
                  <RiskSummaryDashboard
                    precomputed={riskSummary}
                    titleName={vendorDetails.legalName}
                    onExport={() => {}}
                    onComplete={() => {}}
                  />
                ) : (
                  <p className="text-gray-500">No RIF calculation available.</p>
                )}
              </div>
            )}
          </AnimatedTab>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardDirectory;
