import { apiService } from '@/services/api/apiservice';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { apiService } from '../../services/apiService';

const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tracs/tracs/v1/';
const BASE_PORT = import.meta.env.VITE_BASE_PORT || '8082'; // Default port if not set in env

export interface ClientDirectoryItem {
    clientOrgInfoId: number;
    organizationName: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactNumber: string;
    city: string;
    countryName: string;
    targetGoLiveDate: string;
    website: string;
    industrySector: string;
    riskLevel: 'low' | 'medium' | 'high';
    status: 'active' | 'pending' | 'inactive';
    lastAssessment: string;
    nextReview: string;
    services: string[];
    score: number;
    description: string;
    rating: number;
    yearsOfService: number;
    briefAboutCompany: string;
    registrationNumber: string;
    primaryRegistration: string;
    industrySectorName: string;
}

export interface ClientDirectoryState {
    clients: ClientDirectoryItem[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalClients: number;
    searchTerm: string;
    filterRisk: string;
    filterCountry: string;
    filterStatus: string;
    sortBy: string;
}

const initialState: ClientDirectoryState = {
    clients: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalClients: 0,
    searchTerm: '',
    filterRisk: 'all',
    filterCountry: 'all',
    filterStatus: 'all',
    sortBy: 'organizationName',
};

// Async thunk for fetching client directory
export const fetchClientDirectory = createAsyncThunk(
    'clientDirectory/fetchClientDirectory',
    async (params: {
        page?: number;
        limit?: number;
        search?: string;
        riskLevel?: string;
        country?: string;
        status?: string;
        sortBy?: string;
    }, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            const url = `${BASE_API_PATH}get_client_onboarded_directory`;

            const response: any = await apiService.get(url, {}, BASE_PORT);

            return response.data;
        } catch (error: any) {
            console.error('Error fetching client directory:', error);
            return rejectWithValue(error.message || 'Failed to fetch client directory');
        }
    }
);

// Async thunk for fetching client details
export const fetchClientDetails = createAsyncThunk(
    'clientDirectory/fetchClientDetails',
    async (clientId: number, { rejectWithValue }) => {
        try {
            const url = `${BASE_API_PATH}get_client_onboarding?id=${clientId}`;
            console.log('Fetching client details from:', url);

            const response: any = await apiService.get(url, {}, BASE_PORT);

            console.log('Client details response:', response);

            return response.data;
        } catch (error: any) {
            console.error('Error fetching client details:', error);
            return rejectWithValue(error.message || 'Failed to fetch client details');
        }
    }
);

const clientDirectorySlice = createSlice({
    name: 'clientDirectory',
    initialState,
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        setFilterRisk: (state, action) => {
            state.filterRisk = action.payload;
        },
        setFilterCountry: (state, action) => {
            state.filterCountry = action.payload;
        },
        setFilterStatus: (state, action) => {
            state.filterStatus = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetFilters: (state) => {
            state.searchTerm = '';
            state.filterRisk = 'all';
            state.filterCountry = 'all';
            state.filterStatus = 'all';
            state.sortBy = 'organizationName';
            state.currentPage = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch client directory
            .addCase(fetchClientDirectory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientDirectory.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload.clients || action.payload.data || action.payload;
                state.totalClients = action.payload.total || action.payload.clients?.length || 0;
                state.totalPages = action.payload.totalPages || Math.ceil(state.totalClients / 10);
                state.currentPage = action.payload.currentPage || 1;
            })
            .addCase(fetchClientDirectory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch client details
            .addCase(fetchClientDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientDetails.fulfilled, (state, action) => {
                state.loading = false;
                // You can store the client details in a separate field if needed
                // state.selectedClient = action.payload;
            })
            .addCase(fetchClientDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSearchTerm,
    setFilterRisk,
    setFilterCountry,
    setFilterStatus,
    setSortBy,
    setCurrentPage,
    clearError,
    resetFilters,
} = clientDirectorySlice.actions;

export default clientDirectorySlice.reducer;