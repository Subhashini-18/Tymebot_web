import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    fetchMasterData,
    submitClientOnboarding,
    fetchClientOnboarding,
    clearError,
    clearSubmitSuccess,
    setCurrentClient,
    clearCurrentClient,
} from '../store/slice/clientOnboardingSlice';

interface DropdownOption {
    value: string | number;
    label: string;

}

interface FormDataToPayload {
    organizationDetails: any;
    regulatoryPCI: any;
    addressLocation: any;
    commercialDetails: any;
    systemAccessRolesOthers: any;
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

export const useClientOnboardingEnhanced = () => {
    const dispatch = useDispatch();
    const {
        masterData,
        currentClient,
        isLoading,
        isSubmitting,
        error,
        submitSuccess,
        masterDataLoaded,
    } = useSelector((state: RootState) => state.clientOnboarding);

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
            masterData: isLoading && !masterDataLoaded,
            submitting: isSubmitting,
            fetching: isLoading && masterDataLoaded,
        }));
    }, [isLoading, isSubmitting, masterDataLoaded]);

    // Enhanced master data fetching with retry logic
    const fetchMasterDataWithRetry = useCallback(async (maxRetries = 3) => {
        if (masterDataLoaded) return;

        setLoadingState(prev => ({ ...prev, masterData: true }));

        try {
            const result = await dispatch(fetchMasterData() as any);

            if (result.type === 'clientOnboarding/fetchMasterData/fulfilled') {
                setNotification({
                    type: 'success',
                    message: 'Master data loaded successfully',
                    timestamp: Date.now(),
                });
                setRetryCount(0);
            } else if (result.type === 'clientOnboarding/fetchMasterData/rejected') {
                throw new Error(result.payload || 'Failed to fetch master data');
            }
        } catch (error) {
            // Fix: Remove reference to undefined variable 'first'
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
        (dataKey: keyof typeof masterData, sortBy: 'label' | 'value' = 'label'): any[] => {
            try {
                const data = masterData[dataKey] || [];

                if (!Array.isArray(data)) {
                    console.warn(`Invalid data type for ${dataKey}:`, typeof data);
                    return [];
                }

                const options = data
                    .filter((item: any) => item && typeof item === 'object')
                    .map((item: any) => ({
                        value: item.id?.toString() || item.value || '',
                        label: item.name || item.industrySectorName || item.geographyName ||
                            item.certificationName || item.frameworkName || item.countryName ||
                            item.currencyName || item.vendorVolumeName || item.moduleName ||
                            item.regionName || item.integrationName || item.label || 'Unknown',
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

    // Enhanced validation with specific error messages
    const validateFormData = useCallback((formData: any, section: string) => {
        setLoadingState(prev => ({ ...prev, validating: true }));
        const errors: ValidationError[] = [];

        try {
            switch (section) {
                case 'organizationDetails':
                    if (!formData.organizationName?.trim()) {
                        errors.push({ field: 'organizationName', message: 'Organization name is required' });
                    }
                    if (!formData.industrySector) {
                        errors.push({ field: 'industrySector', message: 'Industry sector must be selected' });
                    }
                    if (!formData.briefAboutCompany?.trim()) {
                        errors.push({ field: 'briefAboutCompany', message: 'Company description is required' });
                    }
                    if (!formData.clientStatus) {
                        errors.push({ field: 'clientStatus', message: 'Client status must be selected' });
                    }
                    if (!formData.clientBusinessSize) {
                        errors.push({ field: 'clientBusinessSize', message: 'Client business size must be selected' });
                    }
                    if (!formData.clientSubscriptionTier) {
                        errors.push({ field: 'clientSubscriptionTier', message: 'Client subscription tier must be selected' });
                    }
                    break;

                case 'regulatoryPCI':
                    if (!formData.regulatoryFrameworks?.length) {
                        errors.push({ field: 'regulatoryFrameworks', message: 'At least one regulatory framework must be selected' });
                    }
                    if (!formData.primaryContactName?.trim()) {
                        errors.push({ field: 'primaryContactName', message: 'Primary contact name is required' });
                    }
                    if (!formData.primaryContactEmail?.trim()) {
                        errors.push({ field: 'primaryContactEmail', message: 'Primary contact email is required' });
                    } else if (!/\S+@\S+\.\S+/.test(formData.primaryContactEmail)) {
                        errors.push({ field: 'primaryContactEmail', message: 'Please enter a valid email address' });
                    }
                    break;

                case 'addressLocation':
                    if (!formData.streetAddress1?.trim()) {
                        errors.push({ field: 'streetAddress1', message: 'Street address is required' });
                    }
                    if (!formData.city?.trim()) {
                        errors.push({ field: 'city', message: 'City is required' });
                    }
                    if (!formData.state?.trim()) {
                        errors.push({ field: 'state', message: 'State/Province is required' });
                    }
                    if (!formData.zipCode?.trim()) {
                        errors.push({ field: 'zipCode', message: 'ZIP/Postal code is required' });
                    }
                    if (!formData.country) {
                        errors.push({ field: 'country', message: 'Country must be selected' });
                    }
                    break;

                case 'commercialDetails':
                    if (!formData.currency) {
                        errors.push({ field: 'currency', message: 'Currency must be selected' });
                    }
                    if (!formData.billingEmail?.trim()) {
                        errors.push({ field: 'billingEmail', message: 'Billing email is required' });
                    } else if (!/\S+@\S+\.\S+/.test(formData.billingEmail)) {
                        errors.push({ field: 'billingEmail', message: 'Please enter a valid billing email address' });
                    }
                    if (!formData.numberOfUsers || formData.numberOfUsers <= 0) {
                        errors.push({ field: 'numberOfUsers', message: 'Number of users must be greater than 0' });
                    }
                    break;

                case 'systemAccessRolesOthers':
                    if (!formData.adminRoleEmails?.length || !formData.adminRoleEmails.some((emailObj: any) => emailObj?.email?.trim())) {
                        errors.push({ field: 'adminRoleEmails', message: 'At least one admin email is required' });
                    }
                    if (!formData.isISO27001Certified) {
                        errors.push({ field: 'isISO27001Certified', message: 'ISO 27001 certification status must be specified' });
                    }
                    if (!formData.termsAccepted) {
                        errors.push({ field: 'termsAccepted', message: 'Terms and conditions must be accepted' });
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

    // Transform form data to API payload format
    const transformFormDataToPayload = useCallback(
        (formData: FormDataToPayload) => {
            const {
                organizationDetails,
                regulatoryPCI,
                addressLocation,
                commercialDetails,
                systemAccessRolesOthers,
            } = formData;
            console.log(systemAccessRolesOthers)
            // Helper function to transform array values to ID objects
            const transformToIdArray = (values: string[] | number[], key: string) => {
                return values?.map((value: string | number) => {
                    const id = typeof value === 'string' ? parseInt(value, 10) : value;
                    return { [key]: id };
                }) || [];
            };

            // Helper function to find ID by name
            const findIdByName = (dataKey: keyof typeof masterData, name: string) => {
                const data = masterData[dataKey] || [];
                const item = data.find((item: any) =>
                    item.name === name ||
                    item.industrySectorName === name ||
                    item.geographyName === name ||
                    item.certificationName === name ||
                    item.frameworkName === name ||
                    item.countryName === name ||
                    item.currencyName === name ||
                    item.vendorVolumeName === name ||
                    item.moduleName === name ||
                    item.regionName === name ||
                    item.integrationName === name
                );
                return item?.id || null;
            };

            // Helper: normalize geographiesOfOperations to array of strings
            const normalizeGeographies = (value: any) => {
                if (Array.isArray(value)) return value;
                if (typeof value === 'string') return value.split(',').map((g: string) => g.trim()).filter(Boolean);
                return [];
            };

            const payload = {
                organizationName: organizationDetails?.organizationName || '',
                industrySectorId: findIdByName('industrySectors', organizationDetails?.industrySector) ||
                    organizationDetails?.industrySectorId || 0,
                briefAboutCompany: organizationDetails?.briefAboutCompany || '',
                yearOfIncorporation: organizationDetails?.yearOfIncorporation || '',
                registrationNumber: organizationDetails?.registrationNumber || '',
                primaryRegistration: organizationDetails?.primaryRegistration || '',
                website: organizationDetails?.website || '',

                geographiesOfOperation: transformToIdArray(
                    normalizeGeographies(organizationDetails?.geographiesOfOperations),
                    'geographyOfOperationId'
                ),

                orgCertifications: (organizationDetails?.certifications || []).map((cert: string) => ({
                    orgCertificationId: findIdByName('orgCertifications', cert) || 0,
                    certificationNumber: '',
                    issueDate: '',
                    expiryDate: '',
                })),

                regulatoryFrameworks: transformToIdArray(
                    regulatoryPCI?.regulatoryFrameworks || [],
                    'regulatoryFrameworkId'
                ),

                address: {
                    streetAddress1: addressLocation?.streetAddress1 || '',
                    streetAddress2: addressLocation?.streetAddress2 || '',
                    city: addressLocation?.city || '',
                    stateProvince: addressLocation?.state || '',
                    zipPostalCode: addressLocation?.zipCode || '',
                    countryId: findIdByName('countries', addressLocation?.country) || 0,
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
                    currencyId: findIdByName('currencies', commercialDetails?.currency) || 0,
                    billingEmail: commercialDetails?.billingEmail || '',
                    numberOfUsers: parseInt(commercialDetails?.numberOfUsers?.toString() || '0', 10),
                    vendorVolumeId: findIdByName('vendorVolumes', commercialDetails?.expectedVendorVolume) || 0,
                    desiredModules: transformToIdArray(
                        commercialDetails?.desiredModules || [],
                        'desiredModuleId'
                    ),
                    operationalRegions: transformToIdArray(
                        commercialDetails?.operationalRegions || [],
                        'operationalRegionId'
                    ),
                },

                systemAccess: {
                    isIso27001Certified: systemAccessRolesOthers?.isISO27001Certified === 'yes',
                    targetGoLiveDate: systemAccessRolesOthers?.targetGoLiveDate || '',
                    ndaContractStatusFile: systemAccessRolesOthers?.ndaStatus || '',
                    termsAccepted: systemAccessRolesOthers?.termsAccepted || false,
                    clientLogoFile: systemAccessRolesOthers?.clientLogo || '',
                    adminEmails: (systemAccessRolesOthers?.adminRoleEmails || []).map((emailObj: any) => ({
                        adminEmail: emailObj?.email || emailObj,
                    })),
                    integrationExpectations: transformToIdArray(
                        systemAccessRolesOthers?.integrationExpectations || [],
                        'integrationExpectationId'
                    ),
                },
            };

            return payload;
        },
        [masterData, findItemById]
    );

    // Enhanced submit client onboarding with progress tracking
    const submitOnboarding = useCallback(
        async (formData: FormDataToPayload, progressCallback?: (progress: number) => void) => {
            setLoadingState(prev => ({ ...prev, submitting: true }));

            try {
                // Validate all form data before submitting
                const sections = ['organizationDetails', 'regulatoryPCI', 'addressLocation', 'commercialDetails', 'systemAccessRolesOthers'];
                let allValid = true;

                for (const section of sections) {
                    if (formData[section as keyof FormDataToPayload]) {
                        const isValid = validateFormData(formData[section as keyof FormDataToPayload], section);
                        if (!isValid) {
                            allValid = false;
                        }
                    }
                }

                if (!allValid) {
                    throw new Error('Form validation failed. Please check all required fields.');
                }

                progressCallback?.(25);

                // Pass the raw form data directly to Redux action
                // The Redux action will handle the transformation
                progressCallback?.(50);

                const result = await dispatch(submitClientOnboarding(formData) as any);

                progressCallback?.(90);

                if (result.type === 'clientOnboarding/submitClientOnboarding/fulfilled') {
                    showNotification('success', 'Client onboarding submitted successfully!');
                    progressCallback?.(100);
                    return result;
                } else {
                    throw new Error(result.payload || 'Failed to submit client onboarding');
                }
            } catch (error) {
                console.error('Error submitting client onboarding:', error);
                showNotification('error', error instanceof Error ? error.message : 'Failed to submit client onboarding');
                throw error;
            } finally {
                setLoadingState(prev => ({ ...prev, submitting: false }));
            }
        },
        [dispatch, validateFormData, showNotification]
    );

    // Enhanced fetch client data with caching
    const fetchClientData = useCallback(
        async (clientId: number, useCache = true) => {
            if (useCache && currentClient?.id === clientId) {
                return currentClient;
            }

            setLoadingState(prev => ({ ...prev, fetching: true }));

            try {
                const result = await dispatch(fetchClientOnboarding(clientId) as any);

                if (result.type === 'clientOnboarding/fetchClientOnboarding/fulfilled') {
                    showNotification('success', 'Client data loaded successfully');
                    return result.payload;
                } else {
                    throw new Error(result.payload || 'Failed to fetch client data');
                }
            } catch (error) {
                console.error('Error fetching client data:', error);
                showNotification('error', error instanceof Error ? error.message : 'Failed to fetch client data');
                throw error;
            } finally {
                setLoadingState(prev => ({ ...prev, fetching: false }));
            }
        },
        [dispatch, currentClient, showNotification]
    );

    // Enhanced error handling
    const clearErrorMessage = useCallback(() => {
        dispatch(clearError());
        setValidationErrors([]);
        if (notification?.type === 'error') {
            setNotification(null);
        }
    }, [dispatch, notification]);

    // Enhanced success handling
    const clearSubmitSuccessMessage = useCallback(() => {
        dispatch(clearSubmitSuccess());
        if (notification?.type === 'success') {
            setNotification(null);
        }
    }, [dispatch, notification]);

    // Set current client
    const setClient = useCallback((client: any) => {
        dispatch(setCurrentClient(client));
        showNotification('info', 'Client data updated');
    }, [dispatch, showNotification]);

    // Clear current client
    const clearClient = useCallback(() => {
        dispatch(clearCurrentClient());
        setValidationErrors([]);
        setNotification(null);
    }, [dispatch]);

    // Utility function to format form errors for display
    const formatValidationErrors = useCallback((errors: ValidationError[]) => {
        return errors.map(error => ({
            field: error.field.replace(/([A-Z])/g, ' $1').toLowerCase(),
            message: error.message
        }));
    }, []);

    // Check if master data is ready
    const isMasterDataReady = useMemo(() => {
        // Debug: log masterData to verify keys and lengths
        // Remove or comment out after debugging
        console.log('masterData:', masterData);

        // Check all required master data arrays are loaded and non-empty
        return masterDataLoaded &&
            masterData.industrySectors?.length > 0 &&
            masterData.geographiesOfOperation?.length > 0 &&
            masterData.orgCertifications?.length > 0 &&
            masterData.regulatoryFrameworks?.length > 0 &&
            masterData.countries?.length > 0 &&
            masterData.currencies?.length > 0 &&
            masterData.vendorVolumes?.length > 0 &&
            masterData.desiredModules?.length > 0 &&
            masterData.operationalRegions?.length > 0 &&
            masterData.integrationExpectations?.length > 0;
    }, [masterDataLoaded, masterData]);

    // Get loading message based on current state
    const getLoadingMessage = useMemo(() => {
        if (loadingState.masterData) return 'Loading master data...';
        if (loadingState.submitting) return 'Submitting client onboarding...';
        if (loadingState.fetching) return 'Fetching client data...';
        if (loadingState.validating) return 'Validating form data...';
        return '';
    }, [loadingState]);

    // Static dropdown options for new fields
    const staticDropdownOptions = useMemo(() => ({
        clientStatus: [
            { value: '1', label: 'Onboarded' },
            { value: '2', label: 'Active' },
            { value: '3', label: 'Inactive' },
            { value: '4', label: 'Suspended' }
        ],
        clientBusinessSize: [
            { value: '1', label: 'Micro' },
            { value: '2', label: 'Small' },
            { value: '3', label: 'Medium' },
            { value: '4', label: 'Large' },
            { value: '5', label: 'Enterprise' }
        ],
        clientSubscriptionTier: [
            { value: '1', label: 'Free' },
            { value: '2', label: 'Basic' },
            { value: '3', label: 'Pro' },
            { value: '4', label: 'Enterprise' }
        ]
    }), []);

    // Memoized dropdown options
    const dropdownOptions = useMemo(
        () => ({
            industrySectors: getDropdownOptions('industrySectors'),
            geographiesOfOperation: getDropdownOptions('geographiesOfOperation'),
            orgCertifications: getDropdownOptions('orgCertifications'),
            regulatoryFrameworks: getDropdownOptions('regulatoryFrameworks'),
            countries: getDropdownOptions('countries'),
            currencies: getDropdownOptions('currencies'),
            vendorVolumes: getDropdownOptions('vendorVolumes'),
            desiredModules: getDropdownOptions('desiredModules'),
            operationalRegions: getDropdownOptions('operationalRegions'),
            integrationExpectations: getDropdownOptions('integrationExpectations'),
            // Add static options
            ...staticDropdownOptions,
        }),
        [getDropdownOptions, staticDropdownOptions]
    );

    return {
        // State
        masterData,
        currentClient,
        isLoading,
        isSubmitting,
        error,
        submitSuccess,
        masterDataLoaded,
        dropdownOptions,

        // Enhanced state
        loadingState,
        validationErrors,
        notification,
        isMasterDataReady,
        getLoadingMessage,

        // Actions
        submitOnboarding,
        fetchClientData,
        clearErrorMessage,
        clearSubmitSuccessMessage,
        setClient,
        clearClient,

        // Enhanced actions
        validateFormData,
        showNotification,
        clearNotification,
        formatValidationErrors,
        fetchMasterDataWithRetry,

        // Utilities
        getDropdownOptions,
        findItemById,
        transformFormDataToPayload,

        // Settings
        setAutoRetryEnabled,
        retryCount,
        autoRetryEnabled,
    };
};