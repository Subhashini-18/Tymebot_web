import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api/apiservice';
import { getAuthData } from '@/utils/auth';

// Types for master data
interface MasterDataItem {
  id: number;
  name: string;
  label?: string;
  value?: string;
  isActive?: boolean;
}

interface MasterData {
  industrySectors: MasterDataItem[];
  geographiesOfOperation: MasterDataItem[];
  orgCertifications: MasterDataItem[];
  regulatoryFrameworks: MasterDataItem[];
  countries: MasterDataItem[];
  currencies: MasterDataItem[];
  vendorVolumes: MasterDataItem[];
  desiredModules: MasterDataItem[];
  operationalRegions: MasterDataItem[];
  integrationExpectations: MasterDataItem[];
}

interface ClientOnboardingData {
  id?: number;
  organizationName: string;
  industrySectorId: number;
  briefAboutCompany: string;
  yearOfIncorporation: string;
  registrationNumber: string;
  primaryRegistration: string;
  logoUrl?: string;
  website: string;
  clientStatusId: number;
  clientBusinessSizeId: number;
  clientSubscriptionTierId: number;
  geographiesOfOperation: { geographyOfOperationId: number }[];
  orgCertifications: {
    orgCertificationId: number;
    certificationNumber?: string;
    issueDate?: string;
    expiryDate?: string;
  }[];
  regulatoryFrameworks: { regulatoryFrameworkId: number }[];
  address: {
    streetAddress1: string;
    streetAddress2?: string;
    city: string;
    stateProvince: string;
    zipPostalCode: string;
    countryId: number;
    gstVatNumber?: string;
  };
  primaryContact: {
    primaryContactName: string;
    designation: string;
    emailAddress: string;
    contactNumber: string;
    alternateContact?: string;
  };
  commercialDetails: {
    panEinTaxId?: string;
    currencyId: number;
    billingEmail: string;
    numberOfUsers: number;
    vendorVolumeId: number;
    desiredModules: { desiredModuleId: number }[];
    operationalRegions: { operationalRegionId: number }[];
  };
  systemAccess: {
    isIso27001Certified: boolean;
    targetGoLiveDate: string;
    ndaContractStatusFile?: string;
    termsAccepted: boolean;
    clientLogoFile?: string;
    adminEmails: { adminEmail: string }[];
    integrationExpectations?: { integrationExpectationId: number }[];
  };
}

interface ClientOnboardingState {
  masterData: MasterData;
  currentClient: ClientOnboardingData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitSuccess: boolean;
  masterDataLoaded: boolean;
}

const initialState: ClientOnboardingState = {
  masterData: {
    industrySectors: [],
    geographiesOfOperation: [],
    orgCertifications: [],
    regulatoryFrameworks: [],
    countries: [],
    currencies: [],
    vendorVolumes: [],
    desiredModules: [],
    operationalRegions: [],
    integrationExpectations: [],
  },
  currentClient: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  submitSuccess: false,
  masterDataLoaded: false,
};
const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tyme/tracs/v1/';
const BASE_PORT = import.meta.env.VITE_BASE_PORT || '8000';

// Async thunks for API calls
export const fetchMasterData = createAsyncThunk(
  'clientOnboarding/fetchMasterData',
  async (_, { rejectWithValue }) => {
    try {
      const endpoints = [
        'get_all_industry_sector',
        'get_all_geography_of_operation',
        'get_all_org_certification',
        'get_all_regulatory_framework',
        'get_all_country',
        'get_all_currency',
        'get_all_vendor_volume',
        'get_all_desired_module',
        'get_all_operational_region',
        'get_all_integration_expectation',
      ];

      const promises = endpoints.map(endpoint =>
        apiService.get(`${BASE_API_PATH}${endpoint}`, {}, BASE_PORT)
      );

      const results: any = await Promise.all(promises);
      console.log(results)
      return {
        industrySectors: results[0]?.data || [],
        geographiesOfOperation: results[1]?.data || [],
        orgCertifications: results[2]?.data || [],
        regulatoryFrameworks: results[3]?.data || [],
        countries: results[4]?.data || [],
        currencies: results[5]?.data || [],
        vendorVolumes: results[6]?.data || [],
        desiredModules: results[7]?.data || [],
        operationalRegions: results[8]?.data || [],
        integrationExpectations: results[9]?.data || [],
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch master data');
    }
  }
);

export const submitClientOnboarding = createAsyncThunk(
  'clientOnboarding/submitClientOnboarding',
  async (formData: any, { getState, rejectWithValue }) => {
    try {
      console.log('Redux submitClientOnboarding received formData:', formData);

      const state = getState() as any;
      const masterData = state.clientOnboarding.masterData;

      console.log('Master data for transformation:', masterData);

      const transformedData = transformFormDataToAPI(formData, masterData);

      console.log('Transformed data for API:', transformedData);

      // Append client self-onboarding fields when clientId is present (client flow only)
      const auth = getAuthData?.() as any;
      const clientId = auth?.clientId;

      // Add platformDashboard: true if not client/self-onboarding
      let payload;
      if (clientId) {
        payload = { ...transformedData, id: clientId, selfOnbaordUpdate: true };
      } else {
        payload = { ...transformedData, platformOnboard: true };
      }

      const response: any = await apiService.post(`${BASE_API_PATH}onboard_client`, payload as any, BASE_PORT);
      return response.data;
    } catch (error: any) {
      console.error('Error in submitClientOnboarding:', error);
      return rejectWithValue(error.message || 'Failed to submit client onboarding');
    }
  }
);

export const fetchClientOnboarding = createAsyncThunk(
  'clientOnboarding/fetchClientOnboarding',
  async (clientId: number, { rejectWithValue }) => {
    try {
      const response: any = await apiService.get(`${BASE_API_PATH}get_client_onboarding?id=${clientId}`, {}, BASE_PORT);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch client onboarding data');
    }
  }
);

// Helper function to transform form data to API format
const transformFormDataToAPI = (formData: any, masterData: MasterData): ClientOnboardingData => {
  console.log('transformFormDataToAPI input formData:', formData);
  console.log('transformFormDataToAPI input masterData:', masterData);

  const {
    organizationDetails,
    regulatoryPCI,
    addressLocation,
    commercialDetails,
    systemAccessRolesOthers,
  } = formData;

  console.log('Destructured form sections:', {
    organizationDetails,
    regulatoryPCI,
    addressLocation,
    commercialDetails,
    systemAccessRolesOthers,
  });

  // Helper function to find ID by name
  const findIdByName = (name: string | undefined, dataArray: any[], nameField: string): number => {
    if (!name || typeof name !== 'string') return 0;
    const item = dataArray.find(item =>
      typeof item[nameField] === 'string' &&
      item[nameField].toLowerCase().trim() === name.toLowerCase().trim()
    );
    return item?.id || 0;
  };

  // Helper function to find IDs by array of names
  const findIdsByNames = (names: string[] | undefined, dataArray: any[], nameField: string) => {
    if (!names || !Array.isArray(names)) return [];
    return names
      .filter(name => typeof name === 'string')
      .map(name => findIdByName(name, dataArray, nameField))
      .filter(id => id > 0);
  };

  // Helper function to convert string ID to number
  const convertToId = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const id = parseInt(value.trim());
      return isNaN(id) ? 0 : id;
    }
    return 0;
  };

  // Helper function to convert array of string IDs to array of numbers
  const convertToIdArray = (values: string[] | undefined): number[] => {
    console.log(values + 'Values get')
    if (!values || !Array.isArray(values)) return [];
    return values
      .map(value => convertToId(value))
      .filter(id => id > 0);
  };

  // Helper function to handle string arrays
  const ensureStringArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  };

  // Helper function to format date
  const formatDate = (dateValue: string | undefined): string => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      return dateValue; // Return original if parsing fails
    }
  };

  const transformedData = {
    organizationName: organizationDetails?.organizationName || '',
    industrySectorId: convertToId(organizationDetails?.industrySector),
    briefAboutCompany: organizationDetails?.briefAboutCompany || '',
    yearOfIncorporation: formatDate(organizationDetails?.yearOfIncorporation),
    registrationNumber: organizationDetails?.registrationNumber || '',
    primaryRegistration: organizationDetails?.primaryRegistration || '',
    logoUrl: organizationDetails?.logoUrl || '', // Add logoUrl to main payload
    website: organizationDetails?.website || '',
    clientStatusId: convertToId(organizationDetails?.clientStatus) || 1, // Default to 1 (Onboarded)
    clientBusinessSizeId: convertToId(organizationDetails?.clientBusinessSize),
    clientSubscriptionTierId: convertToId(organizationDetails?.clientSubscriptionTier),

    geographiesOfOperation: convertToIdArray(
      ensureStringArray(organizationDetails?.geographiesOfOperations || organizationDetails?.geographiesOfOperation)
    ).map(id => ({ geographyOfOperationId: id })),

    orgCertifications: convertToIdArray(
      ensureStringArray(organizationDetails?.certifications)
    ).map(id => ({
      orgCertificationId: id,
      certificationNumber: organizationDetails?.certificationNumber || '',
      issueDate: formatDate(organizationDetails?.certificationIssueDate),
      expiryDate: formatDate(organizationDetails?.certificationExpiryDate),
    })),

    regulatoryFrameworks: convertToIdArray(
      ensureStringArray(regulatoryPCI?.regulatoryFrameworks)
    ).map(id => ({ regulatoryFrameworkId: id })),

    address: {
      streetAddress1: addressLocation?.streetAddress1 || '',
      streetAddress2: addressLocation?.streetAddress2 || '',
      city: addressLocation?.city || '',
      stateProvince: addressLocation?.state || '',
      zipPostalCode: addressLocation?.zipCode || '',
      countryId: convertToId(addressLocation?.country),
      gstVatNumber: addressLocation?.gstVatNumber || '',
    },

    primaryContact: {
      primaryContactName: regulatoryPCI?.primaryContactName || '',
      designation: regulatoryPCI?.primaryContactDesignation || '',
      emailAddress: regulatoryPCI?.primaryContactEmail || '',
      contactNumber: regulatoryPCI?.primaryContactNumber || '',
      alternateContact: regulatoryPCI?.alternateContact || '',
    },

    commercialDetails: {
      panEinTaxId: commercialDetails?.panEinTaxId || '',
      currencyId: convertToId(commercialDetails?.currency),
      billingEmail: commercialDetails?.billingEmail || '',
      numberOfUsers: parseInt(commercialDetails?.numberOfUsers) || 0,
      vendorVolumeId: convertToId(commercialDetails?.expectedVendorVolume),
      desiredModules: convertToIdArray(
        ensureStringArray(commercialDetails?.desiredModules)
      ).map(id => ({ desiredModuleId: id })),
      operationalRegions: convertToIdArray(
        ensureStringArray(commercialDetails?.operationalRegions)
      ).map(id => ({ operationalRegionId: id })),
    },

    systemAccess: {
      isIso27001Certified: systemAccessRolesOthers?.isISO27001Certified === 'yes',
      targetGoLiveDate: formatDate(systemAccessRolesOthers?.targetGoLiveDate),
      ndaContractStatusFile: systemAccessRolesOthers?.ndaStatus?.name || systemAccessRolesOthers?.ndaContractStatusFile || '',
      termsAccepted: systemAccessRolesOthers?.termsAccepted || false,
      clientLogoFile: organizationDetails?.logoUrl || systemAccessRolesOthers?.clientLogoFile || '',
      adminEmails: (systemAccessRolesOthers?.adminRoleEmails || [])
        .filter((emailObj: any) => {
          // Handle both old format (string) and new format (object with email property)
          const email = typeof emailObj === 'string' ? emailObj : emailObj?.email;
          return email && typeof email === 'string' && email.trim();
        })
        .map((emailObj: any) => {
          // Handle both old format (string) and new format (object with email property)
          const email = typeof emailObj === 'string' ? emailObj : emailObj?.email;
          return { adminEmail: email.trim() };
        }),
      ...(systemAccessRolesOthers?.integrationExpectations && systemAccessRolesOthers.integrationExpectations.length > 0 && {
        integrationExpectations: convertToIdArray(
          ensureStringArray(systemAccessRolesOthers?.integrationExpectations)
        ).map(id => ({ integrationExpectationId: id })),
      }),
    },
  };

  console.log('Final transformed data:', transformedData);
  return transformedData;
};

const clientOnboardingSlice = createSlice({
  name: 'clientOnboarding',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    setCurrentClient: (state, action: PayloadAction<ClientOnboardingData>) => {
      state.currentClient = action.payload;
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch master data
      .addCase(fetchMasterData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.masterData = action.payload;
        state.masterDataLoaded = true;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit client onboarding
      .addCase(submitClientOnboarding.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitClientOnboarding.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.currentClient = action.payload;
      })
      .addCase(submitClientOnboarding.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Fetch client onboarding
      .addCase(fetchClientOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClientOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSubmitSuccess,
  setCurrentClient,
  clearCurrentClient,
} = clientOnboardingSlice.actions;

export default clientOnboardingSlice.reducer;