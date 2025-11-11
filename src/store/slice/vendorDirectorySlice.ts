import { apiService } from '@/services/api/apiservice';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthData } from '@/utils/auth';

const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tyme/tracs/v1/';
const BASE_PORT = import.meta.env.VITE_BASE_PORT || '8082';

export interface VendorDirectoryItem {
    id: string;
    thirdPartyVendorId: number;
    legalName: string;
    spocEmail: string;
    countryNames: string;
    spocContactName: string;
    natureOfThirdParty: string;
    // Legacy fields for backward compatibility
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    country?: string;
    city?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    status?: 'active' | 'pending' | 'inactive';
    lastAssessment?: string;
    nextReview?: string;
    services?: string[];
    score?: number;
    description?: string;
    rating?: number;
    yearsOfService?: number;
    organizationName?: string;
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactNumber?: string;
    industrySector?: string;
    registrationNumber?: string;
    briefAboutCompany?: string;
    vendorId?: number;
    tenantId?: number;
    clientId?: number;
}

export interface VendorDirectoryState {
    vendors: VendorDirectoryItem[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalVendors: number;
    searchTerm: string;
    filterRisk: string;
    filterCountry: string;
    filterStatus: string;
    sortBy: string;
}

const initialState: VendorDirectoryState = {
    vendors: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalVendors: 0,
    searchTerm: '',
    filterRisk: 'all',
    filterCountry: 'all',
    filterStatus: 'all',
    sortBy: 'name',
};

// Async thunk for fetching vendor directory
export const fetchVendorDirectory = createAsyncThunk(
    'vendorDirectory/fetchVendorDirectory',
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
            const auth = getAuthData();
            const clientId = auth?.clientId;

            if (!clientId) {
                throw new Error('Client ID not found in authentication data');
            }

            const url = `${BASE_API_PATH}get_third_party_vendor_directory`;
            const response: any = await apiService.get(url, { id: clientId }, BASE_PORT);

            // Transform the response data to match our interface
            const transformedData = response.data.map((vendor: any, index: number) => ({
                id: vendor.thirdPartyVendorId?.toString() || index.toString(),
                thirdPartyVendorId: vendor.thirdPartyVendorId,
                legalName: vendor.legalName,
                spocEmail: vendor.spocEmail,
                countryNames: vendor.countryNames,
                spocContactName: vendor.spocContactName,
                natureOfThirdParty: vendor.natureOfThirdParty,
                // Map to legacy fields for compatibility
                name: vendor.legalName,
                organizationName: vendor.legalName,
                email: vendor.spocEmail,
                primaryContactEmail: vendor.spocEmail,
                primaryContactName: vendor.spocContactName,
                country: vendor.countryNames,
                riskLevel: 'medium', // Default value
                status: 'active', // Default value
                rating: 4.0, // Default value
                score: 75, // Default value
                services: [vendor.natureOfThirdParty],
                description: `Third party vendor of type: ${vendor.natureOfThirdParty}`,
                briefAboutCompany: `Third party vendor of type: ${vendor.natureOfThirdParty}`
            }));

            return transformedData;
        } catch (error: any) {
            console.error('Error fetching vendor directory:', error);
            return rejectWithValue(error.message || 'Failed to fetch vendor directory');
        }
    }
);

// Async thunk for fetching individual vendor details
export const fetchVendorDetails = createAsyncThunk(
    'vendorDirectory/fetchVendorDetails',
    async (thirdPartyVendorId: number, { rejectWithValue }) => {
        try {
            const url = `${BASE_API_PATH}get_third_party_vendor`;
            console.log('Fetching vendor details from:', url, 'with thirdPartyVendorId:', thirdPartyVendorId);

            const response: any = await apiService.get(url, { id: thirdPartyVendorId }, BASE_PORT);

            console.log('Vendor details response:', response);

            return response.data;
        } catch (error: any) {
            console.error('Error fetching vendor details:', error);
            return rejectWithValue(error.message || 'Failed to fetch vendor details');
        }
    }
);

const vendorDirectorySlice = createSlice({
    name: 'vendorDirectory',
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
            state.sortBy = 'name';
            state.currentPage = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch vendor directory
            .addCase(fetchVendorDirectory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorDirectory.fulfilled, (state, action) => {
                state.loading = false;
                state.vendors = action.payload;
                state.totalVendors = action.payload.length;
                state.totalPages = Math.ceil(action.payload.length / 20);
                state.currentPage = 1;
            })
            .addCase(fetchVendorDirectory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch vendor details
            .addCase(fetchVendorDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorDetails.fulfilled, (state, action) => {
                state.loading = false;
                // You can store the vendor details in a separate field if needed
                // state.selectedVendor = action.payload;
            })
            .addCase(fetchVendorDetails.rejected, (state, action) => {
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
} = vendorDirectorySlice.actions;

export default vendorDirectorySlice.reducer;