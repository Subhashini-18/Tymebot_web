import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileCheck,
  Send,
  AlertTriangle,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";
import { getAuthData } from "@/utils/auth";
import { set } from "zod";

// Local type copies to decouple from ApproverDashboard internal types
export interface ApprovalSubmission {
  isActive: boolean;
  vendorName: string;
  riskLevelId: number;
  submittedBy: string;
  submissionId: number;
  riskLevelName: string;
  submissionDate: string;
  thirdPartyVendorId: number;
}

export interface Question {
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

type BucketItem = {
  questionId: number;
  displayOrder?: number | null;
  questionText: string;
  submissionId: number;
  lastAssignedOn?: string;
  questionTypeId?: number;
  questionTypeCode?: string;
  questionTypeName?: string;
  allocatedToUserId?: number;
  vendorAssessmentQuestionId?: number;
  history?: any[];
};

type Bucket = {
  count?: number;
  items: BucketItem[];
  stageCode?: string;
  statusCode?: string;
};

export interface QuestionnaireData {
  submissionId: number;
  otherQuestions: Question[];
  submittedQuestions?: Question[]; // optional to support new payload
  buckets?: Bucket[]; // optional: new payload from API
}

interface Props {
  submission: ApprovalSubmission;
  questionnaireData: QuestionnaireData;
  onBack: () => void;
  onApproved?: () => void; // optional callback after final approval
  isLoading?: boolean;
  sourceBucket?: string; // e.g., 'approvalDelegated'
}

const ApproverSubmissionDetails: React.FC<Props> = ({
  submission,
  questionnaireData,
  onBack,
  onApproved,
  isLoading,
  sourceBucket,
}) => {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_API_PATH = import.meta.env.VITE_API_PATH || "/api/g3/tracs/tracs/v1/";
  const BASE_IDAM_API_PATH =
    import.meta.env.VITE_IAM_API_PATH || "/api/g3/tracs/idam/v1/";
  const BASE_PORT = parseInt(import.meta.env.VITE_BASE_PORT || "8082", 10);
  const BASE_IDAM_PORT = parseInt(
    import.meta.env.VITE_BASE_IDAM_PORT || "8080",
    10
  );

  // Delegate-to-user modal state
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
  console.log(usersOfTenant);
  const authData = getAuthData();

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
      // API shape example:
      // {
      //   data: { users: [{ id, roleId, roleName, authUserName, ... }], ... }, isSuccess: true
      // }
      const users = resp?.data?.users ?? resp?.users ?? resp ?? [];
      const mapped = safeArray<any>(users).map((u) => ({
        authUserId: Number(u.id ?? u.authUserId ?? 0), // use users.id for delegateToUserId
        authUserName: String(u.authUserName ?? u.roleNAme ?? ""), // label: username/email preferred
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

  React.useEffect(() => {
    if (showDelegateModal && authData?.tenantId) {
      fetchRolesForTenant(authData.tenantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDelegateModal]);

  const handleDelegate = async () => {
    try {
      if (!selectedRoleId || !selectedUserId) {
        showToast({ message: "Please select role and user", type: "error" });
        return;
      }
      if (!authData?.authUserId) {
        showToast({ message: "Authentication not found", type: "error" });
        return;
      }
      setIsSubmitting(true);
      const payload: any = {
        submissionId: submission.submissionId,
        approverUserId: authData.authUserId,
        delegateToUserId: Number(selectedUserId),
      };
      if (selected.size > 0) {
        payload.questionIds = Array.from(selected);
      }
      const response: any = await apiService.post(
        `${BASE_API_PATH}delegate_approval_questions`,
        payload,
        BASE_PORT
      );
      if (response?.isSuccess) {
        showToast({ message: "Delegated successfully", type: "success" });
        setShowDelegateModal(false);
        setSelected(new Set());
        onApproved?.();
      } else {
        showToast({
          message: response?.message || "Failed to delegate",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Error delegating:", error);
      showToast({
        message: error?.message || "Error delegating",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allQuestions = useMemo(() => {
    const submittedList = questionnaireData?.submittedQuestions ?? [];
    const otherList = questionnaireData?.otherQuestions ?? [];
    const submittedIds = new Set(submittedList.map((q) => q.questionId));
    const combined = [...submittedList, ...otherList];
    return combined.map((q) => ({
      ...q,
      status: submittedIds.has(q.questionId) ? "Submitted" : "Pending",
    }));
  }, [questionnaireData?.submittedQuestions, questionnaireData?.otherQuestions]);

  const riskOptions = useMemo(() => {
    const unique = Array.from(
      new Set(allQuestions.map((q) => q.riskLevelName))
    );
    return unique.map((r) => ({ label: r, value: r }));
  }, [allQuestions]);

  const typeOptions = useMemo(() => {
    const unique = Array.from(
      new Set(allQuestions.map((q) => q.questionTypeName))
    );
    return unique.map((t) => ({ label: t, value: t }));
  }, [allQuestions]);

  const groupOptions = useMemo(() => {
    const unique = Array.from(
      new Set(allQuestions.map((q) => q.questionnaireGroupName))
    );
    return unique.map((g) => ({ label: g, value: g }));
  }, [allQuestions]);

  const statusOptions = [
    { label: "Submitted", value: "Submitted" },
    { label: "Pending", value: "Pending" },
  ];

  // New API support: buckets -> allocated questions
  const hasBuckets = useMemo(() => {
    return Array.isArray(questionnaireData?.buckets) && questionnaireData.buckets.some((b: any) => Array.isArray(b?.items) && b.items.length > 0);
  }, [questionnaireData?.buckets]);

  const allocatedRows = useMemo(() => {
    const items = (questionnaireData?.buckets ?? []).flatMap((b: any) => b?.items ?? []);
    console.log(items)
    return items.map((it: any) => ({
      questionId: Number(it.questionId),
      questionText: String(it.questionText ?? ""),
      questionTypeName: String(it.questionTypeName ?? ""),
      lastAssignedOn: it.lastAssignedOn ?? "",
      allocatedToUserId: it.allocatedToUserId ?? null,
    }));
  }, [questionnaireData?.buckets]);

  const otherRows = useMemo(() => {
    const list = questionnaireData?.otherQuestions ?? [];
    return list.map((q: any) => ({
      questionId: Number(q.questionId),
      questionText: String(q.questionText ?? ""),
      questionTypeName: String(q.questionTypeName ?? ""),
    }));
  }, [questionnaireData?.otherQuestions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  };

  const toggleAll = (ids: number[], checked: boolean) => {
    setSelected((prev) => {
      const ns = new Set(prev);
      if (checked) ids.forEach((id) => ns.add(id));
      else ids.forEach((id) => ns.delete(id));
      return ns;
    });
  };

  const handleApproveSelected = () => {
    if (selected.size === 0) {
      showToast({
        message: "Please select at least one question",
        type: "warning",
      });
      return;
    }
    // TODO: integrate API for partial approvals if required
    showToast({
      message: `Approved ${selected.size} question(s) successfully`,
      type: "success",
    });
    setSelected(new Set());
  };

  const handleAllocateSelected = () => {
    if (selected.size === 0) {
      showToast({
        message: "Please select at least one question",
        type: "warning",
      });
      return;
    }
    // TODO: integrate API to allocate selected questions
    showToast({
      message: `Allocated ${selected.size} question(s) successfully`,
      type: "success",
    });
    setSelected(new Set());
  };

  const handleSubmitApproval = async () => {
    try {
      setIsSubmitting(true);
      const authData = getAuthData();
      if (!authData) {
        showToast({ message: "Authentication not found", type: "error" });
        return;
      }

      const payload = {
        submissionId: submission.submissionId,
        approverUserId: authData.authUserId,
      };

      const response: any = await apiService.post(
        `${BASE_API_PATH}approve_vendor_questionnaire_submission`,
        payload,
        BASE_PORT
      );

      if (response.isSuccess) {
        showToast({
          message: "Vendor questionnaire submission approved successfully",
          type: "success",
        });
        setShowConfirmModal(false);
        onApproved?.();
      } else {
        showToast({ message: "Failed to approve submission", type: "error" });
      }
    } catch (error) {
      console.error("Error approving submission:", error);
      showToast({ message: "Error approving submission", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build DataTable columns
  const columns = useMemo(() => {
    return [
      // {
      //   key: "_select",
      //   label: "",
      //   render: (item: any) => (
      //     <input
      //       type="checkbox"
      //       className="h-4 w-4 text-emerald-700 rounded border-gray-300"
      //       checked={selected.has(item.questionId)}
      //       onChange={() => toggleOne(item.questionId)}
      //     />
      //   ),
      // },
      {
        key: "questionText",
        label: "Question",
        filterable: true,
        filterType: "text",
        render: (q: any) => (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {q.questionText}
            </p>
            <div className="flex items-center space-x-2 text-xs">
              {q.status === "Submitted" ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-700">Submitted</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-orange-700">Pending</span>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "riskLevelName",
        label: "Risk",
        filterable: true,
        filterType: "select",
        filterOptions: riskOptions,
        render: (q: any) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelBadgeColor(
              q.riskLevelName
            )}`}
          >
            {q.riskLevelName}
          </span>
        ),
      },
      {
        key: "questionTypeName",
        label: "Type",
        filterable: true,
        filterType: "select",
        filterOptions: typeOptions,
      },
      {
        key: "questionnaireGroupName",
        label: "Group",
        filterable: true,
        filterType: "select",
        filterOptions: groupOptions,
      },
      { key: "questionId", label: "ID", sortable: true },
      { key: "displayOrder", label: "Order", sortable: true },
      {
        key: "status",
        label: "Status",
        filterable: true,
        filterType: "select",
        filterOptions: statusOptions,
      },
    ];
  }, [selected, riskOptions, typeOptions, groupOptions]);

  // Allocated/Other columns for new buckets payload
  const allocatedColumns = useMemo(() => {
    return [
      {
        key: "_select",
        label: "",
        render: (item: any) => (
          <input
            type="checkbox"
            className="h-4 w-4 text-emerald-700 rounded border-gray-300"
            checked={selected.has(item.questionId)}
            onChange={() => toggleOne(item.questionId)}
          />
        ),
      },
      { key: "questionId", label: "ID", sortable: true },
      { key: "questionText", label: "Question", filterable: true, filterType: "text" },
      { key: "questionTypeName", label: "Type", filterable: true, filterType: "text" },
      { key: "lastAssignedOn", label: "Last Assigned On" },
      { key: "allocatedToUserId", label: "Allocated To User" },
    ];
  }, [selected]);

  const otherColumns = useMemo(() => {
    return [
      {
        key: "_select",
        label: "",
        render: (item: any) => (
          <input
            type="checkbox"
            className="h-4 w-4 text-emerald-700 rounded border-gray-300"
            checked={selected.has(item.questionId)}
            onChange={() => toggleOne(item.questionId)}
          />
        ),
      },
      { key: "questionId", label: "ID", sortable: true },
      { key: "questionText", label: "Question", filterable: true, filterType: "text" },
      { key: "questionTypeName", label: "Type", filterable: true, filterType: "text" },
    ];
  }, [selected]);

  // Risk-level filter state for the table
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  // Compute risk statistics for the four cards
  const riskStats = useMemo(() => {
    const levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
    const stats: Record<string, { total: number; submitted: number; other: number; allocated: number }> = {};

    const upper = (s?: string) => (s ? s.toUpperCase() : "");

    const submittedList = questionnaireData?.submittedQuestions ?? [];
    const otherList = questionnaireData?.otherQuestions ?? [];

    levels.forEach((lvl) => {
      const total = allQuestions.filter((q) => upper(q.riskLevelName) === lvl).length;
      const submitted = submittedList.filter(
        (q) => upper(q.riskLevelName) === lvl
      ).length;
      const other = otherList.filter(
        (q) => upper(q.riskLevelName) === lvl
      ).length;
      // Consider a question allocated if allocatedToUserId is present (any user)
      const allocated = submittedList.filter(
        (q: any) => upper(q.riskLevelName) === lvl && (q as any).allocatedToUserId
      ).length;

      stats[lvl] = { total, submitted, other, allocated };
    });

    return stats;
  }, [allQuestions, questionnaireData?.submittedQuestions, questionnaireData?.otherQuestions]);

  // Data shown in table respects selected risk filter
  const displayedQuestions = useMemo(() => {
    if (!selectedRisk) return allQuestions;
    const target = selectedRisk.toUpperCase();
    return allQuestions.filter((q) => (q.riskLevelName || "").toUpperCase() === target);
  }, [allQuestions, selectedRisk]);

  // Add-questions modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocatedModal, setShowAllocatedModal] = useState(false); // new modal for allocated
  const [addRisk, setAddRisk] = useState<string | null>(null);
  const [addSelection, setAddSelection] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const otherQuestionsByRisk = useMemo(() => {
    if (addRisk === "ALL") {
      return questionnaireData.otherQuestions ?? [];
    }
    const target = (addRisk || "").toUpperCase();
    return (questionnaireData.otherQuestions ?? []).filter(
      (q) => (q.riskLevelName || "").toUpperCase() === target
    );
  }, [questionnaireData.otherQuestions, addRisk]);

  const openAddModal = (risk: string) => {
    setAddRisk(risk);
    setAddSelection(new Set());
    setShowAddModal(true);
  };

  const toggleAddSelect = (id: number) => {
    setAddSelection((prev) => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  };

  const handleAddQuestions = async () => {
    try {
      if (!addRisk || addSelection.size === 0) {
        showToast({ message: "Select questions to add", type: "warning" });
        return;
      }
      setIsAdding(true);
      const payload = {
        submissionId: submission.submissionId,
        questionIds: Array.from(addSelection),
      };
      // NOTE: Adjust endpoint name if your backend differs.
      const response: any = await apiService.post(
        `${BASE_API_PATH}add_additional_questions_to_submission`,
        payload,
        BASE_PORT
      );
      if (response?.isSuccess) {
        showToast({ message: "Questions added successfully", type: "success" });
        setShowAddModal(false);
        setAddRisk(null);
        setAddSelection(new Set());
        // Optionally: trigger a refresh from parent if provided
        // onApproved?.();
      } else {
        showToast({ message: response?.message || "Failed to add questions", type: "error" });
      }
    } catch (e: any) {
      showToast({ message: e?.message || "Error adding questions", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const filteredIdsRef = React.useRef<number[]>([]);

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to List</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {submission.vendorName}
            </h1>
            <p className="text-gray-600">
              Submitted by {submission.submittedBy} on{" "}
              {formatDate(submission.submissionDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border`}>
            {submission?.riskLevelName}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Allocated Card */}
        <div
          className="cursor-pointer rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-lg p-6 hover:shadow-xl transition-all"
          onClick={() => setShowAllocatedModal(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 17l-4 4m0 0l-4-4m4 4V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-base font-semibold text-gray-900">Allocated</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white font-bold shadow">{allocatedRows.length}</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">Questions allocated to users.</p>
          <div className="flex items-center gap-2 mt-2 text-indigo-700 font-medium text-xs">
            <span className="inline-block bg-indigo-100 px-2 py-0.5 rounded">View Details</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Other Questions Card */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-base font-semibold text-gray-900">Other Questions</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-600 text-white font-bold shadow">{otherRows.length}</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">Questions not yet allocated.</p>
          <button
            className="mt-3 w-full text-center rounded-lg bg-[#01443B] text-white py-2 text-sm font-semibold shadow hover:bg-[#01443B]/90 transition"
            onClick={() => openAddModal("ALL")}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add Questions
            </span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {!hasBuckets ? (
            <span>
              Total Questions: {allQuestions.length} | Submitted:{" "}
              {(questionnaireData?.submittedQuestions?.length ?? 0)} | Other:{" "}
              {(questionnaireData?.otherQuestions?.length ?? 0)}
            </span>
          ) : (
            <span>
              Allocated: {allocatedRows.length} | Other: {otherRows.length} | Total: {allocatedRows.length + otherRows.length}
            </span>
          )}
          {!hasBuckets && selectedRisk && (
            <button
              onClick={() => setSelectedRisk(null)}
              className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 border"
            >
              Clear risk filter: {selectedRisk}
            </button>
          )}
          <div className="flex items-center space-x-2">
            <input
              id="selectAll"
              type="checkbox"
              className="h-4 w-4 text-emerald-700 rounded border-gray-300"
              onChange={(e) =>
                toggleAll(filteredIdsRef.current, e.target.checked)
              }
            />
            <label htmlFor="selectAll" className="text-gray-700">
              Select visible
            </label>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {sourceBucket === "approvalPending" && (
            <button
              onClick={() => setShowDelegateModal(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Delegate to User</span>
            </button>
          )}
          {sourceBucket === "approvalDelegated" && (
            <button
              onClick={handleSubmitApproval}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? "Submitting…" : "Submit to Vendor"}</span>
            </button>
          )}
          {sourceBucket === "approvalPending" && (
            <button
              onClick={handleSubmitApproval}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? "Submitting…" : "Submit to Vendor"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
            Questions ({displayedQuestions?.length})
          </h2>
          <p className="text-gray-600 mt-1">
            {selectedRisk ? `Filtered by ${selectedRisk} risk` : "Review all questions for this vendor submission"}
          </p>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={displayedQuestions}
            itemsPerPage={10}
            emptyMessage="No questions found"
            onVisibleRowsChange={(rows: any[]) => {
              filteredIdsRef.current = rows.map((r: any) => r.questionId);
            }}
          />
        </div>
      </div>

      {/* Add Questions Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Questions {addRisk && addRisk !== 'ALL' ? `- ${addRisk}` : ''}
              </h3>
              <div className="max-h-80 overflow-auto divide-y">
                {otherQuestionsByRisk.length === 0 ? (
                  <div className="text-sm text-gray-600">No other questions available.</div>
                ) : (
                  otherQuestionsByRisk.map((q) => (
                    <label key={q.questionId} className="flex items-start gap-3 py-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={addSelection.has(q.questionId)}
                        onChange={() => toggleAddSelect(q.questionId)}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{q.questionText}</div>
                        <div className="text-xs text-gray-600">Group: {q.questionnaireGroupName} • Type: {q.questionTypeName}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  // onClick={handleAddQuestions}
                  onClick={(prev) => setShowAddModal(!prev)}
                  disabled={isAdding || addSelection.size === 0}
                  className="inline-flex items-center rounded-lg bg-[#01443B] px-5 py-2 font-medium text-white hover:bg-[#01443B]/90 disabled:opacity-50"
                >
                  {isAdding ? "Adding…" : `Add Selected (${addSelection.size})`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Allocated Questions Modal */}
      <AnimatePresence>
        {showAllocatedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAllocatedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocated Questions</h3>
              <div className="max-h-80 overflow-auto divide-y">
                {allocatedRows.length === 0 ? (
                  <div className="text-sm text-gray-600">No allocated questions.</div>
                ) : (
                  allocatedRows.map((q: any) => (
                    <div key={q.questionId} className="py-3">
                      <div className="text-sm font-medium text-gray-900">{q.questionText}</div>
                      <div className="text-xs text-gray-600">Type: {q.questionTypeName} • Assigned: {q.lastAssignedOn || '-'}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAllocatedModal(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      authData?.tenantName || String(authData?.tenantId || "")
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
                      if (val && authData?.tenantId) {
                        await fetchUsersByTenantAndRole(authData.tenantId, val);
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
                  disabled={isSubmitting || !selectedRoleId || !selectedUserId}
                  className="inline-flex items-center rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Delegating…"
                    : selected.size > 0
                      ? `Delegate Selected (${selected.size})`
                      : "Delegate All"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#01443B]/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-[#01443B]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Submission Approval
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to approve this vendor questionnaire
                submission for <strong>{submission.vendorName}</strong>? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApproval}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#01443B] text-white rounded-lg hover:bg-[#01443B]/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Yes, Approve</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApproverSubmissionDetails;
