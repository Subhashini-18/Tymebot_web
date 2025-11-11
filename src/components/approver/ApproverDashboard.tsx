import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Building,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { apiService } from "../../services/api/apiservice";
import { getAuthData } from "../../utils/auth";
import ApproverSubmissionDetails from "./ApproverSubmissionDetails";
import { setBuckets } from "../../store/slice/approverSlice";
import { useAppDispatch } from "../../store";



/** -------------------- Types -------------------- **/
interface ApprovalSubmission {
  isActive: boolean;
  vendorName: string;
  riskLevelId: number;
  submittedBy: string;
  submissionId: number;
  riskLevelName: string;
  submissionDate: string;
  thirdPartyVendorId: number;
  // new optional fields shown by the API sample
  currentStageId?: number;
  currentStatusId?: number;
  currentStageName?: string;
  currentStatusName?: string;
  currentStageCode?: string;
  currentStatusCode?: string;
}

interface Question {
  isActive: boolean;
  questionId: number;
  riskLevelId: number;
  displayOrder: number | null;
  questionText: string;
  riskLevelName: string;
  questionTypeId: number;
  questionTypeCode: string;
  questionTypeName: string;
  questionnaireGroupId: number;
  questionnaireGroupName: string;
  questionInstanceId?: number;
  questionWfStatusId?: number;
}

interface QuestionnaireData {
  submissionId: number;
  otherQuestions: Question[];
  submittedQuestions: Question[];
}

interface ApprovalFilters {
  riskLevel: string;
  submittedBy: string;
  dateRange: string;
}

/** Buckets the API may return (from your sample) */
type BucketKey =
  | "reviewPending"
  | "approvalPending"
  | "reportGenerated"
  | "reviewCompleted"
  | "approvalRejected"
  | "approvalDelegated"
  | "assessmentPending"
  | "assessmentCompleted"
  | "clientResponsePending"
  | "clientResponseAnswered";

type ApprovalBuckets = Record<BucketKey, ApprovalSubmission[]>;

/** Order + labels + icons for tabs */
const BUCKETS_ORDER: BucketKey[] = [
  "approvalPending",
  "approvalDelegated",
  "approvalRejected",
  "assessmentCompleted",
  "assessmentPending",
  "clientResponseAnswered",
  "clientResponsePending",
  "reviewPending",
  "reviewCompleted",
  "reportGenerated",
];

const BUCKET_META: Record<
  BucketKey,
  {
    label: string;
    icon: React.ElementType;
    tone?: "neutral" | "success" | "warn";
  }
> = {
  approvalPending: { label: "Approval Pending", icon: Clock },
  clientResponsePending: {
    label: "Vendor Response Pending",
    icon: AlertCircle,
    tone: "warn",
  },

  clientResponseAnswered: { label: "Vendor Response Answered", icon: FileText },
  assessmentPending: { label: "Assessment Pending", icon: Clock },
  assessmentCompleted: {
    label: "Assessment Completed",
    icon: CheckCircle,
    tone: "success",
  },
  reviewPending: { label: "Review Pending", icon: Shield },
  reviewCompleted: {
    label: "Review Completed",
    icon: CheckCircle,
    tone: "success",
  },
  reportGenerated: { label: "Report Generated", icon: FileText },
  approvalDelegated: { label: "Approval Delegated", icon: Shield },
  approvalRejected: {
    label: "Approval Rejected",
    icon: AlertCircle,
    tone: "warn",
  },
};

const ApproverDashboard: React.FC = () => {
  // Buckets state
  const [approvalsByBucket, setApprovalsByBucket] = useState<ApprovalBuckets>({
    reviewPending: [],
    approvalPending: [],
    reportGenerated: [],
    reviewCompleted: [],
    approvalRejected: [],
    approvalDelegated: [],
    assessmentPending: [],
    assessmentCompleted: [],
    clientResponsePending: [],
    clientResponseAnswered: [],
  });
  console.log(approvalsByBucket);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ApprovalSubmission | null>(null);
  const [questionnaireData, setQuestionnaireData] =
    useState<QuestionnaireData | null>(null);

  const [filters, setFilters] = useState<ApprovalFilters>({
    riskLevel: "all",
    submittedBy: "all",
    dateRange: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(false);

  // tabs now use bucket keys
  const [activeTab, setActiveTab] = useState<BucketKey>("approvalPending");

  const authData = getAuthData();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();


  const BASE_API_PATH = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
  const BASE_PORT = parseInt(import.meta.env.VITE_BASE_PORT || "8082", 10);

  /** -------------------- Data Fetch -------------------- **/
  useEffect(() => {
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const response: any = await apiService.get(
        `${BASE_API_PATH}get_pending_submissions?clientId=${authData.clientId}&userId=${authData.authUserId}`,
        {},
        BASE_PORT
      );

      if (response?.isSuccess && response?.data) {
        const d = response.data;

        const next: ApprovalBuckets = {
          reviewPending: d.reviewPending ?? [],
          approvalPending: d.approvalPending[0] ?? [],
          reportGenerated: d.reportGenerated ?? [],
          reviewCompleted: d.reviewCompleted ?? [],
          approvalRejected: d.approvalRejected ?? [],
          approvalDelegated: d.approvalDelegated[0] ?? [],
          assessmentPending: d.assessmentPending ?? [],
          assessmentCompleted: d.assessmentCompleted ?? [],
          clientResponsePending: d.clientResponsePending[0] ?? [],
          clientResponseAnswered: d.clientResponseAnswered ?? [],
        };

        setApprovalsByBucket(next);
        dispatch(setBuckets(next));

        // if the current tab became empty and there are items in another tab, switch to the first non-empty
        if (next[activeTab].length === 0) {
          const firstNonEmpty = BUCKETS_ORDER.find((k) => next[k].length > 0);
          if (firstNonEmpty) setActiveTab(firstNonEmpty);
        }
      } else {
        showToast({ message: "Failed to fetch approvals", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
      showToast({ message: "Error loading approvals", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionnaireData = async (submissionId: number) => {
    try {
      setIsLoadingQuestionnaire(true);
      const response: any = await apiService.get(
        `${BASE_API_PATH}get_questionnaire_for_approver`,
        { id: submissionId },
        BASE_PORT
      );

      if (response?.isSuccess && response?.data) {
        setQuestionnaireData(response.data);
      } else {
        showToast({
          message: "Failed to fetch questionnaire data",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching questionnaire data:", error);
      showToast({ message: "Error loading questionnaire data", type: "error" });
    } finally {
      setIsLoadingQuestionnaire(false);
    }
  };

  /** -------------------- UI Helpers -------------------- **/
  const handleSubmissionClick = (submission: ApprovalSubmission) => {
    setSelectedSubmission(submission);
    fetchQuestionnaireData(submission.submissionId);
  };

  const handleBackToList = () => {
    setSelectedSubmission(null);
    setQuestionnaireData(null);
  };

  const getRiskLevelBadgeColor = (riskLevel?: string) => {
    if (!riskLevel) return "bg-gray-100 text-gray-800 border-gray-200";
    switch (riskLevel.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filterSubmissions = (submissions: ApprovalSubmission[]) => {
    console.log(submissions);
    return submissions.filter((submission) => {
      console.log(submission);
      const matchesSearch =
        submission?.vendorName
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        submission?.submittedBy
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase());
      const matchesRiskLevel =
        filters.riskLevel === "all" ||
        (submission.riskLevelName || "").toLowerCase() ===
        filters.riskLevel.toLowerCase();
      const matchesSubmittedBy =
        filters.submittedBy === "all" ||
        submission.submittedBy === filters.submittedBy;
      console.log(matchesSearch, matchesRiskLevel, matchesSubmittedBy);
      return matchesSearch && matchesRiskLevel && matchesSubmittedBy;
    });
  };
  console.log(filterSubmissions(approvalsByBucket[activeTab]));

  // const activeList = filterSubmissions(approvalsByBucket[activeTab]);
  const activeList = filterSubmissions(approvalsByBucket[activeTab]);
  console.log(activeList);
  /** -------------------- Early returns -------------------- **/
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4" />
          <p className="text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (selectedSubmission && questionnaireData) {
    return (
      <ApproverSubmissionDetails
        submission={selectedSubmission}
        questionnaireData={questionnaireData}
        onBack={handleBackToList}
        onApproved={() => {
          handleBackToList();
          fetchApprovals();
        }}
        isLoading={isLoadingQuestionnaire}
        sourceBucket={activeTab}
      />
    );
  }

  /** -------------------- Main -------------------- **/
  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approver Dashboard
          </h1>
          <p className="text-gray-600">Review and approve vendor submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchApprovals}
            className="flex items-center space-x-2 px-4 py-2 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                type="text"
                placeholder="Search vendors or submitters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
              />
            </div>
            <select
              value={filters.riskLevel}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, riskLevel: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {`${BUCKET_META[activeTab].label}: showing ${activeList.length} of ${approvalsByBucket[activeTab].length}`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {BUCKETS_ORDER.map((key) => {
          const Icon = BUCKET_META[key].icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors border-b-2 flex items-center gap-2
                ${isActive
                  ? "border-[#01443B] text-[#01443B] bg-white"
                  : "border-transparent text-gray-500 bg-gray-100"
                }`}
              title={BUCKET_META[key].label}
            >
              <Icon className="h-4 w-4" />
              <span>{BUCKET_META[key].label}</span>
              <span
                className={`ml-1 inline-flex min-w-6 h-6 items-center justify-center rounded-full text-xs px-2
                ${isActive
                    ? "bg-[#01443B] text-white"
                    : "bg-gray-300 text-gray-800"
                  }`}
              >
                {approvalsByBucket[key].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {BUCKET_META[activeTab].label}
          </h2>
        </div>

        {activeList.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items</h3>
            <p className="text-gray-600">
              There are no records in this bucket right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activeList.map((submission) => (
              <motion.div
                key={submission.submissionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSubmissionClick(submission)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-[#01443B] rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.vendorName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted by {submission.submittedBy} •{" "}
                        {formatDate(submission.submissionDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submission ID: {submission.submissionId} • Vendor ID:{" "}
                        {submission.thirdPartyVendorId}
                      </p>
                      {(submission.currentStageName ||
                        submission.currentStatusName) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {submission.currentStageName
                              ? `Stage: ${submission.currentStageName}`
                              : ""}
                            {submission.currentStageName &&
                              submission.currentStatusName
                              ? " • "
                              : ""}
                            {submission.currentStatusName
                              ? `Status: ${submission.currentStatusName}`
                              : ""}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelBadgeColor(
                        submission?.riskLevelName || ""
                      )}`}
                    >
                      {submission?.riskLevelName}
                    </span>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproverDashboard;
