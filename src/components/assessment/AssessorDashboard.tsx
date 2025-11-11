import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Send,
  Flag,
  Users,
  Building,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Info,
  ExternalLink,
  Paperclip,
  FileCheck,
  UserCheck,
  ArrowLeft,
  Bot,
  UserCog,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { apiService } from "../../services/api/apiservice";
import { getAuthData } from "../../utils/auth";
import SubmitConfirmationDialog from "../ui/SubmitConfirmationDialog";

// API Response Types
interface PendingSubmission {
  isActive: boolean;
  vendorName: string;
  riskLevelId: number;
  submittedBy: string;
  submissionId: number;
  riskLevelName: string;
  submissionDate: string;
  thirdPartyVendorId: number;
}

interface QuestionAttachment {
  fileName: string;
  filePath: string;
  fileType: string;
}

interface QuestionResponse {
  isFinal: boolean;
  version: number;
  answeredAt: string;
  answeredBy: number;
  responseId: number;
  attachments: QuestionAttachment[];
  responseJson: any;
  responseText: string;
}

interface Question {
  isActive: boolean;
  response: QuestionResponse;
  questionId: number;
  riskLevelId: number;
  displayOrder: number;
  questionText: string;
  submissionId: number;
  riskLevelName: string;
  currentStageId: number;
  questionTypeId: number;
  currentStatusId: number;
  currentStageCode: string;
  currentStageName: string;
  questionTypeName: string;
  currentStatusCode: string;
  currentStatusName: string;
  vendorAssessmentQuestionId: number;
}

interface QuestionnaireData {
  questions: Question[];
  submissionId: number;
}

interface AssessmentFilters {
  riskLevel: string;
  submittedBy: string;
  dateRange: string;
}

interface AssessmentPayload {
  vendorAssessmentQuestionId?: number; // Optional, integer
  submissionId?: number; // Required if vendorAssessmentQuestionId is not given
  questionId?: number; // Required if vendorAssessmentQuestionId is not given
  evaluatorUserId: number; // Required, integer
  evaluationScore?: number; // Optional, smallint
  evaluationComment?: string; // Optional, text
  evidenceReviewSummary?: string; // Optional, text
  compliantStatusId?: number; // Optional, smallint (1: compliant, 2: partially compliant, 3: non-compliant)
  evaluationModeId?: number; // Optional, smallint (1: AI assessment, 2: manual assessment)
}

const AssessorDashboard: React.FC = () => {
  // State for submissions list view
  const [pendingSubmissions, setPendingSubmissions] = useState<
    PendingSubmission[]
  >([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<PendingSubmission | null>(null);

  // State for questions view
  const [questionnaireData, setQuestionnaireData] =
    useState<QuestionnaireData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Assessment state
  const [assessmentMode, setAssessmentMode] = useState<Record<number, boolean>>(
    {}
  );
  const [evaluationScores, setEvaluationScores] = useState<
    Record<number, number>
  >({});
  const [evaluationComments, setEvaluationComments] = useState<
    Record<number, string>
  >({});
  const [evidenceReviewSummaries, setEvidenceReviewSummaries] = useState<
    Record<number, string>
  >({});
  const [complianceStatuses, setComplianceStatuses] = useState<
    Record<number, number>
  >({});
  const [evaluationModes, setEvaluationModes] = useState<
    Record<number, number>
  >({});

  // UI state
  const [currentView, setCurrentView] = useState<"list" | "questions">("list");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [filters, setFilters] = useState<AssessmentFilters>({
    riskLevel: "all",
    submittedBy: "all",
    dateRange: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState<
    Record<number, boolean>
  >({});
  const [assessedQuestions, setAssessedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showAttachmentPreview, setShowAttachmentPreview] = useState<
    string | null
  >(null);

  // Delegate modal state (assessor)
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [roles, setRoles] = useState<{ roleId: number; roleName: string }[]>(
    []
  );
  const [usersOfTenant, setUsersOfTenant] = useState<
    { authUserId: number; authUserName: string }[]
  >([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmittingDelegate, setIsSubmittingDelegate] = useState(false);

  const { showToast } = useToast();
  const BASE_API_PATH = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
  const BASE_IDAM_API_PATH =
    import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
  const BASE_PORT = import.meta.env.VITE_BASE_PORT || "8082";
  const BASE_IDAM_PORT = import.meta.env.VITE_BASE_IDAM_PORT || "8080";

  // Fetch pending submissions on component mount
  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  // API Functions
  const fetchPendingSubmissions = async () => {
    try {
      setIsLoading(true);
      const response: any = await apiService.get(
        `${BASE_API_PATH}get_pending_assessments_for_assessor`,
        {},
        parseInt(BASE_PORT)
      );

      if (response.isSuccess && response.data?.submissions) {
        setPendingSubmissions(response.data.submissions);
      } else {
        showToast({
          message: "Failed to fetch pending assessments",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      showToast({
        message: "Error loading pending assessments",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const safeArray = <T,>(x: any): T[] => (Array.isArray(x) ? x : x ? [x] : []);

  const fetchRolesForTenant = async (tenantId: number | string) => {
    setIsLoadingRoles(true);
    try {
      const resp: any = await apiService.get(
        `${BASE_API_PATH}get_all_roles_of_tenant`,
        { id: tenantId },
        parseInt(BASE_PORT)
      );
      const list = resp?.data ?? resp ?? [];
      const mapped = safeArray<any>(list).map((r) => ({
        roleId: Number(r.roleId ?? r.id ?? 0),
        roleName: String(r.roleName ?? r.name ?? ""),
      }));
      setRoles(mapped);
    } catch (e: any) {
      setRoles([]);
      showToast({
        message: e?.message || "Failed to fetch roles",
        type: "error",
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const fetchUsersByTenantAndRole = async (
    tenantId: number | string,
    roleId: number | string
  ) => {
    setIsLoadingUsers(true);
    try {
      const resp: any = await apiService.get(
        `${BASE_IDAM_API_PATH}get_users_by_tenant_and_role`,
        { tenantId, roleId },
        parseInt(BASE_IDAM_PORT)
      );
      const users = resp?.data?.users ?? resp?.users ?? resp ?? [];
      const mapped = safeArray<any>(users).map((u) => ({
        authUserId: Number(u.id ?? u.authUserId ?? 0),
        authUserName: String(u.authUserName ?? u.roleName ?? ""),
      }));
      setUsersOfTenant(mapped);
    } catch (e: any) {
      setUsersOfTenant([]);
      showToast({
        message: e?.message || "Failed to fetch users",
        type: "error",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showDelegateModal) {
      const auth = getAuthData();
      if (auth?.tenantId) fetchRolesForTenant(auth.tenantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDelegateModal]);

  const fetchQuestionnaireData = async (submissionId: number) => {
    try {
      setIsLoadingQuestions(true);
      const response: any = await apiService.get(
        `${BASE_API_PATH}get_submission_questions_and_answers`,
        { id: submissionId },
        parseInt(BASE_PORT)
      );

      if (response.isSuccess && response.data) {
        setQuestionnaireData(response.data);
        setQuestions(response.data.questions);
        setCurrentView("questions");

        // Initialize assessment states for all questions
        response.data.questions.forEach((question: Question) => {
          const questionInstanceId = question.vendorAssessmentQuestionId;
          setEvaluationModes((prev) => ({ ...prev, [questionInstanceId]: 2 })); // Default to manual
          setEvaluationScores((prev) => ({ ...prev, [questionInstanceId]: 3 })); // Default score
          setComplianceStatuses((prev) => ({
            ...prev,
            [questionInstanceId]: 2,
          })); // Default to partially compliant
        });

        // Reset to first question
        setCurrentQuestionIndex(0);
      } else {
        showToast({
          message: "Failed to fetch questionnaire data",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching questionnaire data:", error);
      showToast({
        message: "Error loading questionnaire data",
        type: "error",
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const submitQuestionAssessment = async (questionInstanceId: number) => {
    const authData = getAuthData();
    if (!authData?.authUserId) {
      showToast({
        message: "Authentication data not found",
        type: "error",
      });
      return;
    }

    const question = questions.find(
      (q) => q.vendorAssessmentQuestionId === questionInstanceId
    );
    if (!question) {
      showToast({
        message: "Question not found",
        type: "error",
      });
      return;
    }

    const payload: AssessmentPayload = {
      vendorAssessmentQuestionId: questionInstanceId,
      submissionId: selectedSubmission?.submissionId,
      questionId: question.questionId,
      evaluatorUserId: authData.authUserId,
      evaluationScore: evaluationScores[questionInstanceId] || 3,
      evaluationComment: evaluationComments[questionInstanceId] || "",
      evidenceReviewSummary: evidenceReviewSummaries[questionInstanceId] || "",
      compliantStatusId: complianceStatuses[questionInstanceId] || 2,
      evaluationModeId: evaluationModes[questionInstanceId] || 2,
    };

    try {
      setIsSubmittingAssessment((prev) => ({
        ...prev,
        [questionInstanceId]: true,
      }));

      const response: any = await apiService.post(
        `${BASE_API_PATH}submit_question_assessment`,
        payload,
        parseInt(BASE_PORT)
      );

      if (response.isSuccess) {
        showToast({
          message: "Assessment submitted successfully",
          type: "success",
        });

        // Exit assessment mode for this question
        setAssessmentMode((prev) => ({ ...prev, [questionInstanceId]: false }));

        // Mark this question as assessed
        setAssessedQuestions((prev) => {
          const next = new Set(prev);
          next.add(questionInstanceId);
          return next;
        });

        // Auto-advance to next question if not last
        if (
          questions[currentQuestionIndex]?.vendorAssessmentQuestionId ===
            questionInstanceId &&
          currentQuestionIndex < totalQuestions - 1
        ) {
          setTimeout(() => {
            handleNextQuestion();
          }, 600);
        }
      } else {
        showToast({
          message: "Failed to submit assessment",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      showToast({
        message: "Error submitting assessment",
        type: "error",
      });
    } finally {
      setIsSubmittingAssessment((prev) => ({
        ...prev,
        [questionInstanceId]: false,
      }));
    }
  };

  // Utility Functions
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-white";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRiskLevelBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getComplianceStatusText = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "Compliant";
      case 2:
        return "Partially Compliant";
      case 3:
        return "Non-Compliant";
      default:
        return "Not Assessed";
    }
  };

  const getComplianceStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEvaluationModeText = (modeId: number) => {
    switch (modeId) {
      case 1:
        return "AI Assessment";
      case 2:
        return "Manual Assessment";
      default:
        return "Not Set";
    }
  };

  // Navigation Functions
  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(totalQuestions - 1, index)));
  };

  // File utility functions
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    return "📁";
  };

  const isImageFile = (fileType: string) => {
    return fileType.startsWith("image/");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Event Handlers
  const handleSubmissionClick = (submission: PendingSubmission) => {
    setSelectedSubmission(submission);
    fetchQuestionnaireData(submission.submissionId);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setCurrentQuestionIndex(0);
    setSelectedSubmission(null);
    setQuestionnaireData(null);
    setQuestions([]);
    // Reset assessment states
    setAssessmentMode({});
    setEvaluationScores({});
    setEvaluationComments({});
    setEvidenceReviewSummaries({});
    setComplianceStatuses({});
    setEvaluationModes({});
    setExpandedQuestions(new Set());
    setShowAttachmentPreview(null);
  };

  const handleStartAssessment = (questionInstanceId: number) => {
    setAssessmentMode((prev) => ({ ...prev, [questionInstanceId]: true }));
  };

  const handleCancelAssessment = (questionInstanceId: number) => {
    setAssessmentMode((prev) => ({ ...prev, [questionInstanceId]: false }));
  };

  const handleAttachmentPreview = (filePath: string) => {
    setShowAttachmentPreview(filePath);
  };

  const handleClosePreview = () => {
    setShowAttachmentPreview(null);
  };

  const toggleQuestionExpansion = (questionInstanceId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionInstanceId)) {
        newSet.delete(questionInstanceId);
      } else {
        newSet.add(questionInstanceId);
      }
      return newSet;
    });
  };

  // Filtering logic for submissions
  const filteredSubmissions = pendingSubmissions.filter((submission) => {
    const matchesSearch =
      submission.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRiskLevel =
      filters.riskLevel === "all" ||
      submission.riskLevelName.toLowerCase() ===
        filters.riskLevel.toLowerCase();
    const matchesSubmittedBy =
      filters.submittedBy === "all" ||
      submission.submittedBy === filters.submittedBy;

    return matchesSearch && matchesRiskLevel && matchesSubmittedBy;
  });

  // Render main submissions list view
  if (currentView === "list") {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending assessments...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Assessment Dashboard
            </h1>
            <p className="text-gray-600">
              Review and assess vendor submissions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {pendingSubmissions.length} Pending Assessments
                </span>
              </div>
            </div>
            <button
              onClick={() => fetchPendingSubmissions()}
              className="flex items-center px-4 py-2 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vendor name or submitter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filters.riskLevel}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, riskLevel: e.target.value }))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending assessments
              </h3>
              <p className="text-gray-500">
                There are no submissions waiting for assessment.
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <motion.div
                key={submission.submissionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSubmissionClick(submission)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {submission.vendorName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submission ID: {submission.submissionId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Submitted by: {submission.submittedBy}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(submission.submissionDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelBadgeColor(
                          submission?.riskLevelName
                        )}`}
                      >
                        {submission.riskLevelName}
                      </span>
                      <div className="flex items-center text-gray-400">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Render single-question assessment view (like Questionnaire.tsx)
  if (currentView === "questions" && selectedSubmission && questionnaireData) {
    if (isLoadingQuestions) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      );
    }

    if (!currentQuestion) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No questions available
            </h3>
            <p className="text-gray-500">
              There are no questions to assess for this submission.
            </p>
            <button
              onClick={handleBackToList}
              className="mt-4 flex items-center px-4 py-2 text-[#01443B] hover:text-[#01443B]/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-8xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToList}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to List</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {selectedSubmission.vendorName}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Assessment • Submission ID:{" "}
                    {selectedSubmission.submissionId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelBadgeColor(
                    selectedSubmission.riskLevelName
                  )}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {selectedSubmission.riskLevelName} Risk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="max-w-8xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Assessment Progress
                </span>
                <span className="text-sm text-gray-500">
                  {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDelegateModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                <Send className="w-4 h-4" />
                Delegate to User
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <motion.div
                className="bg-gradient-to-r from-[#01443B] to-[#01443B]/80 h-2.5 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((currentQuestionIndex + 1) / totalQuestions) * 100
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between">
              {Array.from({ length: Math.min(totalQuestions, 12) }, (_, i) => {
                const questionIndex = Math.floor(
                  (i * totalQuestions) / Math.min(totalQuestions, 12)
                );
                const isAssessed = assessedQuestions.has(
                  questions[questionIndex]?.vendorAssessmentQuestionId
                );
                const isCurrent = questionIndex === currentQuestionIndex;
                const base = "w-3 h-3 rounded-full transition-all duration-200";
                const cls = isCurrent
                  ? "bg-[#01443B] ring-2 ring-[#01443B]/30 ring-offset-1"
                  : isAssessed
                  ? "bg-green-500"
                  : "bg-gray-300 hover:bg-gray-400";
                return (
                  <button
                    key={i}
                    onClick={() => goToQuestion(questionIndex)}
                    className={`${base} ${cls}`}
                    title={`Question ${questionIndex + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Main Question Panel */}
            <div className="xl:col-span-2">
              <motion.div
                key={currentQuestion.vendorAssessmentQuestionId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div className="bg-gradient-to-r from-[#01443B] to-[#01443B]/90 text-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {currentQuestion.questionTypeName}
                        </span>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {currentQuestion.riskLevelName} Risk
                        </span>
                        {currentQuestion.displayOrder && (
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Order: {currentQuestion.displayOrder}
                          </span>
                        )}
                        {assessedQuestions.has(
                          currentQuestion.vendorAssessmentQuestionId
                        ) && (
                          <span className="bg-green-500/30 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Assessed
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-2 leading-tight">
                        {currentQuestion.questionText}
                      </h2>
                      <div className="flex items-center space-x-4 text-white/80 text-sm">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Answered:{" "}
                          {formatDate(currentQuestion.response.answeredAt)}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          User ID: {currentQuestion.response.answeredBy}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold mb-1">
                        {currentQuestionIndex + 1}
                      </div>
                      <div className="text-sm text-white/70">
                        of {totalQuestions}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6 space-y-6">
                  {/* Vendor Response */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                          Vendor Response
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white/70 p-4 rounded-lg">
                            <p className="text-blue-800 font-medium">
                              {currentQuestion.response.responseText ||
                                "No response provided"}
                            </p>
                          </div>
                          {currentQuestion.response.responseJson && (
                            <details className="bg-white/70 p-4 rounded-lg">
                              <summary className="text-blue-700 cursor-pointer font-medium">
                                Additional Data
                              </summary>
                              <pre className="text-xs text-blue-800 mt-2 whitespace-pre-wrap font-mono">
                                {JSON.stringify(
                                  currentQuestion.response.responseJson,
                                  null,
                                  2
                                )}
                              </pre>
                            </details>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-blue-700">
                            <span className="flex items-center bg-white/50 px-2 py-1 rounded-md">
                              <Info className="w-4 h-4 mr-1" />
                              Version: {currentQuestion.response.version}
                            </span>
                            <span className="flex items-center bg-white/50 px-2 py-1 rounded-md">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {currentQuestion.response.isFinal
                                ? "Final"
                                : "Draft"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Attachments */}
                  {currentQuestion.response.attachments &&
                    currentQuestion.response.attachments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Paperclip className="h-5 w-5 mr-2 text-gray-600" />
                          Evidence & Attachments (
                          {currentQuestion.response.attachments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentQuestion.response.attachments.map(
                            (file, fileIndex) => (
                              <motion.div
                                key={fileIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: fileIndex * 0.1 }}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-[#01443B]/20"
                              >
                                <div className="flex items-start space-x-4">
                                  <div className="text-3xl">
                                    {getFileIcon(file.fileType)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className="font-medium text-gray-900 truncate mb-1"
                                      title={file.fileName}
                                    >
                                      {file.fileName}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-3">
                                      {file.fileType}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                      {isImageFile(file.fileType) && (
                                        <button
                                          onClick={() =>
                                            handleAttachmentPreview(
                                              file.filePath
                                            )
                                          }
                                          className="flex items-center px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          Preview
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          window.open(file.filePath, "_blank")
                                        }
                                        className="flex items-center px-3 py-1.5 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Open
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link =
                                            document.createElement("a");
                                          link.href = file.filePath;
                                          link.download = file.fileName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                        className="flex items-center px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg sticky top-32"
                >
                  {assessmentMode[
                    currentQuestion.vendorAssessmentQuestionId
                  ] ? (
                    <div className="p-4 space-y-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Bot className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-amber-900">
                          Assessment Mode
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 !mt-0">
                        {/* Assessment Method */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Assessment Method
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`evaluationMode_${currentQuestion.vendorAssessmentQuestionId}`}
                                value="1"
                                checked={
                                  evaluationModes[
                                    currentQuestion.vendorAssessmentQuestionId
                                  ] === 1
                                }
                                onChange={(e) =>
                                  setEvaluationModes((prev) => ({
                                    ...prev,
                                    [currentQuestion.vendorAssessmentQuestionId]:
                                      parseInt(e.target.value),
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                              />
                              <Bot className="h-5 w-5 mr-2 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">
                                AI Assessment
                              </span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`evaluationMode_${currentQuestion.vendorAssessmentQuestionId}`}
                                value="2"
                                checked={
                                  evaluationModes[
                                    currentQuestion.vendorAssessmentQuestionId
                                  ] === 2
                                }
                                onChange={(e) =>
                                  setEvaluationModes((prev) => ({
                                    ...prev,
                                    [currentQuestion.vendorAssessmentQuestionId]:
                                      parseInt(e.target.value),
                                  }))
                                }
                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 mr-3"
                              />
                              <UserCog className="h-5 w-5 mr-2 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Manual Assessment
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Compliance Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Compliance Status
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`complianceStatus_${currentQuestion.vendorAssessmentQuestionId}`}
                                value="1"
                                checked={
                                  complianceStatuses[
                                    currentQuestion.vendorAssessmentQuestionId
                                  ] === 1
                                }
                                onChange={(e) =>
                                  setComplianceStatuses((prev) => ({
                                    ...prev,
                                    [currentQuestion.vendorAssessmentQuestionId]:
                                      parseInt(e.target.value),
                                  }))
                                }
                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 mr-3"
                              />
                              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Compliant
                              </span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`complianceStatus_${currentQuestion.vendorAssessmentQuestionId}`}
                                value="2"
                                checked={
                                  complianceStatuses[
                                    currentQuestion.vendorAssessmentQuestionId
                                  ] === 2
                                }
                                onChange={(e) =>
                                  setComplianceStatuses((prev) => ({
                                    ...prev,
                                    [currentQuestion.vendorAssessmentQuestionId]:
                                      parseInt(e.target.value),
                                  }))
                                }
                                className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500 mr-3"
                              />
                              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Partially Compliant
                              </span>
                            </label>
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`complianceStatus_${currentQuestion.vendorAssessmentQuestionId}`}
                                value="3"
                                checked={
                                  complianceStatuses[
                                    currentQuestion.vendorAssessmentQuestionId
                                  ] === 3
                                }
                                onChange={(e) =>
                                  setComplianceStatuses((prev) => ({
                                    ...prev,
                                    [currentQuestion.vendorAssessmentQuestionId]:
                                      parseInt(e.target.value),
                                  }))
                                }
                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mr-3"
                              />
                              <X className="h-5 w-5 mr-2 text-red-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Non-Compliant
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Evaluation Score */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evaluation Score (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={
                            evaluationScores[
                              currentQuestion.vendorAssessmentQuestionId
                            ] || 3
                          }
                          onChange={(e) =>
                            setEvaluationScores((prev) => ({
                              ...prev,
                              [currentQuestion.vendorAssessmentQuestionId]:
                                parseInt(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                          placeholder="Enter score between 1-5"
                        />
                        {/* <p className="text-xs text-gray-500 mt-1">1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent</p> */}
                      </div>

                      {/* Comments */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Evaluation Comments
                          </label>
                          <textarea
                            value={
                              evaluationComments[
                                currentQuestion.vendorAssessmentQuestionId
                              ] || ""
                            }
                            onChange={(e) =>
                              setEvaluationComments((prev) => ({
                                ...prev,
                                [currentQuestion.vendorAssessmentQuestionId]:
                                  e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                            placeholder="Enter your evaluation comments..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Evidence Review Summary
                          </label>
                          <textarea
                            value={
                              evidenceReviewSummaries[
                                currentQuestion.vendorAssessmentQuestionId
                              ] || ""
                            }
                            onChange={(e) =>
                              setEvidenceReviewSummaries((prev) => ({
                                ...prev,
                                [currentQuestion.vendorAssessmentQuestionId]:
                                  e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                            placeholder="Summarize your review of the evidence provided..."
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() =>
                            submitQuestionAssessment(
                              currentQuestion.vendorAssessmentQuestionId
                            )
                          }
                          disabled={
                            isSubmittingAssessment[
                              currentQuestion.vendorAssessmentQuestionId
                            ]
                          }
                          className="w-full flex items-center justify-center px-6 py-3 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          {isSubmittingAssessment[
                            currentQuestion.vendorAssessmentQuestionId
                          ] ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Submit Assessment
                        </button>
                        <button
                          onClick={() =>
                            handleCancelAssessment(
                              currentQuestion.vendorAssessmentQuestionId
                            )
                          }
                          className="w-full flex items-center justify-center px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 text-center">
                      <div className="bg-gray-50 rounded-xl p-8">
                        <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Ready for Assessment
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Review the vendor's response and evidence, then start
                          the assessment process.
                        </p>
                        <button
                          onClick={() =>
                            handleStartAssessment(
                              currentQuestion.vendorAssessmentQuestionId
                            )
                          }
                          className="w-full flex items-center justify-center px-6 py-3 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 transition-all font-medium"
                        >
                          <FileCheck className="h-5 w-5 mr-2" />
                          Start Assessment
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* Assessment Panel */}
            <div className="xl:col-span-1"></div>
          </div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-8"
          >
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="text-sm text-gray-500 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex >= totalQuestions - 1}
              className="flex items-center px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </motion.div>
        </div>

        {/* Delegate Modal */}
        <AnimatePresence>
          {showDelegateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowDelegateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delegate to User
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tenant
                    </label>
                    <input
                      type="text"
                      disabled
                      value={
                        getAuthData()?.tenantName ||
                        String(getAuthData()?.tenantId || "")
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-100 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      value={selectedRoleId}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setSelectedRoleId(val);
                        setSelectedUserId("");
                        const auth = getAuthData();
                        if (val && auth?.tenantId) {
                          await fetchUsersByTenantAndRole(auth.tenantId, val);
                        } else {
                          setUsersOfTenant([]);
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">
                        {isLoadingRoles ? "Loading roles…" : "Select role"}
                      </option>
                      {!isLoadingRoles &&
                        roles.map((r) => (
                          <option key={r.roleId} value={String(r.roleId)}>
                            {r.roleName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      User of Tenant
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      disabled={!selectedRoleId || isLoadingUsers}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    >
                      {!selectedRoleId ? (
                        <option value="">Select role first</option>
                      ) : isLoadingUsers ? (
                        <option value="">Loading users…</option>
                      ) : usersOfTenant.length ? (
                        <>
                          <option value="">Select user</option>
                          {usersOfTenant.map((u) => (
                            <option
                              key={u.authUserId}
                              value={String(u.authUserId)}
                            >
                              {u.authUserName}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="">No users for selected role</option>
                      )}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowDelegateModal(false)}
                    className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const auth = getAuthData();
                        if (!auth?.authUserId) {
                          showToast({
                            message: "Authentication not found",
                            type: "error",
                          });
                          return;
                        }
                        if (!selectedRoleId || !selectedUserId) {
                          showToast({
                            message: "Please select role and user",
                            type: "error",
                          });
                          return;
                        }
                        if (!questionnaireData?.submissionId) {
                          showToast({
                            message: "Submission not found",
                            type: "error",
                          });
                          return;
                        }
                        setIsSubmittingDelegate(true);
                        const payload = {
                          submissionId: questionnaireData.submissionId,
                          delegatorUserId: auth.authUserId,
                          delegateToUserId: Number(selectedUserId),
                          allowRedelegate: true,
                          questionIds: [currentQuestion?.questionId].filter(
                            Boolean
                          ) as number[],
                        } as const;
                        const resp: any = await apiService.post(
                          `${BASE_API_PATH}delegate_assessment_questions`,
                          payload,
                          parseInt(BASE_PORT as any)
                        );
                        if (resp?.isSuccess) {
                          showToast({
                            message: "Delegated successfully",
                            type: "success",
                          });
                          setShowDelegateModal(false);
                          setSelectedRoleId("");
                          setSelectedUserId("");
                        } else {
                          showToast({
                            message: resp?.message || "Failed to delegate",
                            type: "error",
                          });
                        }
                      } catch (e: any) {
                        console.error(e);
                        showToast({
                          message: e?.message || "Error delegating",
                          type: "error",
                        });
                      } finally {
                        setIsSubmittingDelegate(false);
                      }
                    }}
                    disabled={
                      isSubmittingDelegate || !selectedRoleId || !selectedUserId
                    }
                    className="inline-flex items-center rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {isSubmittingDelegate ? "Delegating…" : "Delegate"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {showAttachmentPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={handleClosePreview}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-4xl max-h-full bg-white rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Image Preview
                  </h3>
                  <button
                    onClick={handleClosePreview}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4">
                  <img
                    src={showAttachmentPreview}
                    alt="Preview"
                    className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default AssessorDashboard;
