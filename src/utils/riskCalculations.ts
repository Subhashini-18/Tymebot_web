import { FormData, RiskAssessment } from '../types/FormTypes';
import { highRiskCountries } from '../data/formOptions';

export function calculateRiskAssessment(formData: FormData): RiskAssessment {
  const risks = {
    regulatoryRisk: false,
    financialRisk: false,
    operationalRisk: false,
    reputationalRisk: false
  };

  // Regulatory Risk Calculation
  const hasPersonalData = formData?.dataAccessTypes?.some(type =>
    ['Personal Data', 'Health/Medical Data', 'Financial Data'].includes(type)
  );
  const hasGDPRHIPAA = formData?.applicableFrameworks?.some(framework =>
    framework?.includes('GDPR') || framework?.includes('HIPAA')
  );

  if ((hasPersonalData && formData?.crossBorderTransfer) || hasGDPRHIPAA) {
    risks.regulatoryRisk = true;
  }

  // Financial Risk Calculation
  if (formData?.contractValue > 25000000 || // >25L value
    formData?.dataAccessTypes?.includes('Financial Data')) {
    risks.financialRisk = true;
  }

  // Operational Risk Calculation
  if (formData?.systemAccessRequired ||
    formData?.dataHostingArrangement?.some(arr => arr.includes('Cloud') || arr?.includes('Third Party'))) {
    risks.operationalRisk = true;
  }

  // Reputational Risk Calculation
  if (formData?.litigationAdverseMedia ||
    formData?.fourthPartyInvolved ||
    formData?.sanctionedCountryAffiliation ||
    formData?.onSanctionLists) {
    risks.reputationalRisk = true;
  }

  // Calculate Inherent Risk Score (1-3 Scale)
  const inherentRiskFactors = {
    // Data Sensitivity (1-3)
    dataSensitivity: calculateDataSensitivityScore(formData?.dataAccessTypes),

    // Data Volume (1-3)
    dataVolume: calculateDataVolumeScore(formData?.dataVolume),

    // System Access (1-3)
    systemAccess: calculateSystemAccessScore(
      formData?.systemAccessRequired,
      formData?.systemAccessType
    ),

    // Geography (1-3)
    geography: calculateGeographyRisk(formData?.countryOfOperations),

    // Business Criticality (1-3)
    businessCriticality: calculateBusinessCriticalityScore(
      formData?.businessDisruption,
      formData?.businessDisruptionDescription
    ),

    // Prior Incidents (1-3)
    priorIncidents: calculatePriorIncidentsScore(formData?.knownRisks),
  };

  // Calculate average Inherent Risk Score (sum of scores / number of factors)
  const inherentScore = Object.values(inherentRiskFactors).reduce((a, b) => a + b, 0) / 6;

  // Helper functions for individual risk factor scoring
  function calculateDataSensitivityScore(dataTypes: string[] = []): number {
    if (dataTypes?.includes('Health/Medical Data') || dataTypes?.includes('Personal Data')) return 3;
    if (dataTypes?.includes('Financial Data')) return 2;
    return 1;
  }

  function calculateSystemAccessScore(required: boolean, type: string = ''): number {
    if (required && (type?.toLowerCase().includes('api') || type?.toLowerCase().includes('remote'))) return 3;
    if (required) return 2;
    return 1;
  }

  function calculateGeographyRisk(country: string = ''): number {
    if (highRiskCountries.includes(country)) return 3;
    if (!['US', 'UK', 'EU'].includes(country)) return 2; // Non-GDPR adequate countries
    return 1;
  }

  function calculateBusinessCriticalityScore(hasDisruption: boolean, description: string = ''): number {
    if (hasDisruption && description?.toLowerCase().includes('critical')) return 3;
    if (hasDisruption) return 2;
    return 1;
  }

  function calculatePriorIncidentsScore(hasKnownRisks: boolean): number {
    return hasKnownRisks ? 3 : 1;
  }

  // Data Volume (records/year) scoring helper (1-3)
  function calculateDataVolumeScore(volumeLabel: string = ''): number {
    const label = volumeLabel?.toLowerCase() || '';

    // Try to parse numeric volume if present
    const numbers = (label.match(/\d+[\d,]*/g) || []).map(n => parseInt(n.replace(/,/g, ''), 10));
    if (numbers.length) {
      const max = Math.max(...numbers);
      if (max >= 1_000_000) return 3;
      if (max >= 100_000) return 2;
      return 1;
    }

    // Fallback to keyword-based mapping
    if (label.includes('>1m') || label.includes('very high') || label.includes('>1m') || label.includes('million')) return 3;
    if (label.includes('high') || label.includes('100,000') || label.includes('100000') || label.includes('1m') || label.includes('1,000,000')) return 2;
    return 1; // default Low
  }

  // Calculate Control Effectiveness Score (1-3 scale)
  const controlEffectivenessFactors = {
    // Technical Controls (1-3)
    technicalControls: calculateTechnicalControlScore(formData?.vendorCertifications),

    // Process Controls (1-3)
    processControls: calculateProcessControlScore(formData?.applicableFrameworks),

    // Contractual Controls (1-3)
    contractualControls: calculateContractualControlScore(formData),

    // Supply Chain Risk (1-3)
    supplyChainRisk: calculateSupplyChainRiskScore(formData),

    // Audit History (1-3)
    auditHistory: calculateAuditHistoryScore(formData?.vendorCertifications)
  };

  // Calculate average Control Effectiveness Score
  const controlScore: any = Object.values(controlEffectivenessFactors).reduce((a, b) => a + b, 0) / 5;

  function calculateTechnicalControlScore(certifications: string[] = []): number {
    if (certifications?.includes('ISO 27001 Certified')) return 3;
    if (certifications?.length > 0) return 2;
    return 1;
  }

  function calculateProcessControlScore(frameworks: string[] = []): number {
    if (frameworks?.some(f => f.includes('HIPAA') || f.includes('ISO'))) return 3;
    if (frameworks?.length > 0) return 2;
    return 1;
  }

  function calculateContractualControlScore(data: FormData): number {
    const hasDPA = data?.contractType === 'full' || data?.contractDuration === '>12';
    const hasSLA = data?.businessDisruption === true;
    if (hasDPA && hasSLA) return 3;
    if (hasDPA || hasSLA) return 2;
    return 1;
  }

  function calculateSupplyChainRiskScore(data: FormData): number {
    if (!data?.fourthPartyInvolved && !data?.crossBorderTransfer) return 3;
    if (data?.fourthPartyInvolved && data?.crossBorderTransfer) return 1;
    return 2; // Mixed geography, moderate risk
  }

  function calculateAuditHistoryScore(certifications: string[] = []): number {
    if (certifications?.includes('SOC 2 Type II') || certifications?.length >= 3) return 3;
    if (certifications?.length > 0) return 2;
    return 1;
  }

  // Determine Control Effectiveness Level
  const getControlEffectivenessLevel = (score: number): string => {
    if (score >= 2.6) return 'Strong';
    if (score >= 2.0) return 'Moderate';
    return 'Weak';
  };

  // Calculate Residual Risk Score using division method
  const residualScore = Math.round((inherentScore / controlScore) * 100) / 100;

  // Get Residual Risk Level
  const getResidualRiskLevel = (score: number): string => {
    if (score >= 1.5) return 'High';
    if (score >= 1.0) return 'Medium';
    return 'Low';
  };

  // Determine Risk Tier and Review Frequency using both inherent and residual risk
  const determineRiskTier = (inherent: number, residual: number): {
    tier: string;
    frequency: string;
    actions: string[];
  } => {
    if (inherent >= 2.5 && residual >= 1.0) {
      return {
        tier: 'Tier 1 - Critical',
        frequency: 'Annual',
        actions: [
          'Maintain SLAs and DPA enforcement',
          'Monitor any changes in processing volumes or cross-border arrangements',
          'Regular compliance attestation required',
          'Quarterly performance reviews'
        ]
      };
    }

    if (inherent >= 2.0 && inherent < 2.5 && residual >= 1.0 && residual < 1.5) {
      return {
        tier: 'Tier 2 - High',
        frequency: 'Semi-Annual',
        actions: [
          'Review SLAs and controls annually',
          'Monitor service performance metrics',
          'Semi-annual compliance checks'
        ]
      };
    }

    if (inherent >= 1.5 && inherent < 2.0 && residual < 1.0) {
      return {
        tier: 'Tier 3 - Medium',
        frequency: 'Annual',
        actions: [
          'Standard monitoring with periodic reviews',
          'Annual compliance attestation'
        ]
      };
    }

    if (inherent < 1.5 && residual < 1.0) {
      return {
        tier: 'Tier 4 - Low',
        frequency: 'Bi-Annual',
        actions: [
          'Basic monitoring',
          'Biennial review'
        ]
      };
    }

    // Fallback classification
    return {
      tier: 'Tier 3 - Medium',
      frequency: 'Annual',
      actions: [
        'Standard monitoring with periodic reviews',
        'Annual compliance attestation'
      ]
    };
  };

  const riskTierInfo: any = determineRiskTier(inherentScore, residualScore);

  // Determine if onboarding should proceed
  const proceedWithOnboarding = residualScore < 1.5 &&
    !formData?.onSanctionLists &&
    !formData?.optOutDueDiligence;

  return {
    ...risks,
    inherentRiskScore: Math.round(inherentScore * 100) / 100,
    controlEffectivenessScore: Math.round(controlScore * 100) / 100,
    controlEffectivenessLevel: getControlEffectivenessLevel(controlScore),
    residualRiskScore: residualScore,
    residualRiskLevel: getResidualRiskLevel(residualScore),
    vendorTier: riskTierInfo.tier,
    reviewFrequency: riskTierInfo.frequency,
    recommendedActions: riskTierInfo.actions,
    proceedWithOnboarding,
    riskMetrics: {
      inherentRisk: {
        score: inherentScore,
        level: getRiskLevel(inherentScore)
      },
      controlEffectiveness: {
        score: controlScore,
        level: getControlEffectivenessLevel(controlScore)
      },
      residualRisk: {
        score: residualScore,
        level: getResidualRiskLevel(residualScore)
      }
    }
  };
}

// Update getRiskLevel to match new scoring scale (1-3)
export function getRiskLevel(score: number): string {
  if (score >= 2.5) return 'High';
  if (score >= 1.5) return 'Medium';
  return 'Low';
}

// Update getRiskColor for new scoring scale
export function getRiskColor(score: number): string {
  if (score >= 2.5) return 'text-red-600 bg-red-50 border-red-200';
  if (score >= 2.0) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-green-600 bg-green-50 border-green-200';
}