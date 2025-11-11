import { RootState } from '../store';

export const transformFormDataToPayload = (formData: any) => {
  const {
    organizationDetails,
    regulatoryPCI,
    addressLocation,
    commercialDetails,
    systemAccessRolesOthers,
  } = formData;

  return {
    organizationName: organizationDetails?.organizationName || '',
    industrySectorId: parseInt(organizationDetails?.industrySector) || 0,
    briefAboutCompany: organizationDetails?.briefAboutCompany || '',
    yearOfIncorporation: organizationDetails?.yearOfIncorporation || '',
    registrationNumber: organizationDetails?.registrationNumber || '',
    primaryRegistration: organizationDetails?.primaryRegistration || '',
    website: organizationDetails?.website || '',
    
    geographiesOfOperation: organizationDetails?.geographiesOfOperations
      ? organizationDetails.geographiesOfOperations.map((geo: string) => ({
          geographyOfOperationId: parseInt(geo) || 0,
        }))
      : [],
    
    orgCertifications: organizationDetails?.certifications
      ? organizationDetails.certifications.map((cert: string) => ({
          orgCertificationId: parseInt(cert) || 0,
          certificationNumber: '',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
        }))
      : [],
    
    regulatoryFrameworks: regulatoryPCI?.regulatoryFrameworks
      ? regulatoryPCI.regulatoryFrameworks.map((framework: string) => ({
          regulatoryFrameworkId: parseInt(framework) || 0,
        }))
      : [],
    
    address: {
      streetAddress1: addressLocation?.streetAddress1 || '',
      streetAddress2: addressLocation?.streetAddress2 || '',
      city: addressLocation?.city || '',
      stateProvince: addressLocation?.state || '',
      zipPostalCode: addressLocation?.zipCode || '',
      countryId: parseInt(addressLocation?.country) || 0,
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
      currencyId: parseInt(commercialDetails?.currency) || 0,
      billingEmail: commercialDetails?.billingEmail || '',
      numberOfUsers: parseInt(commercialDetails?.numberOfUsers) || 0,
      vendorVolumeId: parseInt(commercialDetails?.expectedVendorVolume) || 0,
      desiredModules: commercialDetails?.desiredModules
        ? commercialDetails.desiredModules.map((module: string) => ({
            desiredModuleId: parseInt(module) || 0,
          }))
        : [],
      operationalRegions: commercialDetails?.operationalRegions
        ? commercialDetails.operationalRegions.map((region: string) => ({
            operationalRegionId: parseInt(region) || 0,
          }))
        : [],
    },
    
    systemAccess: {
      isIso27001Certified: systemAccessRolesOthers?.isISO27001Certified === 'yes',
      targetGoLiveDate: systemAccessRolesOthers?.targetGoLiveDate || '',
      ndaContractStatusFile: systemAccessRolesOthers?.ndaStatus || '',
      termsAccepted: systemAccessRolesOthers?.termsAccepted || false,
      clientLogoFile: systemAccessRolesOthers?.clientLogo || '',
      adminEmails: systemAccessRolesOthers?.adminRoleEmails
        ? systemAccessRolesOthers.adminRoleEmails
            .filter((email: string) => email && email.trim())
            .map((email: string) => ({ adminEmail: email.trim() }))
        : [],
      integrationExpectations: systemAccessRolesOthers?.integrationExpectations
        ? systemAccessRolesOthers.integrationExpectations.map((expectation: string) => ({
            integrationExpectationId: parseInt(expectation) || 0,
          }))
        : [],
    },
  };
};

export const transformPayloadToFormData = (payload: any) => {
  return {
    organizationDetails: {
      organizationName: payload.organizationName || '',
      industrySector: payload.industrySectorId?.toString() || '',
      briefAboutCompany: payload.briefAboutCompany || '',
      yearOfIncorporation: payload.yearOfIncorporation || '',
      registrationNumber: payload.registrationNumber || '',
      primaryRegistration: payload.primaryRegistration || '',
      website: payload.website || '',
      geographiesOfOperations: payload.geographiesOfOperation?.map((geo: any) => geo.geographyOfOperationId?.toString()) || [],
      certifications: payload.orgCertifications?.map((cert: any) => cert.orgCertificationId?.toString()) || [],
    },
    regulatoryPCI: {
      regulatoryFrameworks: payload.regulatoryFrameworks?.map((framework: any) => framework.regulatoryFrameworkId?.toString()) || [],
      primaryContactName: payload.primaryContact?.primaryContactName || '',
      primaryContactDesignation: payload.primaryContact?.designation || '',
      primaryContactEmail: payload.primaryContact?.emailAddress || '',
      primaryContactNumber: payload.primaryContact?.contactNumber || '',
      alternateContact: payload.primaryContact?.alternateContact || '',
    },
    addressLocation: {
      streetAddress1: payload.address?.streetAddress1 || '',
      streetAddress2: payload.address?.streetAddress2 || '',
      city: payload.address?.city || '',
      state: payload.address?.stateProvince || '',
      zipCode: payload.address?.zipPostalCode || '',
      country: payload.address?.countryId?.toString() || '',
      gstVatNumber: payload.address?.gstVatNumber || '',
    },
    commercialDetails: {
      panEinTaxId: payload.commercialDetails?.panEinTaxId || '',
      currency: payload.commercialDetails?.currencyId?.toString() || '',
      billingEmail: payload.commercialDetails?.billingEmail || '',
      numberOfUsers: payload.commercialDetails?.numberOfUsers?.toString() || '',
      expectedVendorVolume: payload.commercialDetails?.vendorVolumeId?.toString() || '',
      desiredModules: payload.commercialDetails?.desiredModules?.map((module: any) => module.desiredModuleId?.toString()) || [],
      operationalRegions: payload.commercialDetails?.operationalRegions?.map((region: any) => region.operationalRegionId?.toString()) || [],
    },
    systemAccessRolesOthers: {
      adminRoleEmails: payload.systemAccess?.adminEmails?.map((email: any) => email.adminEmail) || [''],
      isISO27001Certified: payload.systemAccess?.isIso27001Certified ? 'yes' : 'no',
      integrationExpectations: payload.systemAccess?.integrationExpectations?.map((expectation: any) => expectation.integrationExpectationId?.toString()) || [],
      targetGoLiveDate: payload.systemAccess?.targetGoLiveDate || '',
      ndaStatus: payload.systemAccess?.ndaContractStatusFile || null,
      termsAccepted: payload.systemAccess?.termsAccepted || false,
      clientLogo: payload.systemAccess?.clientLogoFile || null,
    },
  };
};