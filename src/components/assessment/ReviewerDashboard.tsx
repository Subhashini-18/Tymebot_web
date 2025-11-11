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
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { apiService } from "../../services/api/apiservice";
import { getAuthData } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

// API Response Types
interface PendingReview {
  isActive: boolean;
  vendorName: string;
  riskLevelId: number;
  submittedBy: string;
  submissionId: number;
  riskLevelName: string;
  submissionDate: string;
  thirdPartyVendorId: number;
}

interface ReviewAttachment {
  fileName: string;
  filePath: string;
  fileType: string;
}

interface ReviewResponse {
  isFinal: boolean;
  version: number;
  answeredAt: string;
  answeredBy: number;
  responseId: number;
  responseJson: any | null;
  responseText: string | null;
  attachmentsJson: ReviewAttachment[] | null;
}

interface Assessment {
  evaluatedAt: string;
  evaluationId: number;
  evaluationScore: number;
  evaluatorUserId: number;
  evaluationModeId: number;
  compliantStatusId: number;
  evaluationComment: string;
  evidenceReviewSummary: string;
}

interface ReviewQuestion {
  response: ReviewResponse | null;
  questionId: number;
  assessments: Assessment[] | [];
  displayOrder: number;
  questionText: string;
  currentStageId: number;
  questionTypeId: number;
  currentStatusId: number;
  currentStageCode: string;
  currentStatusCode: string;
  vendorAssessmentQuestionId: number;
}

interface ReviewSubmissionData {
  questions: ReviewQuestion[];
  submissionId: number;
}

interface ReviewFilters {
  riskLevel: string;
  submittedBy: string;
  dateRange: string;
}

interface ReviewPayload {
  submissionId: number;
  reviewerUserId: number;
  reviewComments: string;
  reviewResultId: number; // 1: Approved, 2: Rejected, 3: Requires Clarification
}

const ReviewerDashboard: React.FC = () => {
  const navigate = useNavigate();
  // State for submissions list view
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<PendingReview | null>(null);

  // State for questions view
  const [reviewSubmissionData, setReviewSubmissionData] =
    useState<ReviewSubmissionData | null>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionDetails, setShowQuestionDetails] = useState(true);

  // Review state
  const [overallReviewComment, setOverallReviewComment] = useState("");
  const [overallReviewResult, setOverallReviewResult] = useState<number>(1); // Default to Approved (1)

  // UI state
  const [currentView, setCurrentView] = useState<"list" | "questions">("list");
  const [filters, setFilters] = useState<ReviewFilters>({
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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { showToast } = useToast();
  const BASE_API_PATH = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
  const BASE_PORT = import.meta.env.VITE_BASE_PORT || "8082";

  // Fetch pending reviews on component mount
  useEffect(() => {
    fetchPendingReviews();
  }, []);

  // API Functions
  const fetchPendingReviews = async () => {
    try {
      setIsLoading(true);
      const response: any = await apiService.get(
        `${BASE_API_PATH}get_pending_reviews_for_reviewer`,
        {},
        parseInt(BASE_PORT)
      );

      if (response.isSuccess && response.data?.pendingReviews) {
        setPendingReviews(response.data.pendingReviews);
      } else {
        showToast({
          message: "Failed to fetch pending reviews",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      showToast({
        message: "Error loading pending reviews",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewSubmissionDetail = async (submissionId: number) => {
    try {
      setIsLoadingQuestions(true);
      const response: any = await apiService.get(
        `${BASE_API_PATH}get_review_submission_detail`,
        { id: submissionId },
        parseInt(BASE_PORT)
      );

      if (response.isSuccess && response.data) {
        const data: ReviewSubmissionData = response.data;
        // Sort questions by displayOrder ascending to mirror Questionnaire flow
        const sortedQuestions = [...(data.questions || [])].sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setReviewSubmissionData({ ...data, questions: sortedQuestions });
        setQuestions(sortedQuestions);
        setCurrentQuestionIndex(0);
        setCurrentView("questions");
      } else {
        showToast({
          message: "Failed to fetch review submission details",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching review submission details:", error);
      showToast({
        message: "Error loading review submission details",
        type: "error",
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const submitReviewerComments = async () => {
    const authData = getAuthData();
    if (!authData?.authUserId) {
      showToast({
        message: "Authentication data not found",
        type: "error",
      });
      return;
    }

    if (!selectedSubmission) {
      showToast({
        message: "No submission selected",
        type: "error",
      });
      return;
    }

    if (!overallReviewComment.trim()) {
      showToast({
        message: "Please provide review comments",
        type: "error",
      });
      return;
    }

    const payload: ReviewPayload = {
      submissionId: selectedSubmission.submissionId,
      reviewerUserId: authData.authUserId,
      reviewComments: overallReviewComment,
      reviewResultId: overallReviewResult,
    };

    try {
      setIsSubmittingReview(true);

      const response: any = await apiService.post(
        `${BASE_API_PATH}submit_reviewer_comments`,
        payload,
        parseInt(BASE_PORT)
      );

      if (response.isSuccess) {
        showToast({
          message: "Review submitted successfully",
          type: "success",
        });

        // Navigate to report page for this submission
        try {
          const submissionId = selectedSubmission.submissionId;
          navigate(`/submission-report/${submissionId}`);
        } catch {
          // Fallback: reset states and refresh list
          handleBackToList();
          fetchPendingReviews();
        }
      } else {
        showToast({
          message: "Failed to submit review",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast({
        message: "Error submitting review",
        type: "error",
      });
    } finally {
      setIsSubmittingReview(false);
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

  const getReviewResultColor = (resultId: number) => {
    switch (resultId) {
      case 1:
        return "bg-green-100 text-green-800 border-green-200"; // Approved
      case 2:
        return "bg-red-100 text-red-800 border-red-200"; // Rejected
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Requires Clarification
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReviewResultText = (resultId: number) => {
    switch (resultId) {
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      case 3:
        return "Requires Clarification";
      default:
        return "Not Set";
    }
  };

  // Event Handlers
  const handleSubmissionClick = (submission: PendingReview) => {
    setSelectedSubmission(submission);
    fetchReviewSubmissionDetail(submission.submissionId);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedSubmission(null);
    setReviewSubmissionData(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    // Reset review states
    setOverallReviewComment("");
    setOverallReviewResult(1); // Reset to Approved
    setExpandedQuestions(new Set());
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
  const filteredSubmissions = pendingReviews.filter((submission) => {
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

  // Filtering logic for questions (single-question view mirrors Questionnaire)
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.questionText
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex] || null;

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(totalQuestions - 1, index)));
  };

  const toggleQuestionDetails = () => {
    setShowQuestionDetails(!showQuestionDetails);
  };

  const getSubmissionStats = () => {
    const stats = {
      total: pendingReviews.length,
      critical: pendingReviews.filter(
        (s) => s.riskLevelName.toUpperCase() === "CRITICAL"
      ).length,
      high: pendingReviews.filter(
        (s) => s.riskLevelName.toUpperCase() === "HIGH"
      ).length,
      medium: pendingReviews.filter(
        (s) => s.riskLevelName.toUpperCase() === "MEDIUM"
      ).length,
      low: pendingReviews.filter((s) => s.riskLevelName.toUpperCase() === "LOW")
        .length,
    };
    return stats;
  };

  const stats = getSubmissionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending reviews...</p>
        </div>
      </div>
    );
  }

  // Render submissions list view
  if (currentView === "list") {
    return (
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reviewer Dashboard
            </h1>
            <p className="text-gray-600">
              Review and approve vendor assessment submissions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPendingReviews}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reviews
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">
                  Critical Risk
                </p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.critical}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600" />
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
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {stats.high}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Flag className="h-8 w-8 text-orange-600" />
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
                  Medium & Low
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.medium + stats.low}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search vendors or submitters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.riskLevel}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, riskLevel: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
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
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending reviews
              </h3>
              <p className="text-gray-500">
                There are no vendor submissions pending review at this time.
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <motion.div
                key={submission.submissionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleSubmissionClick(submission)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`w-1 h-8 rounded-full ${getRiskLevelColor(
                            submission.riskLevelName
                          )}`}
                        ></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-[#01443B] rounded-full flex items-center justify-center text-white font-semibold">
                            {submission.vendorName
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {submission.vendorName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Submission ID: {submission.submissionId}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
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
                          submission.riskLevelName
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

  // Render questions view
  if (
    currentView === "questions" &&
    selectedSubmission &&
    reviewSubmissionData
  ) {
    if (isLoadingQuestions) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading review details...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to List</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review: {selectedSubmission.vendorName}
              </h1>
              <p className="text-gray-600">
                Submission ID: {selectedSubmission.submissionId} • Risk Level:{" "}
                {selectedSubmission.riskLevelName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelBadgeColor(
                selectedSubmission.riskLevelName
              )}`}
            >
              {selectedSubmission.riskLevelName}
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {totalQuestions === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-500">
                There are no questions matching your search criteria.
              </p>
            </div>
          ) : (
            <motion.div
              key={currentQuestion?.questionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Progress header */}
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </p>
                  <div className="flex items-center space-x-2">
                    {currentQuestion?.assessments &&
                      currentQuestion.assessments.length > 0 && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getComplianceStatusColor(
                            currentQuestion.assessments[0].compliantStatusId
                          )}`}
                        >
                          {getComplianceStatusText(
                            currentQuestion.assessments[0].compliantStatusId
                          )}
                        </span>
                      )}
                    <button
                      onClick={toggleQuestionDetails}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                      aria-label="Toggle details"
                    >
                      {showQuestionDetails ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded">
                  <div
                    className="bg-[#01443B] h-2 rounded"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          Math.max(totalQuestions, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-6">
                {/* Question text */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentQuestion?.questionText}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Question ID: {currentQuestion?.questionId}
                  </p>
                </div>

                <AnimatePresence>
                  {showQuestionDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 pt-4 mt-4"
                    >
                      <div className="space-y-6">
                        {/* Vendor Response */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Vendor Response
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 mb-2">
                              <strong>Answer:</strong>{" "}
                              {currentQuestion?.response?.responseText ?? "—"}
                            </p>
                            {currentQuestion?.response?.answeredAt && (
                              <p className="text-gray-500 text-sm">
                                Answered at:{" "}
                                {formatDate(
                                  currentQuestion.response.answeredAt
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Attachments */}
                        {currentQuestion?.response?.attachmentsJson &&
                          currentQuestion.response.attachmentsJson.length >
                            0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Attachments
                              </h4>
                              <div className="space-y-2">
                                {currentQuestion.response.attachmentsJson.map(
                                  (att, idx) => (
                                    <div
                                      key={`${att.filePath}-${idx}`}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <Paperclip className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            {att.fileName}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            Type: {att.fileType}
                                          </p>
                                        </div>
                                      </div>
                                      <a
                                        href={att.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 px-3 py-1 text-sm text-[#01443B] hover:bg-[#01443B] hover:text-white rounded-lg transition-colors"
                                      >
                                        <Download className="h-4 w-4" />
                                        <span>View</span>
                                      </a>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Assessment History */}
                        {currentQuestion?.assessments &&
                          currentQuestion.assessments.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Assessment History
                              </h4>
                              <div className="space-y-3">
                                {currentQuestion.assessments.map((asmt) => (
                                  <div
                                    key={asmt.evaluationId}
                                    className="bg-blue-50 p-4 rounded-lg"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">
                                          Score
                                        </p>
                                        <p className="text-lg font-semibold text-blue-600">
                                          {asmt.evaluationScore}/5
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">
                                          Compliance
                                        </p>
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getComplianceStatusColor(
                                            asmt.compliantStatusId
                                          )}`}
                                        >
                                          {getComplianceStatusText(
                                            asmt.compliantStatusId
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">
                                          Evaluated
                                        </p>
                                        <p className="text-gray-600">
                                          {formatDate(asmt.evaluatedAt)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <p className="text-sm font-medium text-gray-700">
                                        Comment
                                      </p>
                                      <p className="text-gray-700">
                                        {asmt.evaluationComment}
                                      </p>
                                    </div>
                                    <div className="mt-2">
                                      <p className="text-sm font-medium text-gray-700">
                                        Evidence Summary
                                      </p>
                                      <p className="text-gray-700">
                                        {asmt.evidenceReviewSummary}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation controls */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                      currentQuestionIndex === 0
                        ? "text-gray-300 border-gray-200"
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Prev
                  </button>
                  <div className="text-sm text-gray-500">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex >= totalQuestions - 1}
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                      currentQuestionIndex >= totalQuestions - 1
                        ? "text-gray-300 border-gray-200"
                        : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Overall Review Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Overall Submission Review
          </h3>

          <div className="space-y-6">
            {/* Overall Review Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Review Result
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="overallResult"
                    value="1"
                    checked={overallReviewResult === 1}
                    onChange={(e) =>
                      setOverallReviewResult(parseInt(e.target.value))
                    }
                    className="mr-2"
                  />
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Approved
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="overallResult"
                    value="2"
                    checked={overallReviewResult === 2}
                    onChange={(e) =>
                      setOverallReviewResult(parseInt(e.target.value))
                    }
                    className="mr-2"
                  />
                  <X className="h-5 w-5 mr-2 text-red-600" />
                  Rejected
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="overallResult"
                    value="3"
                    checked={overallReviewResult === 3}
                    onChange={(e) =>
                      setOverallReviewResult(parseInt(e.target.value))
                    }
                    className="mr-2"
                  />
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                  Requires Clarification
                </label>
              </div>
            </div>

            {/* Overall Review Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Review Comments
              </label>
              <textarea
                value={overallReviewComment}
                onChange={(e) => setOverallReviewComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Provide your overall review comments for this submission..."
                required
              />
            </div>

            {/* Submit Review Button */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleBackToList}
                className="flex items-center px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={submitReviewerComments}
                disabled={isSubmittingReview || !overallReviewComment.trim()}
                className="flex items-center px-6 py-2 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ReviewerDashboard;
