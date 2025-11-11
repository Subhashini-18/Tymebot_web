import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api/apiservice';
// import masterDataService from '../../services/masterDataService';

interface VendorOnboardingData {
    // We'll define the structure once you provide the payload format
    [key: string]: any;
}

interface VendorOnboardingState {
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    submitSuccess: boolean;
    submittedData: VendorOnboardingData | null;
    riskSummarySubmitting: boolean;
    riskSummarySuccess: boolean;
    riskSummaryError: string | null;
    thirdPartyVendorId: number | null;
    masterData: {
        natureOfThirdParty: any[];
        countries: any[];
        dataHostingArrangements: any[];
        orgCertifications: any[];
        complianceFrameworks: any[];
        dataAccessTypes: any[];
        dataClassifications: any[];
        personalDataTypes: any[];
        currencies: any[];
        contractTypes: any[];
        contractDurations: any[];
        dataVolumes: any[];
        serviceReplaceabilities: any[];
        annualVolumes: any[];
        thirdPartyTypes: any[];
    };
    masterDataLoaded: boolean;
}

const initialState: VendorOnboardingState = {
    isLoading: false,
    isSubmitting: false,
    error: null,
    submitSuccess: false,
    submittedData: null,
    riskSummarySubmitting: false,
    riskSummarySuccess: false,
    riskSummaryError: null,
    thirdPartyVendorId: null,
    masterData: {
        natureOfThirdParty: [],
        countries: [],
        dataHostingArrangements: [],
        orgCertifications: [],
        complianceFrameworks: [],
        dataAccessTypes: [],
        dataClassifications: [],
        personalDataTypes: [],
        currencies: [],
        contractTypes: [],
        contractDurations: [],
        dataVolumes: [],
        serviceReplaceabilities: [],
        annualVolumes: [],
        thirdPartyTypes: [],
    },
    masterDataLoaded: false,
};

const BASE_API_PATH = import.meta.env.VITE_API_PATH || '/api/tyme/tracs/v1/';
const MASTER_DATA_API_PORT = import.meta.env.VITE_BASE_PORT
const DOMAIN_API_PORT = import.meta.env.VITE_BASE_PORT
// Async thunk for fetching master data
export const fetchMasterData = createAsyncThunk(
    'vendorOnboarding/fetchMasterData',
    async (_, { rejectWithValue }) => {
        try {
            const endpoints = [
                'get_all_nature_of_third_party',
                'get_all_country',
                'get_all_data_hosting_arrangement',
                'get_all_org_certification',
                'get_all_compliance_framework',
                'get_all_data_access_type',
                'get_all_data_classification',
                'get_all_personal_data_type',
                'get_all_currency',
                'get_all_contract_type',
                'get_all_contract_duration',
                'get_all_data_volume',
                'get_all_service_replaceability',
                'get_all_annual_volume',
                'get_all_third_party_type',
            ];

            const promises = endpoints.map(endpoint =>
                apiService.get(`${BASE_API_PATH}${endpoint}`, {}, MASTER_DATA_API_PORT)
            );

            const results: any = await Promise.all(promises);
            console.log('Master data results:', results);

            return {
                natureOfThirdParty: results[0]?.data || [],
                countries: results[1]?.data || [],
                dataHostingArrangements: results[2]?.data || [],
                orgCertifications: results[3]?.data || [],
                complianceFrameworks: results[4]?.data || [],
                dataAccessTypes: results[5]?.data || [],
                dataClassifications: results[6]?.data || [],
                personalDataTypes: results[7]?.data || [],
                currencies: results[8]?.data || [],
                contractTypes: results[9]?.data || [],
                contractDurations: results[10]?.data || [],
                dataVolumes: results[11]?.data || [],
                serviceReplaceabilities: results[12]?.data || [],
                annualVolumes: results[13]?.data || [],
                thirdPartyTypes: results[14]?.data || [],
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch master data');
        }
    }
);
// const transformVendorFormDataToAPI = (formData: any): VendorOnboardingData => {
//     console.log('Transforming vendor form data:', formData);

//     // Helper function to get ID from option strings
//     const getIdFromOption = (option: string, mapping: Record<string, number>): number => {
//         return mapping[option] || 1;
//     };

//     // Helper function to transform array of options to array of IDs
//     const transformArrayToIds = (options: string[], mapping: Record<string, number>) => {
//         return options.map(option => ({ [`${Object.keys(mapping)[0].replace(/Id$/, '')}Id`]: getIdFromOption(option, mapping) }));
//     };

//     // ID mappings - these should match your backend mappings
//     const thirdPartyTypeMapping = {
//         'Vendor': 1,
//         'Service Provider': 2,
//         'Supplier': 3,
//         'Contractor': 4,
//         'Consultant': 5,
//         'Other': 6
//     };

//     const natureOfThirdPartyMapping = {
//         'Critical': 1,
//         'Important': 2,
//         'Standard': 3,
//         'Low Risk': 4
//     };

//     const currencyMapping = {
//         'USD': 1,
//         'EUR': 2,
//         'GBP': 3,
//         'INR': 4,
//         'JPY': 5,
//         'Other': 6
//     };

//     const contractTypeMapping = {
//         'Fixed Term': 1,
//         'Ongoing': 2,
//         'Project Based': 3,
//         'Subscription': 4,
//         'Other': 5
//     };

//     const contractDurationMapping = {
//         'Less than 1 year': 1,
//         '1-3 years': 2,
//         '3-5 years': 3,
//         'More than 5 years': 4
//     };

//     const dataHostingMapping = {
//         'On-Premises': 1,
//         'Cloud': 2,
//         'Multi-Cloud': 3,
//         'Hybrid': 4
//     };

//     const certificationMapping = {
//         'ISO 27001': 1,
//         'SOC 2 Type I': 2,
//         'SOC 2 Type II': 3,
//         'PCI DSS': 4,
//         'HIPAA': 5,
//         'Other': 6
//     };

//     const complianceMapping = {
//         'GDPR': 1,
//         'CCPA': 2,
//         'SOX': 3,
//         'HIPAA': 4,
//         'PCI DSS': 5,
//         'ISO 27001': 6,
//         'Other': 7
//     };

//     const dataAccessMapping = {
//         'Personal Data': 1,
//         'Health/Medical Data': 2,
//         'Financial Data': 3,
//         'IP/Proprietary Data': 4,
//         'Operational Data': 5,
//         'Customer Data': 6,
//         'Other': 7
//     };

//     const dataClassificationMapping = {
//         'Confidential': 1,
//         'Internal': 2,
//         'Public': 3,
//         'Top Secret': 4,
//         'Restricted': 5
//     };

//     const personalDataTypesMapping = {
//         'Employee': 1,
//         'Customer': 2,
//         'Company Data': 3,
//         'Third Party': 4,
//         'Other': 5
//     };

//     const personalDataVolumeMapping = {
//         'Low (<10,000 records)': 1,
//         'Medium (10,000-100,000 records)': 2,
//         'High (100,000-1M records)': 3,
//         'Very High (>1M records)': 4
//     };

//     const totalDataVolumeMapping = {
//         'Low (<100,000 records)': 1,
//         'Medium (100,000-500,000 records)': 2,
//         'High (>500,000 records)': 3
//     };

//     const serviceReplaceabilityMapping = {
//         'Easily replaceable': 1,
//         'Moderately replaceable': 2,
//         'Difficult to replace': 3,
//         'Not replaceable': 4
//     };

//     const annualVolumeMapping = {
//         'Low': 1,
//         'Medium': 2,
//         'High': 3,
//         'Very High': 4
//     };

//     const countryMapping = {VITE_BASE_PORT
//         'United States': 1,
//         'India': 2,
//         'United Kingdom': 3,
//         'Canada': 4,
//         'Australia': 5,
//         'Germany': 6,
//         'France': 7,
//         'Other': 8
//     };

//     const transformedData = {
//         // Basic info
//         legalName: formData.thirdPartyLegalName || '',
//         websiteUrl: formData.websiteUrl || '',
//         spocContactName: formData.spocContactName || '',
//         spocEmail: formData.spocEmail || '',
//         spocPhoneNumber: formData.spocPhoneNumber || '',

//         // IDs
//         thirdPartyTypeId: getIdFromOption(formData.typeOfThirdParty?.[0] || 'Vendor', thirdPartyTypeMapping),
//         natureOfThirdPartyId: getIdFromOption(formData.natureOfThirdParty || 'Standard', natureOfThirdPartyMapping),

//         // Countries
//         countries: formData.countryOfOperations ? [{ countryId: getIdFromOption(formData.countryOfOperations, countryMapping) }] : [],

//         // Data hosting arrangements
//         dataHostingArrangements: formData.dataHostingArrangement ?
//             formData.dataHostingArrangement.map((arrangement: string) => ({
//                 dataHostingArrangementId: getIdFromOption(arrangement, dataHostingMapping)
//             })) : [],

//         // Certifications
//         vendorCertifications: formData.vendorCertifications ?
//             formData.vendorCertifications.map((cert: string) => ({
//                 vendorCertificationId: getIdFromOption(cert, certificationMapping)
//             })) : [],

//         // Compliance frameworks
//         complianceFrameworks: formData.applicableFrameworks ?
//             formData.applicableFrameworks.map((framework: string) => ({
//                 complianceFrameworkId: getIdFromOption(framework, complianceMapping)
//             })) : [],

//         // Data access types
//         dataAccessTypes: formData.dataAccessTypes ?
//             formData.dataAccessTypes.map((type: string) => ({
//                 dataAccessTypeId: getIdFromOption(type, dataAccessMapping)
//             })) : [],

//         // Data classifications
//         dataClassifications: formData.dataClassification ?
//             formData.dataClassification.map((classification: string) => ({
//                 dataClassificationId: getIdFromOption(classification, dataClassificationMapping)
//             })) : [],

//         // Personal data types
//         personalDataTypes: formData.personalDataTypes ?
//             formData.personalDataTypes.map((type: string) => ({
//                 personalDataTypeId: getIdFromOption(type, personalDataTypesMapping)
//             })) : [],

//         // Engagement details
//         engagement: {
//             descriptionOfServices: formData.descriptionOfServices || '',
//             expectedStartDate: formData.expectedStartDate || '',
//             contractValue: parseFloat(formData.contractValue) || 0,
//             currencyId: getIdFromOption(formData.contractCurrency || 'USD', currencyMapping),
//             contractTypeId: getIdFromOption(formData.contractType || 'Fixed Term', contractTypeMapping),
//             contractDurationId: getIdFromOption(formData.contractDuration || '1-3 years', contractDurationMapping),
//             isRenewal: formData.renewalOfExisting === 'true',
//             isFourthPartyInvolved: formData.fourthPartyInvolved === 'true'
//         },

//         // Data volume
//         dataVolume: {
//             personalDataVolumeId: getIdFromOption(formData.personalDataVolume || 'Low (<10,000 records)', personalDataVolumeMapping),
//             totalDataVolumeId: getIdFromOption(formData.dataVolume || 'Low (<100,000 records)', totalDataVolumeMapping),
//             clientSystemsAccess: formData.systemAccessRequired === 'true',
//             typeOfSystemAccess: formData.systemAccessType || ''
//         },

//         // Risk considerations
//         riskConsideration: {
//             crossBorderTransfer: formData.crossBorderTransfer === 'true',
//             crossBorderCountries: formData.crossBorderCountries || '',
//             dataHostingProcessingCountry: formData.dataHostingCountry || '',
//             knownRisks: formData.knownRisks === 'true',
//             knownRisksDescription: formData.knownRisksDescription || '',
//             businessDisruption: formData.businessDisruption === 'true',
//             businessDisruptionDescription: formData.businessDisruptionDescription || '',
//             customerImpact: formData.customerImpact === 'true',
//             customerImpactDescription: formData.customerImpactDescription || '',
//             serviceReplaceabilityId: getIdFromOption(formData.replaceability || 'Moderately replaceable', serviceReplaceabilityMapping),
//             annualVolumeId: getIdFromOption(formData.annualVolumeRecords || 'Medium', annualVolumeMapping),
//             itNetworkAccess: formData.itAccess === 'true',
//             itNetworkAccessDescription: formData.itAccessDescription || '',
//             serviceLocationDomestic: formData.domesticService === 'true',
//             serviceLocationDescription: formData.domesticServiceDescription || ''
//         },

//         // Sanctions screening
//         sanctionsScreening: {
//             sanctionedCountryAffiliation: formData.sanctionedCountry === 'true',
//             sanctionedCountryDetails: formData.sanctionedCountryDetails || '',
//             sanctionsListScreened: formData.sanctionList === 'true',
//             sanctionsListCriticalRisk: false, // This might need to be derived from other fields
//             sanctionsListDetails: '',
//             litigationOrAdverseMedia: formData.adverseMedia === 'true',
//             litigationAdverseMediaDetails: formData.adverseMediaDetails || '',
//             supportingDocuments: ''
//         },

//         // Supporting details
//         supportingDetails: {
//             supportingDocuments: formData.supportingDocuments || '',
//             additionalComments: formData.additionalComments || '',
//             expectedAssessmentCompletion: formData.assessmentTimeline || '',
//             exemptionRequested: formData.optOutDueDiligence === 'true',
//             exemptionReason: formData.optOutJustification || ''
//         }
//     };

//     return transformedData;
// };
// Async thunk for vendor onboarding

export const submitVendorOnboarding = createAsyncThunk(
    'vendorOnboarding/submitVendorOnboarding',
    async (formData: any, { rejectWithValue }) => {
        try {
            console.log('Submitting vendor onboarding data:', formData);
            // Transform the form data to match the expected API format

            const response: any = await apiService.post(
                `${BASE_API_PATH}onboard_third_party_vendor`,
                formData,
                DOMAIN_API_PORT
            );

            return response;
        } catch (error: any) {
            console.error('Error in submitVendorOnboarding:', error);
            return rejectWithValue(error.message || 'Failed to submit vendor onboarding');
        }
    }
);

// New async thunk for submitting risk summary
export const submitRiskSummary = createAsyncThunk(
    'vendorOnboarding/submitRiskSummary',
    async (riskSummaryData: any, { rejectWithValue }) => {
        try {
            console.log('Submitting risk summary data:', riskSummaryData);

            const response: any = await apiService.post(
                `${BASE_API_PATH}create_third_party_vendor_risk_summary`,
                riskSummaryData,
                DOMAIN_API_PORT
            );

            return response.data;
        } catch (error: any) {
            console.error('Error in submitRiskSummary:', error);
            return rejectWithValue(error.message || 'Failed to submit risk summary');
        }
    }
);

// Helper function to transform form data to API format


const vendorOnboardingSlice = createSlice({
    name: 'vendorOnboarding',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSubmitSuccess: (state) => {
            state.submitSuccess = false;
        },
        clearRiskSummaryError: (state) => {
            state.riskSummaryError = null;
        },
        clearRiskSummarySuccess: (state) => {
            state.riskSummarySuccess = false;
        },
        resetVendorOnboarding: (state) => {
            state.isLoading = false;
            state.isSubmitting = false;
            state.error = null;
            state.submitSuccess = false;
            state.submittedData = null;
            state.riskSummarySubmitting = false;
            state.riskSummarySuccess = false;
            state.riskSummaryError = null;
            state.thirdPartyVendorId = null;
            // Keep master data loaded
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
            // Submit vendor onboarding
            .addCase(submitVendorOnboarding.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                state.submitSuccess = false;
            })
            .addCase(submitVendorOnboarding.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.submitSuccess = true;
                state.submittedData = action.payload;
                // Extract thirdPartyVendorId from response
                if (action.payload?.data?.[0]?.thirdPartyVendor?.id) {
                    state.thirdPartyVendorId = action.payload.data[0].thirdPartyVendor.id;
                }
            })
            .addCase(submitVendorOnboarding.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
                state.submitSuccess = false;
            })
            // Submit risk summary
            .addCase(submitRiskSummary.pending, (state) => {
                state.riskSummarySubmitting = true;
                state.riskSummaryError = null;
                state.riskSummarySuccess = false;
            })
            .addCase(submitRiskSummary.fulfilled, (state, action) => {
                state.riskSummarySubmitting = false;
                state.riskSummarySuccess = true;
            })
            .addCase(submitRiskSummary.rejected, (state, action) => {
                state.riskSummarySubmitting = false;
                state.riskSummaryError = action.payload as string;
                state.riskSummarySuccess = false;
            });
    },
});

export const {
    clearError,
    clearSubmitSuccess,
    clearRiskSummaryError,
    clearRiskSummarySuccess,
    resetVendorOnboarding
} = vendorOnboardingSlice.actions;

export default vendorOnboardingSlice.reducer;