import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '@/services/api/apiservice';

const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tyme/tracs/v1/';
const BASE_PORT = import.meta.env.VITE_BASE_PORT || '8082';

// Types for the API response
export interface PlatformSummary {
    clientCount: number;
    vendorCount: number;
    licenseCount: number;
    storageUsage: string;
}

export interface TopClient {
    clientId: number;
    userCount: number;
    vendorCount: number;
    organizationName: string;
}

export interface EngagementTrend {
    month: string;
    logins: number;
    activeUsers: number;
    assessments: number;
}

export interface StatusDistribution {
    clientCount: number;
    clientStatusId: number;
    clientStatusName: string;
}

export interface IndustryDistribution {
    clientCount: number;
    industrySectorId: number;
    industrySectorName: string;
}

export interface BusinessSizeDistribution {
    clientCount: number;
    clientBusinessSizeId: number;
    clientBusinessSizeName: string;
}

export interface SubscriptionTierDistribution {
    clientCount: number;
    subscriptionTierId: number;
    subscriptionTierName: string;
}

export interface PlatformDashboardData {
    summary: PlatformSummary;
    topClients: TopClient[];
    engagementTrends: EngagementTrend[];
    statusDistribution: StatusDistribution[];
    industryDistribution: IndustryDistribution[];
    businessSizeDistribution: BusinessSizeDistribution[];
    subscriptionTierDistribution: SubscriptionTierDistribution[];
}

export interface PlatformDashboardState {
    data: PlatformDashboardData | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    selectedTimeframe: string;
    selectedRegion: string | null;
    refreshInterval: number; // in milliseconds
}

const initialState: PlatformDashboardState = {
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    selectedTimeframe: 'monthly',
    selectedRegion: null,
    refreshInterval: 300000, // 5 minutes default
};

// Async thunk for fetching platform dashboard data
export const fetchPlatformDashboardData = createAsyncThunk(
    'platformDashboard/fetchPlatformDashboardData',
    async (params: {
        timeframe?: string;
        region?: string;
        forceRefresh?: boolean;
    } = {}, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { platformDashboard: PlatformDashboardState };
            const { lastUpdated, refreshInterval } = state.platformDashboard;
            
            // Check if we need to refresh based on interval (unless forced)
            if (!params.forceRefresh && lastUpdated) {
                const timeSinceLastUpdate = Date.now() - new Date(lastUpdated).getTime();
                if (timeSinceLastUpdate < refreshInterval) {
                    // Return existing data if within refresh interval
                    return state.platformDashboard.data;
                }
            }

            const url = `${BASE_API_PATH}get_platform_dashboard_data`;
            console.log('Fetching platform dashboard data from:', url);

            const response: any = await apiService.get(url, {
                timeframe: params.timeframe,
                region: params.region,
            }, BASE_PORT);

            console.log('Platform dashboard response:', response);

            if (!response.isSuccess) {
                throw new Error(response.message || 'Failed to fetch platform dashboard data');
            }

            return response.data;
        } catch (error: any) {
            console.error('Error fetching platform dashboard data:', error);
            return rejectWithValue(error.message || 'Failed to fetch platform dashboard data');
        }
    }
);

// Async thunk for refreshing data periodically
export const refreshPlatformDashboard = createAsyncThunk(
    'platformDashboard/refreshPlatformDashboard',
    async (_, { dispatch, getState }) => {
        const state = getState() as { platformDashboard: PlatformDashboardState };
        const { selectedTimeframe, selectedRegion } = state.platformDashboard;
        
        return dispatch(fetchPlatformDashboardData({
            timeframe: selectedTimeframe,
            region: selectedRegion,
            forceRefresh: true,
        }));
    }
);

const platformDashboardSlice = createSlice({
    name: 'platformDashboard',
    initialState,
    reducers: {
        setSelectedTimeframe: (state, action) => {
            state.selectedTimeframe = action.payload;
        },
        setSelectedRegion: (state, action) => {
            state.selectedRegion = action.payload;
        },
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
        // Manual data update for real-time updates
        updateDashboardData: (state, action) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload };
                state.lastUpdated = new Date().toISOString();
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch platform dashboard data
            .addCase(fetchPlatformDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlatformDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.lastUpdated = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchPlatformDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Refresh platform dashboard
            .addCase(refreshPlatformDashboard.pending, (state) => {
                // Don't set loading to true for refresh to avoid UI flickering
                state.error = null;
            })
            .addCase(refreshPlatformDashboard.fulfilled, (state) => {
                // Handled by fetchPlatformDashboardData.fulfilled
            })
            .addCase(refreshPlatformDashboard.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const {
    setSelectedTimeframe,
    setSelectedRegion,
    setRefreshInterval,
    clearError,
    resetDashboard,
    updateDashboardData,
} = platformDashboardSlice.actions;

// Selectors
export const selectPlatformDashboardData = (state: { platformDashboard: PlatformDashboardState }) => 
    state.platformDashboard.data;

export const selectPlatformDashboardLoading = (state: { platformDashboard: PlatformDashboardState }) => 
    state.platformDashboard.loading;

export const selectPlatformDashboardError = (state: { platformDashboard: PlatformDashboardState }) => 
    state.platformDashboard.error;

export const selectPlatformDashboardLastUpdated = (state: { platformDashboard: PlatformDashboardState }) => 
    state.platformDashboard.lastUpdated;

export const selectSelectedTimeframe = (state: { platformDashboard: PlatformDashboardState }) => 
    state.platformDashboard.selectedTimeframe;

export const selectSelectedRegion = (state: { platformDashboard: PlatformDashboardState }) => 
    state.platformDashboard.selectedRegion;

// Utility selectors for chart data
export const selectChartData = (state: { platformDashboard: PlatformDashboardState }) => {
    const data = state.platformDashboard.data;
    if (!data) return null;

    return {
        statusDistribution: {
            labels: data.statusDistribution.map(item => item.clientStatusName),
            data: data.statusDistribution.map(item => item.clientCount),
        },
        industryDistribution: {
            labels: data.industryDistribution.map(item => item.industrySectorName),
            data: data.industryDistribution.map(item => item.clientCount),
        },
        businessSizeDistribution: {
            labels: data.businessSizeDistribution.map(item => item.clientBusinessSizeName),
            data: data.businessSizeDistribution.map(item => item.clientCount),
        },
        subscriptionTierDistribution: {
            labels: data.subscriptionTierDistribution.map(item => item.subscriptionTierName),
            data: data.subscriptionTierDistribution.map(item => item.clientCount),
        },
        engagementTrends: {
            labels: data.engagementTrends.map(item => {
                const date = new Date(item.month);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            logins: data.engagementTrends.map(item => item.logins),
            activeUsers: data.engagementTrends.map(item => item.activeUsers),
            assessments: data.engagementTrends.map(item => item.assessments),
        },
    };
};

export default platformDashboardSlice.reducer;