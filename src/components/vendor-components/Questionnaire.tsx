import React, { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  RefreshCw,
  User,
  Users,
  Calendar,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  MessageSquare,
  Upload,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import FormField from "../ui/form/FormField";
import { apiService } from "../../services/api/apiservice";
import RadioGroup from "../ui/RadioGroup";
import SubmitConfirmationDialog from "../ui/SubmitConfirmationDialog";
import { useFormContext } from "../../context/FormContext";
import { useToast } from "../../context/ToastContext";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchVendorPendingQuestions,
  submitQuestionnaireResponse,
  uploadFile,
  showSubmitConfirmation,
  hideSubmitConfirmation,
  clearError,
  clearQuestionnaire,
  PendingSubmission,
} from "../../store/slice/questionnaireSlice";
import {
  Question,
  QuestionnaireSubmissionPayload,
  QuestionnaireService,
} from "../../services/api/questionnaireService";
import { getUserRole, getAuthData } from "../../utils/auth";

// Question metadata interface (keeping for UI consistency)
interface QuestionMetadata {
  assignee: {
    name: string;
    avatar: string;
    email: string;
    role: string;
  };
  followers: Array<{
    name: string;
    avatar: string;
  }>;
  status: "pending" | "in-progress" | "completed" | "needs-review";
  priority: "low" | "medium" | "high" | "critical";
  startDate: string;
  dueDate: string;
  completedDate?: string;
  comments: Array<{
    author: string;
    content: string;
    timestamp: string;
  }>;
}

// Mock question metadata for UI consistency
const getQuestionMetadata = (questionId: number): QuestionMetadata => {
  const mockAssignees = [
    {
      name: "Alice Johnson",
      avatar: "AJ",
      email: "alice.j@company.com",
      role: "Security Analyst",
    },
    {
      name: "Bob Smith",
      avatar: "BS",
      email: "bob.s@company.com",
      role: "IT Manager",
    },
    {
      name: "Carol Davis",
      avatar: "CD",
      email: "carol.d@company.com",
      role: "Compliance Officer",
    },
  ];

  const mockFollowers = [
    { name: "David Wilson", avatar: "DW" },
    { name: "Eve Chen", avatar: "EC" },
    { name: "Frank Miller", avatar: "FM" },
  ];

  const statuses: QuestionMetadata["status"][] = [
    "pending",
    "in-progress",
    "completed",
    "needs-review",
  ];
  const priorities: QuestionMetadata["priority"][] = [
    "low",
    "medium",
    "high",
    "critical",
  ];

  // Generate consistent data based on question ID
  const hash = questionId;
  const assigneeIndex = Math.abs(hash) % mockAssignees.length;
  const statusIndex = Math.abs(hash >> 4) % statuses.length;
  const priorityIndex = Math.abs(hash >> 8) % priorities.length;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.abs(hash % 10));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Math.abs((hash >> 12) % 14) + 1);

  return {
    assignee: mockAssignees[assigneeIndex],
    followers: mockFollowers.slice(0, Math.abs(hash % 3) + 1),
    status: statuses[statusIndex],
    priority: priorities[priorityIndex],
    startDate: startDate.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    completedDate:
      statuses[statusIndex] === "completed"
        ? dueDate.toISOString().split("T")[0]
        : undefined,
    comments: [
      {
        author: "System",
        content: "Question assigned for review",
        timestamp: startDate.toISOString(),
      },
    ],
  };
};

export default function Questionnaire() {
  const { updateFormData, goToNextStep, setStepValidity } = useFormContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userRole = getUserRole();

  // Redux state
  const {
    questions,
    submissionId,
    thirdPartyVendorId,
    loading,
    error,
    submittingQuestions,
    submittedQuestions,
    showSubmitConfirmation: showConfirmDialog,
    pendingSubmissions,
  } = useAppSelector((state) => state.questionnaire);

  // Local UI state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [pendingResponses, setPendingResponses] = useState<Map<number, any>>(
    new Map()
  );
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false);
  const [showQuestionDetails, setShowQuestionDetails] = useState(true);

  // Delegate modal state
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

  const methods = useForm({
    defaultValues: {},
    mode: "onChange",
  });

  // Get current question
  const currentQuestion = questions?.[currentQuestionIndex];
  const currentQuestionMetadata = currentQuestion
    ? getQuestionMetadata(currentQuestion.questionId)
    : null;
  const totalQuestions = questions?.length || 0;

  // Fetch questions on component mount (only for vendors)
  useEffect(() => {
    if (userRole === "vendor") {
      dispatch(fetchVendorPendingQuestions());
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearQuestionnaire());
    };
  }, [userRole, dispatch]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast({
        message: error,
        type: "error",
      });
      dispatch(clearError());
    }
  }, [error, showToast, dispatch]);

  // Navigation handlers
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation if no modal is open
      if (showConfirmDialog) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentQuestionIndex > 0) {
            handlePrevQuestion();
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentQuestionIndex < totalQuestions - 1) {
            handleNextQuestion();
          }
          break;
        case "Escape":
          event.preventDefault();
          if (showQuestionDetails) {
            toggleQuestionDetails();
          }
          break;
        case "d":
        case "D":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleQuestionDetails();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestionIndex,
    totalQuestions,
    showConfirmDialog,
    showQuestionDetails,
    handlePrevQuestion,
    handleNextQuestion,
    toggleQuestionDetails,
  ]);
  // Handle file upload
  const handleFileUpload = async (
    file: File,
    questionInstanceId: number
  ): Promise<string> => {
    const fileKey = `${questionInstanceId}_${file.name}`;
    setUploadingFiles((prev) => new Set(prev).add(fileKey));

    try {
      const uploadResult: any = await dispatch(uploadFile(file)).unwrap();
      return uploadResult.filePath; // Using the updated filePath property
    } catch (error) {
      console.error("File upload failed:", error);
      showToast({
        message: "File upload failed. Please try again.",
        type: "error",
      });
      throw error;
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  // Prepare submission payload with actual files
  const prepareSubmissionPayload = useCallback(
    (
      questionInstanceId: number,
      responseValue: string,
      responseComment?: string,
      actualFiles?: File[]
    ): {
      payload: QuestionnaireSubmissionPayload;
      actualFiles: File[];
    } | null => {
      if (!submissionId) {
        showToast({
          message: "Submission ID not available",
          type: "error",
        });
        return null;
      }

      // Find the question to get questionId
      const question = questions.find(
        (q) => q.questionInstanceId === questionInstanceId
      );
      if (!question) {
        showToast({
          message: "Question not found",
          type: "error",
        });
        return null;
      }

      // Get actorUserId from auth data
      const authData = getAuthData();
      if (!authData?.authUserId) {
        showToast({
          message: "User ID not available",
          type: "error",
        });
        return null;
      }

      const payload: QuestionnaireSubmissionPayload = {
        vendorAssessmentQuestionId: questionInstanceId, // Using questionInstanceId as vendorAssessmentQuestionId
        submissionId: submissionId,
        questionId: question.questionId,
        actorUserId: authData.authUserId,
        responseValue,
        responseComment,
        files:
          actualFiles && actualFiles.length > 0
            ? actualFiles.map((file) => ({
              fileName: file.name,
              filePath: "", // Will be updated after upload
              fileType: file.type,
            }))
            : undefined,
      };

      return {
        payload,
        actualFiles: actualFiles || [],
      };
    },
    [submissionId, questions, showToast]
  );

  // Fetch roles and users for delegate modal
  const BASE_API_PATH = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
  const BASE_IDAM_API_PATH =
    import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
  const BASE_PORT = parseInt(import.meta.env.VITE_BASE_PORT || "8082", 10);
  const BASE_IDAM_PORT = parseInt(
    import.meta.env.VITE_BASE_IDAM_PORT || "8080",
    10
  );

  const safeArray = <T,>(x: any): T[] => (Array.isArray(x) ? x : x ? [x] : []);

  const fetchRolesForTenant = async (tenantId: number | string) => {
    setIsLoadingRoles(true);
    try {
      const resp: any = await apiService.get(
        `${BASE_API_PATH}get_all_roles_of_tenant`,
        { id: tenantId },
        BASE_PORT
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
        BASE_IDAM_PORT
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

  const handleDelegate = async () => {
    const auth = getAuthData();
    if (!auth?.authUserId) {
      showToast({ message: "Authentication not found", type: "error" });
      return;
    }
    if (!selectedRoleId || !selectedUserId) {
      showToast({ message: "Please select role and user", type: "error" });
      return;
    }
    if (!currentQuestion) {
      showToast({ message: "No active question", type: "error" });
      return;
    }
    try {
      setIsSubmittingConfirmation(true);
      // Use questionnaire submissionId from store and delegate only the current questionId
      const payload = {
        submissionId: submissionId,
        delegatorUserId: auth.authUserId,
        delegateToUserId: Number(selectedUserId),
        allowRedelegate: true,
        questionIds: [currentQuestion.questionId],
      } as const;
      const resp: any = await apiService.post(
        `${BASE_API_PATH}delegate_vendor_response_questions`,
        payload,
        BASE_PORT
      );
      if (resp?.isSuccess) {
        showToast({ message: "Delegated successfully", type: "success" });
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
      showToast({ message: e?.message || "Error delegating", type: "error" });
    } finally {
      setIsSubmittingConfirmation(false);
    }
  };

  // Handle individual question submission
  const handleQuestionSubmit = useCallback(
    async (questionInstanceId: number) => {
      const formData = methods.getValues();
      const yesNoValue = formData[`${questionInstanceId}_yesno`];
      const responseValue = formData[`${questionInstanceId}_response`];
      const commentValue = formData[`${questionInstanceId}_comment`];

      // Determine the main response value
      const mainResponse = yesNoValue || responseValue;

      if (!mainResponse) {
        showToast({
          message: "Please provide a response before submitting",
          type: "warning",
        });
        return;
      }

      // Get files if any
      const fileInput = document.querySelector(
        `input[name="${questionInstanceId}_file"]`
      ) as HTMLInputElement;
      const files = fileInput?.files ? Array.from(fileInput.files) : [];

      console.log("DEBUG - Question submission:", {
        questionInstanceId,
        mainResponse,
        commentValue,
        fileInput,
        filesCount: files.length,
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      });

      const submissionData = prepareSubmissionPayload(
        questionInstanceId,
        mainResponse,
        commentValue,
        files
      );

      if (submissionData) {
        // Show confirmation dialog with actual files
        dispatch(showSubmitConfirmation([submissionData]));
      }
    },
    [methods, prepareSubmissionPayload, dispatch, showToast]
  );

  // Handle bulk submission
  const handleBulkSubmit = useCallback(() => {
    const formData = methods.getValues();
    const submissions: PendingSubmission[] = [];

    questions.forEach((question) => {
      const questionInstanceId = question.questionInstanceId;

      // Skip if already submitted
      if (submittedQuestions.includes(questionInstanceId)) {
        return;
      }

      const yesNoValue = formData[`${questionInstanceId}_yesno`];
      const responseValue = formData[`${questionInstanceId}_response`];
      const commentValue = formData[`${questionInstanceId}_comment`];

      const mainResponse = yesNoValue || responseValue;

      if (mainResponse) {
        const fileInput = document.querySelector(
          `input[name="${questionInstanceId}_file"]`
        ) as HTMLInputElement;
        const files = fileInput?.files ? Array.from(fileInput.files) : [];

        const submissionData = prepareSubmissionPayload(
          questionInstanceId,
          mainResponse,
          commentValue,
          files
        );
        if (submissionData) {
          submissions.push(submissionData);
        }
      }
    });

    if (submissions.length > 0) {
      dispatch(showSubmitConfirmation(submissions));
    } else {
      showToast({
        message: "No responses to submit",
        type: "info",
      });
    }
  }, [
    methods,
    questions,
    submittedQuestions,
    prepareSubmissionPayload,
    dispatch,
    showToast,
  ]);

  // Handle confirmation dialog submit
  const handleConfirmSubmit = useCallback(async () => {
    setIsSubmittingConfirmation(true);
    try {
      for (const submission of pendingSubmissions) {
        const { payload, actualFiles } = submission;

        // First, upload files if any
        let updatedPayload = { ...payload };
        console.log("Processing submission:", { payload, actualFiles });

        if (actualFiles && actualFiles.length > 0) {
          const uploadedFiles = [];

          for (const file of actualFiles) {
            try {
              // Upload the file first
              showToast({
                message: `Uploading file: ${file.name}...`,
                type: "info",
              });

              console.log("Uploading file:", file);
              const uploadResult: any = await dispatch(
                uploadFile(file)
              ).unwrap();
              console.log("Upload result:", uploadResult);
              console.log("Upload result filePath:", uploadResult.filePath);

              const fileInfo = {
                fileName: file.name,
                filePath: uploadResult.filePath, // Using the updated filePath property
                fileType: file.type,
              };

              console.log("File info to be added:", fileInfo);
              console.log("Expected format example:", {
                fileName:
                  "TRACS Product Workflow and Dashboard metrics document.docx",
                filePath:
                  "https://qeuboxblob.blob.core.windows.net/quebox/TRACS%20Product%20Workflow%20and%20Dashboard%20metrics%20document.docx",
                fileType:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              });
              uploadedFiles.push(fileInfo);

              showToast({
                message: `File uploaded successfully: ${file.name}`,
                type: "success",
              });
            } catch (uploadError) {
              console.error("File upload failed for:", file.name, uploadError);
              showToast({
                message: `Failed to upload file: ${file.name}`,
                type: "error",
              });
              // Continue with other files
            }
          }

          // Update payload with uploaded file paths
          updatedPayload.files =
            uploadedFiles.length > 0 ? uploadedFiles : undefined;
        }

        // Then submit the questionnaire response with file paths
        console.log(
          "Final payload for questionnaire submission:",
          JSON.stringify(updatedPayload, null, 2)
        );
        console.log("Files in payload:", updatedPayload.files);
        if (updatedPayload.files) {
          console.log("File details:");
          updatedPayload.files.forEach((file, index) => {
            console.log(`File ${index + 1}:`, {
              fileName: file.fileName,
              filePath: file.filePath,
              fileType: file.fileType,
            });
          });
        }
        await dispatch(submitQuestionnaireResponse(updatedPayload)).unwrap();
      }

      showToast({
        message: `Successfully submitted ${pendingSubmissions.length} response${pendingSubmissions.length > 1 ? "s" : ""
          }`,
        type: "success",
      });

      dispatch(hideSubmitConfirmation());

      // Auto-advance to next question if submitting single question and not on the last question
      if (
        pendingSubmissions.length === 1 &&
        currentQuestionIndex < totalQuestions - 1
      ) {
        setTimeout(() => {
          handleNextQuestion();
        }, 1000); // Small delay to show success state
      }
    } catch (error: any) {
      showToast({
        message: error.message || "Failed to submit responses",
        type: "error",
      });
    } finally {
      setIsSubmittingConfirmation(false);
    }
  }, [
    pendingSubmissions,
    dispatch,
    showToast,
    currentQuestionIndex,
    totalQuestions,
    handleNextQuestion,
  ]);

  // Handle confirmation dialog cancel
  const handleCancelSubmit = useCallback(() => {
    dispatch(hideSubmitConfirmation());
  }, [dispatch]);

  const renderQuestion = (question: Question) => {
    const questionType = QuestionnaireService.getQuestionType(
      question.questionTypeId
    );
    const isYesNo = QuestionnaireService.isYesNoQuestion(
      question.questionTypeId
    );
    const isSubmitted = submittedQuestions.includes(
      question.questionInstanceId
    );
    const isSubmitting = submittingQuestions.includes(
      question.questionInstanceId
    );

    if (isYesNo) {
      return (
        <div>
          <RadioGroup
            name={`${question.questionInstanceId}_yesno`}
            label={question.questionText}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            required={true}
            direction="horizontal"
            disabled={isSubmitted}
          />
          <ConditionalFollowUp
            questionInstanceId={question.questionInstanceId}
            question={question}
            disabled={isSubmitted}
          />
          {!isSubmitted && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  handleQuestionSubmit(question.questionInstanceId)
                }
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#01443b] to-[#04ae8a] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Response"}
              </button>
            </div>
          )}
          {isSubmitted && (
            <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Response submitted successfully
              </span>
            </div>
          )}
        </div>
      );
    }

    // Handle other question types
    switch (questionType) {
      case "textarea":
        return (
          <div>
            <FormField
              name={`${question.questionInstanceId}_response`}
              label={question.questionText}
              textarea={true}
              required={true}
              disabled={isSubmitted}
            />
            {!isSubmitted && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() =>
                    handleQuestionSubmit(question.questionInstanceId)
                  }
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#01443b] to-[#04ae8a] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            )}
            {isSubmitted && (
              <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Response submitted successfully
                </span>
              </div>
            )}
          </div>
        );
      case "file":
        return (
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-4">
              {question.questionText}
            </label>
            <FileUploadComponent
              questionInstanceId={question.questionInstanceId}
              disabled={isSubmitted}
            />
            {!isSubmitted && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() =>
                    handleQuestionSubmit(question.questionInstanceId)
                  }
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#01443b] to-[#04ae8a] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            )}
            {isSubmitted && (
              <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Response submitted successfully
                </span>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div>
            <FormField
              name={`${question.questionInstanceId}_response`}
              label={question.questionText}
              type="text"
              required={true}
              disabled={isSubmitted}
            />
            {!isSubmitted && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() =>
                    handleQuestionSubmit(question.questionInstanceId)
                  }
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#01443b] to-[#04ae8a] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            )}
            {isSubmitted && (
              <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Response submitted successfully
                </span>
              </div>
            )}
          </div>
        );
    }
  };

  function ConditionalFollowUp({
    questionInstanceId,
    question,
    disabled = false,
  }: {
    questionInstanceId: number;
    question: Question;
    disabled?: boolean;
  }) {
    const value: any = useWatch({
      name: `${questionInstanceId}_yesno`,
      control: methods.control,
    });

    if (value === "yes") {
      return (
        <div className="mt-6 space-y-6">
          <FormField
            name={`${questionInstanceId}_comment`}
            label="Please provide details"
            textarea={true}
            placeholder="Please provide additional details..."
            disabled={disabled}
          />
          <FileUploadComponent
            questionInstanceId={questionInstanceId}
            disabled={disabled}
          />
        </div>
      );
    }
    return null;
  }

  function FileUploadComponent({
    questionInstanceId,
    disabled = false,
  }: {
    questionInstanceId: number;
    disabled?: boolean;
  }) {
    const fileKey = `${questionInstanceId}_file`;
    const isUploading = uploadingFiles.has(fileKey);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const validFiles: File[] = [];

        fileArray.forEach((file) => {
          const fileSizeMB = file.size / 1024 / 1024;
          if (fileSizeMB > 1) {
            showToast({
              message: `File "${file.name}" exceeds 1 MB and was not added.`,
              type: "warning",
            });
          } else {
            validFiles.push(file);
          }
        });

        setSelectedFiles(validFiles);
      } else {
        setSelectedFiles([]);
      }
    };

    const removeFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);

      // Update the input element
      const input = document.getElementById(
        `${questionInstanceId}_file`
      ) as HTMLInputElement;
      if (input) {
        const dt = new DataTransfer();
        newFiles.forEach((file) => dt.items.add(file));
        input.files = dt.files;
      }
    };

    return (
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attach supporting document
        </label>

        {/* File Upload Area */}
        <div className="relative flex items-center mb-3">
          <input
            type="file"
            name={`${questionInstanceId}_file`}
            id={`${questionInstanceId}_file`}
            className="peer absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileChange}
            disabled={isUploading || disabled}
          />
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 border-dashed border-[#04ae8a] bg-white shadow-sm hover:bg-blue-50 transition-all w-full ${isUploading || disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isUploading ? (
              <RefreshCw className="w-6 h-6 text-[#04ae8a] animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-[#04ae8a]" />
            )}
            <span className="text-[#01443b] font-medium">
              {isUploading
                ? "Uploading..."
                : disabled
                  ? "File uploaded"
                  : selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Click or drag file to upload"}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              PDF, DOC, PNG, JPG
            </span>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Selected files:
              </p>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById(
                    `${questionInstanceId}_file`
                  ) as HTMLInputElement;
                  console.log("DEBUG - Input element:", input);
                  console.log("DEBUG - Input files:", input?.files);
                  console.log("DEBUG - State files:", selectedFiles);
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Debug Files
              </button>
            </div>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!disabled && !isUploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  // Error state for non-vendor users
  if (userRole !== "vendor") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This questionnaire is only available for vendor users.
          </p>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions?.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Pending Questions
          </h2>
          <p className="text-gray-600">
            You have no pending questionnaire items at this time.
          </p>
        </div>
      </div>
    );
  }

  // Sophisticated Right Sidebar Component
  const QuestionDetailsSidebar = () => {
    if (!currentQuestionMetadata || !currentQuestion) return null;

    const getStatusIcon = (status: QuestionMetadata["status"]) => {
      switch (status) {
        case "completed":
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "in-progress":
          return <Clock className="w-5 h-5 text-blue-500" />;
        case "needs-review":
          return <AlertCircle className="w-5 h-5 text-orange-500" />;
        default:
          return <Clock className="w-5 h-5 text-gray-400" />;
      }
    };

    const getStatusColor = (status: QuestionMetadata["status"]) => {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-800 border-green-200";
        case "in-progress":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "needs-review":
          return "bg-orange-100 text-orange-800 border-orange-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getPriorityColor = (priority: QuestionMetadata["priority"]) => {
      switch (priority) {
        case "critical":
          return "bg-red-100 text-red-800 border-red-200";
        case "high":
          return "bg-orange-100 text-orange-800 border-orange-200";
        case "medium":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
          return "bg-green-100 text-green-800 border-green-200";
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const isSubmitting = submittingQuestions.includes(
      currentQuestion.questionInstanceId
    );
    const isSubmitted = submittedQuestions.includes(
      currentQuestion.questionInstanceId
    );

    return (
      <AnimatePresence>
        {showQuestionDetails && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden lg:block w-full lg:w-96 xl:w-[420px] bg-white border border-gray-200 rounded-xl shadow-sm self-start"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#01443b] to-[#04ae8a] rounded-t-xl">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Question Details
              </h3>
              <button
                onClick={toggleQuestionDetails}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
              {/* Question Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Question</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </h5>
                  <div
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      currentQuestionMetadata.status
                    )}`}
                  >
                    {getStatusIcon(currentQuestionMetadata.status)}
                    {currentQuestionMetadata.status.replace("-", " ")}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Priority
                  </h5>
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      currentQuestionMetadata.priority
                    )}`}
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    {currentQuestionMetadata.priority}
                  </div>
                </div>
              </div>

              {/* Submission Status */}
              {isSubmitting && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm font-medium text-blue-800">
                      Submitting response...
                    </span>
                  </div>
                </div>
              )}

              {isSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Response submitted successfully
                    </span>
                  </div>
                </div>
              )}

              {/* Question Type Info */}
              <div>
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Question Type
                </h5>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <FileText className="w-3 h-3" />
                  {QuestionnaireService.getQuestionType(
                    currentQuestion.questionTypeId
                  )}
                </div>
              </div>

              {/* Assignee + Delegate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Assigned To
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowDelegateModal(true)}
                    className="text-xs inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1.5 font-medium text-white hover:bg-emerald-800"
                  >
                    <Send className="w-3 h-3" /> Delegate
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#04ae8a] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {currentQuestionMetadata.assignee.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {currentQuestionMetadata.assignee.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentQuestionMetadata.assignee.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Start Date
                  </h5>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4" />
                    {formatDate(currentQuestionMetadata.startDate)}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Due Date
                  </h5>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4" />
                    {formatDate(currentQuestionMetadata.dueDate)}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Comments
                </h5>
                <div className="space-y-2">
                  {currentQuestionMetadata.comments.map((comment, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-8xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-[#04ae8a]" />
                <div>
                  <h1 className="text-2xl font-bold text-[#01443b]">
                    Vendor Questionnaire
                  </h1>
                  <p className="text-sm text-gray-600">
                    Complete your security assessment
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {submittedQuestions.length} of {totalQuestions} completed
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(
                      (submittedQuestions.length / totalQuestions) * 100
                    )}
                    % progress
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#04ae8a] to-[#01443b] h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(submittedQuestions.length / totalQuestions) * 100
                        }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 items-start">
            {currentQuestion && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  {/* Question Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          Question
                        </span>
                        <span className="bg-[#04ae8a] text-white px-3 py-1 rounded-full text-sm font-bold">
                          {currentQuestionIndex + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          of {totalQuestions}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {submittedQuestions.includes(
                        currentQuestion.questionInstanceId
                      ) && (
                          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        )}

                      {submittingQuestions.includes(
                        currentQuestion.questionInstanceId
                      ) && (
                          <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Submitting...
                          </div>
                        )}
                    </div>

                    {/* Question Details Toggle */}
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                        <span>Use ← → to navigate</span>
                        <span>•</span>
                        <span>Ctrl+D for details</span>
                      </div>
                      <button
                        onClick={toggleQuestionDetails}
                        className="flex items-Detailscenter gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#04ae8a] hover:bg-white rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Question Details Panel */}
                  {/* <AnimatePresence>
                                        {showQuestionDetails && currentQuestionMetadata && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#04ae8a] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                                {currentQuestionMetadata.assignee.avatar}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">{currentQuestionMetadata.assignee.name}</p>
                                                                <p className="text-xs text-gray-500">{currentQuestionMetadata.assignee.role}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Priority</h4>
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentQuestionMetadata.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                            currentQuestionMetadata.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                currentQuestionMetadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                            }`}>
                                                            <Flag className="w-3 h-3 mr-1" />
                                                            {currentQuestionMetadata.priority}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Due Date</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(currentQuestionMetadata.dueDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence> */}

                  {/* Main Question Card */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-8">
                      {/* Question Type Badge */}
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3" />
                          {QuestionnaireService.getQuestionType(
                            currentQuestion.questionTypeId
                          )}
                        </span>
                      </div>

                      {/* Question Content */}
                      <div className="space-y-6">
                        {renderQuestion(currentQuestion)}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-6">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {/* Question Dots Navigation */}
                    <div className="flex items-center gap-2">
                      {questions
                        ?.slice(
                          Math.max(0, currentQuestionIndex - 2),
                          Math.min(totalQuestions, currentQuestionIndex + 3)
                        )
                        .map((_, idx) => {
                          const actualIndex =
                            Math.max(0, currentQuestionIndex - 2) + idx;
                          const isCompleted = submittedQuestions.includes(
                            questions[actualIndex].questionInstanceId
                          );
                          const isCurrent =
                            actualIndex === currentQuestionIndex;

                          return (
                            <button
                              key={actualIndex}
                              onClick={() => goToQuestion(actualIndex)}
                              className={`w-3 h-3 rounded-full transition-all ${isCurrent
                                  ? "bg-[#04ae8a] scale-125"
                                  : isCompleted
                                    ? "bg-green-500"
                                    : "bg-gray-300 hover:bg-gray-400"
                                }`}
                              aria-label={`Go to question ${actualIndex + 1}`}
                            />
                          );
                        })}

                      {totalQuestions > 5 &&
                        currentQuestionIndex < totalQuestions - 3 && (
                          <span className="text-gray-400 text-sm">...</span>
                        )}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="flex items-center gap-2 px-6 py-3 bg-[#04ae8a] text-white rounded-xl font-medium hover:bg-[#01443b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bulk Submit Button */}
                  <div className="flex justify-center pt-8">
                    <button
                      type="button"
                      onClick={handleBulkSubmit}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#01443b] to-[#04ae8a] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      <Send className="w-5 h-5" />
                      Submit All Responses
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            <div className="mt-10">
              <QuestionDetailsSidebar />
            </div>
          </div>

          {/* Right Sidebar for Question Details */}

          {/* Submit Confirmation Dialog */}
          <SubmitConfirmationDialog
            isOpen={showConfirmDialog}
            onConfirm={handleConfirmSubmit}
            onCancel={handleCancelSubmit}
            title="Confirm Question Submission"
            message="Are you sure you want to submit these responses? Once submitted, they cannot be modified."
            confirmText="Submit Responses"
            cancelText="Cancel"
            type="warning"
            questionCount={pendingSubmissions.length}
            isSubmitting={isSubmittingConfirmation}
          />

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
                      onClick={handleDelegate}
                      disabled={
                        isSubmittingConfirmation ||
                        !selectedRoleId ||
                        !selectedUserId
                      }
                      className="inline-flex items-center rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {isSubmittingConfirmation ? "Delegating…" : "Delegate"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FormProvider>
  );
}
