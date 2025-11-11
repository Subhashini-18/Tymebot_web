// src/store/slice/approverSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

// Buckets coming from get_pending_submissions
export type BucketKey =
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

export interface ApprovalSubmissionItem {
  thirdPartyVendorId: number;
  currentStageCode?: string;
  currentStatusCode?: string;
}

export type ApproverBuckets = Partial<
  Record<
    BucketKey,
    ApprovalSubmissionItem[] | ApprovalSubmissionItem[][]
  >
>;

// Buckets considered as “pending” for VendorDirectory badge override
export const PENDING_BUCKETS: BucketKey[] = [
  "reviewPending",
  "approvalPending",
  "clientResponsePending",
  "clientResponseAnswered",
];

interface ApproverState {
  // Map: vendorId -> { bucket, stageCode, statusCode }
  vendorWorkflowById: Record<
    number,
    { bucket: BucketKey; stageCode?: string; statusCode?: string }
  >;
}

const initialState: ApproverState = {
  vendorWorkflowById: {},
};

// Flattens possibly nested arrays under some buckets and extracts vendor workflow mapping
function extractVendorWorkflowMap(
  buckets: ApproverBuckets
): ApproverState["vendorWorkflowById"] {
  const map: ApproverState["vendorWorkflowById"] = {};

  const entries = Object.entries(buckets) as [BucketKey, any][];
  for (const [bucket, list] of entries) {
    if (!list) continue;
    // Some buckets come as [] or [ [ ...items ] ]
    const items: ApprovalSubmissionItem[] = Array.isArray(list[0])
      ? list.flat()
      : list;
    for (const it of items) {
      if (!it || typeof it.thirdPartyVendorId !== "number") continue;
      map[it.thirdPartyVendorId] = {
        bucket,
        stageCode: it.currentStageCode,
        statusCode: it.currentStatusCode,
      };
    }
  }

  return map;
}

const approverSlice = createSlice({
  name: "approver",
  initialState,
  reducers: {
    setBuckets(state, action: PayloadAction<ApproverBuckets>) {
      state.vendorWorkflowById = extractVendorWorkflowMap(action.payload);
    },
    clearApproverState(state) {
      state.vendorWorkflowById = {};
    },
  },
});

export const { setBuckets, clearApproverState } = approverSlice.actions;

// Selectors
export const selectVendorWorkflowById = (state: RootState) =>
  state.approver?.vendorWorkflowById ?? {};

export const selectPendingVendorIdSet = (state: RootState) => {
  const map = selectVendorWorkflowById(state);
  const pending = new Set<number>();
  Object.entries(map).forEach(([id, info]) => {
    if (info && PENDING_BUCKETS.includes(info.bucket))
      pending.add(Number(id));
  });
  return pending;
};

export default approverSlice.reducer;
