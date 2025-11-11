export interface FormData {
  // Section 1: Third Party Information
  thirdPartyLegalName?: string;
  countryOfOperations?: string;
  websiteUrl?: string;
  spocName?: string;
  spocEmail?: string;
  spocPhone?: string;
  selectedThirdPartyCategories?: string[];
  thirdPartyTypes?: string[];
  thirdPartyTypeOther?: string;
  natureOfThirdParty?: 'established' | 'new' | 'other';
  natureOther?: string;
  dataHostingArrangement?: string[];

  // Section 2: Nature of Engagement
  serviceDescription: string;
  expectedStartDate: string;
  contractValue: number;
  contractCurrency: string;
  contractType: 'poc' | 'pilot' | 'full' | 'renewal';
  contractDuration: '<6' | '6-12' | '>12';
  isRenewal: boolean;
  existingThirdPartyId: string;
  fourthPartyInvolved: boolean;
  fourthPartyName: string;
  fourthPartyNature: string;

  // Section 3: Data & System Access
  dataAccessTypes: string[];
  dataClassification: string[];
  personalDataTypes: string[];
  dataVolume: string;
  personalDataVolume: string;
  systemAccessRequired: boolean;
  systemAccessType: string;

  // Section 4: Risk Considerations
  crossBorderTransfer: boolean;
  transferCountries: string;
  knownRisks: boolean;
  knownRisksDescription: string;
  businessDisruption: boolean;
  businessDisruptionDescription: string;
  customerImpact: boolean;
  customerImpactDescription: string;
  replaceability: 'easy' | 'difficult';
  itInfrastructureAccess: boolean;
  itInfrastructureDescription: string;
  internationalDelivery: boolean;
  internationalDeliveryDescription: string;

  // Section 5: Compliance & Security
  applicableFrameworks: string[];
  vendorCertifications: string[];

  // Section 6: Reputational & Sanctions Screening
  sanctionedCountryAffiliation: boolean;
  sanctionedCountryDetails: string;
  onSanctionLists: boolean;
  litigationAdverseMedia: boolean;
  litigationDescription: string;

  // Section 7: Supporting Documents
  supportingDocuments: File[];
  additionalComments: string;
  expectedTimeline: string;
  optOutDueDiligence: boolean;
}

export interface RiskAssessment {
  regulatoryRisk: boolean;
  financialRisk: boolean;
  operationalRisk: boolean;
  reputationalRisk: boolean;
  inherentRiskScore: number;
  controlEffectivenessScore: number;
  controlEffectivenessLevel: string; // Add this line
  residualRiskScore: number;
  residualRiskLevel: string; // Add this line
  vendorTier: string;
  reviewFrequency: string;
  recommendedActions: string[];
  proceedWithOnboarding: boolean;
  riskMetrics: {
    inherentRisk: {
      score: number;
      level: string;
    };
    controlEffectiveness: {
      score: number;
      level: string;
    };
    residualRisk: {
      score: number;
      level: string;
    };
  };
}
export interface TimelineItem {
    date: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}