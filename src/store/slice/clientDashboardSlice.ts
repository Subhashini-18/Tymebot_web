import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api/apiservice';
import { getAuthData } from '@/utils/auth';

const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tyme/tracs/v1/';
const BASE_PORT = import.meta.env.VITE_BASE_PORT || '8082';

// API response types
export interface CountryDistributionItem {
    count: number;
    countryId: number;
    countryName: string;
}

export interface ClientOverviewSummary {
    vendorCount: number;
    licenseCount: number;
    storageUsage: string;
    lowRiskVendors: number;
    highRiskVendors: number;
    totalAssessments: number;
    mediumRiskVendors: number;
    countryDistribution: CountryDistributionItem[];
}

export interface RifProgress {
    approved: number;
    rejected: number;
    awaitingQ: number;
    initiated: number;
    underReview: number;
}

export interface AssessmentStatus {
    closed: number;
    reviewed: number;
    submitted: number;
    inProgress: number;
    notStarted: number;
}

export interface RiskTierDistribution {
    low: number;
    high: number;
    medium: number;
    critical: number;
}

export interface ClientDashboardPayload {
    status: string; // e.g., "success"
    summary: ClientOverviewSummary;
    dashboard: {
        rifProgress: RifProgress;
        assessmentStatus: AssessmentStatus;
        riskTierDistribution: RiskTierDistribution;
    };
    clientOrgInfoId: number;
}

export interface ClientDashboardState {
    data: ClientDashboardPayload | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    refreshInterval: number;
}

const initialState: ClientDashboardState = {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    refreshInterval: 300000, // 5 min
};

export const fetchClientDashboardData = createAsyncThunk(
    'clientDashboard/fetchClientDashboardData',
    async (params: { clientId?: number } = {}, { rejectWithValue, getState }) => {
        try {
            // Prefer passed id, otherwise from auth
            const auth = getAuthData();
            const clientId = params.clientId ?? auth?.clientId;
            if (!clientId) {
                throw new Error('Missing clientId');
            }

            const url = `${BASE_API_PATH}get_client_overview`;
            const response: any = await apiService.get(url, { id: clientId }, Number(BASE_PORT));
            // response is expected: { data: <payload>, isSuccess: boolean, status: number }
            if (!response?.isSuccess) {
                throw new Error(response?.message || 'Failed to fetch client dashboard');
            }
            return response.data as ClientDashboardPayload;
        } catch (error: any) {
            console.error('Error fetching client dashboard:', error);
            return rejectWithValue(error.message || 'Failed to fetch client dashboard');
        }
    }
);

export const refreshClientDashboard = createAsyncThunk(
    'clientDashboard/refreshClientDashboard',
    async (params: { clientId?: number } = {}, { dispatch, getState }) => {
        // Use dispatch to call fetchClientDashboardData with force refresh semantics if needed
        return dispatch(fetchClientDashboardData(params));
    }
);

const clientDashboardSlice = createSlice({
    name: 'clientDashboard',
    initialState,
    reducers: {
        setRefreshInterval: (state, action) => {
            state.refreshInterval = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetDashboard: (state) => {
            state.data = null;
            state.error = null;
            state.lastUpdated = null;
        },
        updateDashboardData: (state, action) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClientDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload as ClientDashboardPayload;
                state.error = null;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchClientDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(refreshClientDashboard.pending, (state) => {
                // do not toggle loading to avoid flicker
            })
            .addCase(refreshClientDashboard.fulfilled, () => { })
            .addCase(refreshClientDashboard.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { setRefreshInterval, clearError, resetDashboard, updateDashboardData } = clientDashboardSlice.actions;

// Selectors
export const selectClientDashboardData = (state: { clientDashboard: ClientDashboardState }) => state.clientDashboard.data;
export const selectClientDashboardLoading = (state: { clientDashboard: ClientDashboardState }) => state.clientDashboard.loading;
export const selectClientDashboardError = (state: { clientDashboard: ClientDashboardState }) => state.clientDashboard.error;
export const selectClientDashboardLastUpdated = (state: { clientDashboard: ClientDashboardState }) => state.clientDashboard.lastUpdated;
export const selectClientRefreshInterval = (state: { clientDashboard: ClientDashboardState }) => state.clientDashboard.refreshInterval;

// Utility selector to transform API payload into chart-friendly structures expected by the component
export const selectClientCharts = (state: { clientDashboard: ClientDashboardState }) => {
    const payload = state.clientDashboard.data;
    if (!payload) return null;

    const { dashboard, summary } = payload;

    // Assessment by status (bar)
    const assessmentByStatus = {
        labels: ['Not Started', 'In Progress', 'Submitted', 'Reviewed', 'Closed'],
        data: [
            dashboard.assessmentStatus.notStarted,
            dashboard.assessmentStatus.inProgress,
            dashboard.assessmentStatus.submitted,
            dashboard.assessmentStatus.reviewed,
            dashboard.assessmentStatus.closed,
        ],
    };

    // Risk tier (doughnut)
    const riskTier = {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        data: [
            dashboard.riskTierDistribution.low,
            dashboard.riskTierDistribution.medium,
            dashboard.riskTierDistribution.high,
            dashboard.riskTierDistribution.critical,
        ],
    };

    // RIF progress (doughnut)
    const rifProgress = {
        labels: ['Initiated', 'Under Review', 'Approved', 'Rejected', 'Awaiting Q'],
        data: [
            dashboard.rifProgress.initiated,
            dashboard.rifProgress.underReview,
            dashboard.rifProgress.approved,
            dashboard.rifProgress.rejected,
            dashboard.rifProgress.awaitingQ,
        ],
    };

    // Global vendor distribution by country
    const countryDistribution = {
        labels: summary.countryDistribution.map(c => c.countryName),
        data: summary.countryDistribution.map(c => c.count),
    };

    return {
        assessmentByStatus,
        riskTier,
        rifProgress,
        countryDistribution,
    };
};

export default clientDashboardSlice.reducer;