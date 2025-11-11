import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    submitVendorOnboarding,
    submitRiskSummary,
    clearError,
    clearSubmitSuccess,
    fetchMasterData,
} from '../store/slice/vendorOnboardingSlice';
import { calculateRiskAssessment } from '../utils/riskCalculations';
import { form } from 'framer-motion/client';
import { getAuthData } from '@/utils/auth';

interface DropdownOption {
    value: string | number;
    label: string;
}

interface ValidationError {
    field: string;
    message: string;
}

interface LoadingState {
    masterData: boolean;
    submitting: boolean;
    fetching: boolean;
    validating: boolean;
}

interface NotificationState {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
}

export const useVendorOnboardingEnhanced = () => {
    const dispatch = useDispatch();
    const {
        masterData,
        isSubmitting,
        error,
        submitSuccess,
        masterDataLoaded,
        riskSummarySubmitting,
        riskSummarySuccess,
        riskSummaryError,
        thirdPartyVendorId,
    } = useSelector((state: RootState) => state.vendorOnboarding);
    const authData = getAuthData();
    const submittedBy: any = authData?.email;
    // Local state for enhanced functionality
    const [loadingState, setLoadingState] = useState<LoadingState>({
        masterData: false,
        submitting: false,
        fetching: false,
        validating: false,
    });

    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [notification, setNotification] = useState<NotificationState | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);

    // Update loading state based on Redux state
    useEffect(() => {
        setLoadingState(prev => ({
            ...prev,
            submitting: isSubmitting,
            masterData: !masterDataLoaded,
        }));
    }, [isSubmitting, masterDataLoaded]);

    // Enhanced master data fetching with retry logic
    const fetchMasterDataWithRetry = useCallback(async (maxRetries = 3) => {
        if (masterDataLoaded) return;

        setLoadingState(prev => ({ ...prev, masterData: true }));

        try {
            const result = await dispatch(fetchMasterData() as any);

            if (result.type === 'vendorOnboarding/fetchMasterData/fulfilled') {
                setNotification({
                    type: 'success',
                    message: 'Master data loaded successfully',
                    timestamp: Date.now(),
                });
                setRetryCount(0);
            } else if (result.type === 'vendorOnboarding/fetchMasterData/rejected') {
                throw new Error(result.payload || 'Failed to fetch master data');
            }
        } catch (error) {
            console.error('Master data fetch error:', error);

            if (retryCount < maxRetries && autoRetryEnabled) {
                setRetryCount(prev => prev + 1);
                setNotification({
                    type: 'warning',
                    message: `Retrying... (${retryCount + 1}/${maxRetries})`,
                    timestamp: Date.now(),
                });

                setTimeout(() => {
                    fetchMasterDataWithRetry(maxRetries);
                }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
            } else {
                setNotification({
                    type: 'error',
                    message: 'Failed to load master data. Please refresh the page.',
                    timestamp: Date.now(),
                });
            }
        } finally {
            setLoadingState(prev => ({ ...prev, masterData: false }));
        }
    }, [dispatch, masterDataLoaded, retryCount, autoRetryEnabled]);

    // Initialize master data fetch
    useEffect(() => {
        fetchMasterDataWithRetry();
    }, [fetchMasterDataWithRetry]);

    // Enhanced dropdown options with error handling and sorting
    const getDropdownOptions = useCallback(
        (dataKey: keyof typeof masterData, sortBy: 'label' | 'value' = 'label'): DropdownOption[] => {
            try {
                const data = masterData[dataKey] || [];

                if (!Array.isArray(data)) {
                    console.warn(`Invalid data type for ${dataKey}:`, typeof data);
                    return [];
                }

                const options = data
                    .filter((item: any) => item && typeof item === 'object' && item.isActive !== false)
                    .map((item: any) => ({
                        value: item.id?.toString() || item.value || '',
                        label: item.natureName || item.countryName || item.arrangementName ||
                            item.certificationName || item.frameworkName || item.dataAccessTypeName ||
                            item.dataClassificationName || item.personalDataTypeName || item.currencyName ||
                            item.contractTypeName || item.contractDurationName || item.dataVolumeName ||
                            item.replaceabilityName || item.annualVolumeName || item.thirdPartyTypeName ||
                            item.name || item.label || 'Unknown',
                    }))
                    .filter(option => option.value && option.label);

                // Sort options
                return options.sort((a, b) => {
                    if (sortBy === 'label') {
                        return a.label.localeCompare(b.label);
                    }
                    return a.value.toString().localeCompare(b.value.toString());
                });
            } catch (error) {
                console.error(`Error processing dropdown options for ${dataKey}:`, error);
                return [];
            }
        },
        [masterData]
    );

    // Get specific dropdown options for vendor onboarding
    const dropdownOptions = useMemo(() => ({
        natureOfThirdParty: getDropdownOptions('natureOfThirdParty'),
        countries: getDropdownOptions('countries'),
        dataHostingArrangements: getDropdownOptions('dataHostingArrangements'),
        orgCertifications: getDropdownOptions('orgCertifications'),
        complianceFrameworks: getDropdownOptions('complianceFrameworks'),
        dataAccessTypes: getDropdownOptions('dataAccessTypes'),
        dataClassifications: getDropdownOptions('dataClassifications'),
        personalDataTypes: getDropdownOptions('personalDataTypes'),
        currencies: getDropdownOptions('currencies'),
        contractTypes: getDropdownOptions('contractTypes'),
        contractDurations: getDropdownOptions('contractDurations'),
        dataVolumes: getDropdownOptions('dataVolumes'),
        serviceReplaceabilities: getDropdownOptions('serviceReplaceabilities'),
        annualVolumes: getDropdownOptions('annualVolumes'),
        thirdPartyTypes: getDropdownOptions('thirdPartyTypes'),
    }), [getDropdownOptions]);

    // Enhanced validation with specific error messages
    const validateFormData = useCallback((formData: any, section: string) => {
        setLoadingState(prev => ({ ...prev, validating: true }));
        const errors: ValidationError[] = [];

        try {
            switch (section) {
                case 'thirdPartyInfo':
                    if (!formData.thirdPartyLegalName?.trim()) {
                        errors.push({ field: 'thirdPartyLegalName', message: 'Legal name is required' });
                    }
                    if (!formData.countryOfOperations) {
                        errors.push({ field: 'countryOfOperations', message: 'Country of operations must be selected' });
                    }
                    if (!formData.spocContactName?.trim()) {
                        errors.push({ field: 'spocContactName', message: 'Contact name is required' });
                    }
                    if (!formData.spocEmail?.trim()) {
                        errors.push({ field: 'spocEmail', message: 'Contact email is required' });
                    } else if (!/\S+@\S+\.\S+/.test(formData.spocEmail)) {
                        errors.push({ field: 'spocEmail', message: 'Please enter a valid email address' });
                    }
                    break;

                case 'natureOfEngagement':
                    if (!formData.descriptionOfServices?.trim()) {
                        errors.push({ field: 'descriptionOfServices', message: 'Description of services is required' });
                    }
                    if (!formData.expectedStartDate) {
                        errors.push({ field: 'expectedStartDate', message: 'Expected start date is required' });
                    }
                    if (!formData.contractValue || formData.contractValue <= 0) {
                        errors.push({ field: 'contractValue', message: 'Contract value must be greater than 0' });
                    }
                    break;

                case 'dataSystemAccess':
                    if (!formData.dataAccessTypes?.length) {
                        errors.push({ field: 'dataAccessTypes', message: 'At least one data access type must be selected' });
                    }
                    if (!formData.dataClassification?.length) {
                        errors.push({ field: 'dataClassification', message: 'At least one data classification must be selected' });
                    }
                    break;

                case 'complianceSecurity':
                    if (!formData.applicableFrameworks?.length) {
                        errors.push({ field: 'applicableFrameworks', message: 'At least one compliance framework must be selected' });
                    }
                    break;

                case 'supportingDocuments':
                    if (!formData.assessmentTimeline) {
                        errors.push({ field: 'assessmentTimeline', message: 'Assessment timeline is required' });
                    }
                    if (formData.optOutDueDiligence === 'true' && !formData.optOutJustification?.trim()) {
                        errors.push({ field: 'optOutJustification', message: 'Justification is required when opting out' });
                    }
                    // Validate single admin email
                    if (!formData.adminRoleEmail || !formData.adminRoleEmail.trim()) {
                        errors.push({ field: 'adminRoleEmail', message: 'Admin email is required' });
                    } else {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(formData.adminRoleEmail.trim())) {
                            errors.push({ field: 'adminRoleEmail', message: 'Admin email is invalid' });
                        }
                    }
                    break;
            }

            setValidationErrors(errors);
            return errors.length === 0;
        } catch (error) {
            console.error('Validation error:', error);
            setValidationErrors([{ field: 'general', message: 'Validation failed due to an unexpected error' }]);
            return false;
        } finally {
            setLoadingState(prev => ({ ...prev, validating: false }));
        }
    }, []);

    // Enhanced notification system
    const showNotification = useCallback((type: NotificationState['type'], message: string) => {
        setNotification({
            type,
            message,
            timestamp: Date.now(),
        });

        // Auto-clear success and info notifications
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        }
    }, []);

    // Clear notification
    const clearNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // Helper function to find item by ID
    const findItemById = useCallback(
        (dataKey: keyof typeof masterData, id: number) => {
            const data = masterData[dataKey] || [];
            return data.find((item: any) => item.id === id);
        },
        [masterData]
    );

    // Helper function to find ID by name
    const findIdByName = useCallback(
        (dataKey: keyof typeof masterData, name: string) => {
            const data = masterData[dataKey] || [];
            const item = data.find((item: any) =>
                item.natureName === name ||
                item.countryName === name ||
                item.arrangementName === name ||
                item.certificationName === name ||
                item.frameworkName === name ||
                item.dataAccessTypeName === name ||
                item.dataClassificationName === name ||
                item.personalDataTypeName === name ||
                item.currencyName === name ||
                item.contractTypeName === name ||
                item.contractDurationName === name ||
                item.dataVolumeName === name ||
                item.replaceabilityName === name ||
                item.annualVolumeName === name ||
                item.thirdPartyTypeName === name ||
                item.name === name
            );
            return item?.id || null;
        },
        [masterData]
    );

    // Transform form data to API payload format (similar to client onboarding)
    const transformFormDataToPayload = useCallback(
        (formData: any) => {
            console.log('=== VENDOR ONBOARDING TRANSFORMATION ===');
            console.log('Raw form data:', formData);

            // Helper function to find ID by name
            const findIdByName = (name: string | undefined, dataArray: any[], nameField: string): number => {
                if (!name || typeof name !== 'string') return 0;
                const item = dataArray.find((item: any) =>
                    typeof item[nameField] === 'string' &&
                    item[nameField].toLowerCase().trim() === name.toLowerCase().trim()
                );
                return item?.id || 0;
            };

            // Helper function to find IDs by array of names
            const findIdsByNames = (names: string[] | undefined, dataArray: any[], nameField: string) => {
                if (!names || !Array.isArray(names)) return [];
                return names
                    .filter(name => typeof name === 'string' && name.trim())
                    .map(name => findIdByName(name, dataArray, nameField))
                    .filter(id => id > 0);
            };

            // Helper function to convert string ID to number
            const convertToId = (value: string | number | undefined): number => {
                console.log(value)
                if (typeof value === 'number') return value;
                if (typeof value === 'string' && value.trim() !== '') {
                    const id = parseInt(value.trim(), 10);
                    return isNaN(id) ? 0 : id;
                }
                return 0;
            };

            // Helper function to convert array of string IDs to array of numbers
            const convertToIdArray = (values: string[] | number[] | undefined): number[] => {
                if (!values || !Array.isArray(values)) return [];
                return values
                    .map(value => convertToId(value))
                    .filter((id, index, array) => id > 0 && array.indexOf(id) === index); // Remove duplicates
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

            // Helper function to transform to ID array objects with deduplication
            const transformToIdArray = (values: string[] | number[] | undefined, idKey: string, dataKey: keyof typeof masterData) => {
                if (!values || !Array.isArray(values)) return [];

                console.log(`Transforming ${idKey} from:`, values);
                console.log(`Available data in ${dataKey}:`, masterData[dataKey]);

                // Handle both string names and numeric IDs
                const ids = values
                    .map(value => {
                        // If it's already a number, return it
                        if (typeof value === 'number') return value;

                        // If it's a string that can be parsed as number, parse it
                        const numValue = parseInt(value.toString(), 10);
                        if (!isNaN(numValue)) return numValue;

                        // Otherwise, try to find by name using comprehensive matching
                        const dataArray = masterData[dataKey] || [];
                        const fieldName = getFieldName(dataKey);
                        console.log(`Looking for "${value}" in field "${fieldName}"`);

                        const found = dataArray.find((item: any) => {
                            // Try exact match first
                            if (item[fieldName] === value) return true;

                            // Try case-insensitive match
                            if (typeof item[fieldName] === 'string' &&
                                item[fieldName].toLowerCase() === value.toLowerCase()) return true;

                            // Try partial match for similar names
                            if (typeof item[fieldName] === 'string' &&
                                item[fieldName].toLowerCase().includes(value.toLowerCase())) return true;

                            // Try the other way around
                            if (typeof item[fieldName] === 'string' &&
                                value.toLowerCase().includes(item[fieldName].toLowerCase())) return true;

                            return false;
                        });

                        console.log(`Found item for "${value}":`, found);
                        return found?.id || null;
                    })
                    .filter(id => id !== null && id > 0);

                // Remove duplicates
                const uniqueIds = [...new Set(ids)];
                console.log(`Unique IDs for ${idKey}:`, uniqueIds);

                return uniqueIds.map(id => ({ [idKey]: id }));
            };

            // Helper to get the correct field name for different data types
            const getFieldName = (dataKey: keyof typeof masterData): string => {
                const fieldMap = {
                    'natureOfThirdParty': 'natureName',
                    'countries': 'countryName',
                    'dataHostingArrangements': 'arrangementName',
                    'orgCertifications': 'certificationName',
                    'complianceFrameworks': 'frameworkName',
                    'dataAccessTypes': 'dataAccessTypeName',
                    'dataClassifications': 'dataClassificationName',
                    'personalDataTypes': 'personalDataTypeName',
                    'currencies': 'currencyName',
                    'contractTypes': 'contractTypeName',
                    'contractDurations': 'contractDurationName',
                    'dataVolumes': 'dataVolumeName',
                    'serviceReplaceabilities': 'replaceabilityName',
                    'annualVolumes': 'annualVolumeName',
                    'thirdPartyTypes': 'thirdPartyTypeName',
                };
                return fieldMap[dataKey] || 'name';
            };

            const transformedData = {
                // Basic information
                clientId: formData.clientId,
                legalName: formData.thirdPartyLegalName || '',
                websiteUrl: formData.websiteUrl || '',
                spocContactName: formData.spocContactName || '',
                spocEmail: formData.spocEmail || '',
                spocPhoneNumber: formData.spocPhoneNumber || '',

                // thirdPartyTypeId should be an array structure like others
                thirdPartyTypeId: transformToIdArray(
                    formData.typeOfThirdParty,
                    'thirdPartyTypeId',
                    'thirdPartyTypes'
                ),

                // Single ID
                natureOfThirdPartyId: convertToId(formData.natureOfThirdParty),

                // Array fields with proper deduplication
                countries: transformToIdArray(
                    Array.isArray(formData.countryOfOperations) ? formData.countryOfOperations : [formData.countryOfOperations],
                    'countryId',
                    'countries'
                ),

                dataHostingArrangements: transformToIdArray(
                    formData.dataHostingArrangement,
                    'dataHostingArrangementId',
                    'dataHostingArrangements'
                ),

                vendorCertifications: transformToIdArray(
                    formData.vendorCertifications,
                    'vendorCertificationId',
                    'orgCertifications'
                ),

                complianceFrameworks: transformToIdArray(
                    formData.applicableFrameworks,
                    'complianceFrameworkId',
                    'complianceFrameworks'
                ),

                dataAccessTypes: transformToIdArray(
                    formData.dataAccessTypes,
                    'dataAccessTypeId',
                    'dataAccessTypes'
                ),

                dataClassifications: transformToIdArray(
                    formData.dataClassification,
                    'dataClassificationId',
                    'dataClassifications'
                ),

                personalDataTypes: transformToIdArray(
                    formData.personalDataTypes,
                    'personalDataTypeId',
                    'personalDataTypes'
                ),

                // Engagement details
                engagement: {
                    descriptionOfServices: formData.descriptionOfServices || '',
                    expectedStartDate: formatDate(formData.expectedStartDate),
                    contractValue: parseFloat(formData.contractValue) || 0,
                    currencyId: convertToId(formData.contractCurrency),
                    contractTypeId: convertToId(formData.contractType),
                    contractDurationId: convertToId(formData.contractDuration),
                    isRenewal: formData.renewalOfExisting === 'true',
                    isFourthPartyInvolved: formData.fourthPartyInvolved === 'true'
                },

                // Data volume
                dataVolume: {
                    personalDataVolumeId: convertToId(formData.personalDataVolume),
                    totalDataVolumeId: convertToId(formData.dataVolume),
                    clientSystemsAccess: formData.systemAccessRequired === 'true',
                    typeOfSystemAccess: formData.systemAccessType || ''
                },

                // Risk consideration
                riskConsideration: {
                    crossBorderTransfer: formData.crossBorderTransfer === true,
                    crossBorderCountries: formData.crossBorderCountries || '',
                    dataHostingProcessingCountry: formData.dataHostingCountry || '',
                    knownRisks: formData.knownRisks === true,
                    knownRisksDescription: formData.knownRisksDescription || '',
                    businessDisruption: formData.businessDisruption === true,
                    businessDisruptionDescription: formData.businessDisruptionDescription || '',
                    customerImpact: formData.customerImpact === true,
                    customerImpactDescription: formData.customerImpactDescription || '',
                    serviceReplaceabilityId: convertToId(formData.replaceability),
                    annualVolumeId: convertToId(formData.annualVolumeRecords),
                    itNetworkAccess: formData.itAccess === true,
                    itNetworkAccessDescription: formData.itAccessDescription || '',
                    serviceLocationDomestic: formData.domesticService === true,
                    serviceLocationDescription: formData.domesticServiceDescription || ''
                },

                // Sanctions screening
                sanctionsScreening: {
                    sanctionedCountryAffiliation: formData.sanctionedCountry === 'true',
                    sanctionedCountryDetails: formData.sanctionedCountryDetails || '',
                    sanctionsListScreened: formData.sanctionList === 'true',
                    sanctionsListCriticalRisk: false, // This field seems to be missing from form
                    sanctionsListDetails: '', // This field seems to be missing from form
                    litigationOrAdverseMedia: formData.adverseMedia === 'true',
                    litigationAdverseMediaDetails: formData.adverseMediaDetails || '',
                    supportingDocuments: '' // This field seems to be missing from form
                },

                // Supporting details
                supportingDetails: {
                    supportingDocuments: formData.supportingDocuments || '',
                    additionalComments: formData.additionalComments || '',
                    expectedAssessmentCompletion: formatDate(formData.assessmentTimeline),
                    exemptionRequested: formData.optOutDueDiligence === 'true',
                    exemptionReason: formData.optOutJustification || ''
                },

                // System access with admin email
                systemAccess: {
                    adminEmails: formData.adminRoleEmail && formData.adminRoleEmail.trim()
                        ? [{ adminEmail: formData.adminRoleEmail.trim() }]
                        : []
                }
            };

            console.log('Final transformed payload:', transformedData);
            return transformedData;
        },
        [masterData, findIdByName]
    );

    // Helper function to create risk summary payload
    const createRiskSummaryPayload = useCallback((formData: any, thirdPartyVendorId: number, submittedBy: string) => {
        // Calculate risk assessment using the existing utility
        const riskAssessment = calculateRiskAssessment(formData);

        return {
            submittedBy,
            thirdPartyVendorId,
            actorUserId: authData.authUserId,
            regulatoryRisk: riskAssessment.regulatoryRisk,
            financialRisk: riskAssessment.financialRisk,
            operationalRisk: riskAssessment.operationalRisk,
            reputationalRisk: riskAssessment.reputationalRisk,
            inherentRiskScore: riskAssessment.inherentRiskScore,
            controlEffectivenessScore: riskAssessment.controlEffectivenessScore,
            controlEffectivenessLevel: riskAssessment.controlEffectivenessLevel,
            residualRiskScore: riskAssessment.residualRiskScore,
            residualRiskLevel: riskAssessment.residualRiskLevel,
            vendorTier: riskAssessment.vendorTier,
            reviewFrequency: riskAssessment.reviewFrequency,
            recommendedActions: riskAssessment.recommendedActions,
            proceedWithOnboarding: riskAssessment.proceedWithOnboarding,
            riskMetrics: riskAssessment.riskMetrics
        };
    }, []);

    // Submit with validation and risk summary
    const submitWithValidation = useCallback(async (formData: any) => {
        setLoadingState(prev => ({ ...prev, submitting: true }));
        console.log('=== SUBMITTING VENDOR ONBOARDING ===');
        console.log('Form data:', formData);

        try {
            // Step 1: Transform form data to API payload
            const payload = transformFormDataToPayload(formData);
            console.log('Transformed payload:', payload);

            // Step 2: Submit vendor onboarding
            console.log('Submitting vendor onboarding...');
            const vendorResult = await dispatch(submitVendorOnboarding(payload) as any);

            if (vendorResult.type === 'vendorOnboarding/submitVendorOnboarding/fulfilled') {
                console.log('Vendor onboarding successful:', vendorResult.payload);

                // Step 3: Extract thirdPartyVendorId from response
                const thirdPartyVendorId = vendorResult.payload?.data?.[0]?.thirdPartyVendor?.id || 0;

                if (!thirdPartyVendorId) {
                    throw new Error('Failed to extract thirdPartyVendorId from response');
                }

                console.log('Extracted thirdPartyVendorId:', thirdPartyVendorId);

                // Step 4: Create risk summary payload
                const riskSummaryPayload = createRiskSummaryPayload(formData, thirdPartyVendorId, submittedBy);
                console.log('Risk summary payload:', riskSummaryPayload);

                // Step 5: Submit risk summary
                console.log('Submitting risk summary...');
                const riskResult = await dispatch(submitRiskSummary(riskSummaryPayload) as any);

                if (riskResult.type === 'vendorOnboarding/submitRiskSummary/fulfilled') {
                    console.log('Risk summary submitted successfully:', riskResult.payload);
                    showNotification('success', 'Vendor onboarding and risk assessment completed successfully!');
                    return true;
                } else {
                    console.error('Risk summary submission failed:', riskResult.payload);
                    showNotification('error', 'Vendor onboarding succeeded but risk summary failed: ' + (riskResult.payload || 'Unknown error'));
                    return false;
                }

            } else {
                console.error('Vendor onboarding failed:', vendorResult.payload);
                showNotification('error', vendorResult.payload || 'Failed to submit vendor onboarding');
                return false;
            }
        } catch (error) {
            console.error('Submit error:', error);
            showNotification('error', `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        } finally {
            setLoadingState(prev => ({ ...prev, submitting: false }));
        }
    }, [dispatch, transformFormDataToPayload, createRiskSummaryPayload, showNotification]);

    // Format validation errors
    const formatValidationErrors = useCallback((errors: ValidationError[]) => {
        return errors.map(error => ({
            field: error.field,
            message: error.message
        }));
    }, []);

    return {
        // Master data
        masterData,
        masterDataLoaded,
        dropdownOptions,
        isMasterDataReady: masterDataLoaded,

        // Loading states
        loadingState,
        isLoading: loadingState.masterData || loadingState.submitting,
        isSubmitting: loadingState.submitting,

        // Validation
        validationErrors,
        validateFormData,
        formatValidationErrors,

        // Notifications
        notification,
        showNotification,
        clearNotification,

        // Utility functions
        findItemById,
        findIdByName,
        getDropdownOptions,

        // Form handling
        transformFormDataToPayload,
        submitWithValidation,
        submitOnboarding: submitWithValidation, // Alias for consistency with client hook

        // Redux actions
        clearError: () => dispatch(clearError()),
        clearSubmitSuccess: () => dispatch(clearSubmitSuccess()),
        clearErrorMessage: () => dispatch(clearError()),
        clearSubmitSuccessMessage: () => dispatch(clearSubmitSuccess()),

        // State
        error,
        submitSuccess,
        riskSummarySubmitting,
        riskSummarySuccess,
        riskSummaryError,
        thirdPartyVendorId,

        // Helper functions
        createRiskSummaryPayload,

        // Retry mechanism
        fetchMasterDataWithRetry,
        retryCount,
        autoRetryEnabled,
        setAutoRetryEnabled,

        // Loading message (for consistency with client hook)
        getLoadingMessage: loadingState.masterData ? 'Loading master data...' :
            loadingState.submitting ? 'Submitting vendor onboarding...' :
                'Ready'
    };
};

export default useVendorOnboardingEnhanced;