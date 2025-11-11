import { Company } from './index';
import { apiService } from '../../services/api/apiservice';

// API Response interfaces
interface TenantBrandingData {
  id: number;
  logoUrl: string;
  tagline: string;
  isActive: boolean;
  tenantId: number;
  tenantName: string;
  colorScheme: string;
  auditTrailId: number | null;
}

interface TenantBrandingResponse {
  data: TenantBrandingData[];
  isSuccess: boolean;
  status: number;
}

// Static fallback companies (existing ones)
const staticCompanies: Company[] = [
  {
    id: 'meta',
    name: 'Meta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png',
    primaryColor: '#0668E1',
    secondaryColor: '#E4F0FD',
    footerText: '© 2025 Meta Platforms, Inc. All rights reserved.',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'google',
    name: 'Google',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/368px-Google_2015_logo.svg.png',
    primaryColor: '#4285F4',
    secondaryColor: '#F1F3F4',
    footerText: '© 2025 Google LLC. All rights reserved.',
    socialLinks: {
      twitter: 'https://twitter.com/google',
      linkedin: 'https://linkedin.com/company/google'
    }
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
    primaryColor: '#FF9900',
    secondaryColor: '#FAFAFA',
    footerText: '© 2025, Amazon.com, Inc. or its affiliates. All rights reserved.',
    socialLinks: {
      facebook: 'https://facebook.com/amazon',
      twitter: 'https://twitter.com/amazon'
    }
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
    primaryColor: '#0078D4',
    secondaryColor: '#F2F2F2',
    footerText: '© 2025 Microsoft Corporation. All rights reserved.',
    socialLinks: {
      facebook: 'https://facebook.com/microsoft',
      twitter: 'https://twitter.com/microsoft',
      linkedin: 'https://linkedin.com/company/microsoft'
    }
  },
  {
    id: 'apple',
    name: 'Apple',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/219px-Apple_logo_black.svg.png',
    primaryColor: '#000000',
    secondaryColor: '#F5F5F7',
    footerText: '© 2025 Apple Inc. All rights reserved.',
    socialLinks: {
      twitter: 'https://twitter.com/apple'
    }
  }
];

class CompanyService {
  private static instance: CompanyService;
  private dynamicCompanies: Company[] = [];
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() { }

  static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  // Color scheme mapping
  private getColorsFromScheme(colorScheme: string) {
    const schemes: Record<string, { primary: string; secondary: string }> = {
      'Green': { primary: '#10B981', secondary: '#D1FAE5' },
      'Blue': { primary: '#3B82F6', secondary: '#DBEAFE' },
      'Purple': { primary: '#8B5CF6', secondary: '#EDE9FE' },
      'Red': { primary: '#EF4444', secondary: '#FEE2E2' },
      'Orange': { primary: '#F59E0B', secondary: '#FEF3C7' },
      'Pink': { primary: '#EC4899', secondary: '#FCE7F3' },
      'Indigo': { primary: '#6366F1', secondary: '#E0E7FF' },
      'Gray': { primary: '#6B7280', secondary: '#F3F4F6' },
    };
    return schemes[colorScheme] || schemes['Blue'];
  }

  // Transform API data to Company interface
  private transformTenantToCompany(tenant: TenantBrandingData): Company {
    const colors = this.getColorsFromScheme(tenant.colorScheme);
    return {
      id: tenant.tenantId.toString(),
      name: tenant.tenantName,
      logoUrl: tenant.logoUrl,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      footerText: `© ${new Date().getFullYear()} ${tenant.tenantName}. All rights reserved.`,
      socialLinks: {
        // You can add default social links or fetch them from another endpoint
      }
    };
  }

  // Load dynamic companies from API
  private async loadDynamicCompanies(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return this.loadPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadPromise = this.fetchCompanies();

    try {
      await this.loadPromise;
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load dynamic companies:', error);
      // Continue with static companies only
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchCompanies(): Promise<void> {
    try {
      const response = await apiService.get<TenantBrandingResponse>(
        `${import.meta.env.VITE_TENANT_API_PATH}/get_all_tenant_branding`,
        {},
        import.meta.env.VITE_BASE_TENANT_PORT
      );

      if (response.isSuccess && response.data) {
        // Filter only active tenants and transform to Company format
        this.dynamicCompanies = response.data
          .filter(tenant => tenant.isActive)
          .map(tenant => this.transformTenantToCompany(tenant));
      }
    } catch (error) {
      console.error('Error fetching companies from API:', error);
      throw error;
    }
  }

  // Get all companies (static + dynamic)
  async getAllCompanies(): Promise<Company[]> {
    await this.loadDynamicCompanies();
    return [...staticCompanies, ...this.dynamicCompanies];
  }

  // Get company by ID (checks both static and dynamic)
  async getCompanyById(id: string): Promise<Company | undefined> {
    await this.loadDynamicCompanies();

    // First check static companies
    const staticCompany = staticCompanies.find(c => c.id === id);
    if (staticCompany) {
      return staticCompany;
    }

    // Then check dynamic companies
    return this.dynamicCompanies.find(c => c.id === id);
  }

  // Get only dynamic companies
  async getDynamicCompanies(): Promise<Company[]> {
    await this.loadDynamicCompanies();
    return this.dynamicCompanies;
  }

  // Get only static companies
  getStaticCompanies(): Company[] {
    return staticCompanies;
  }

  // Force refresh dynamic companies
  async refreshDynamicCompanies(): Promise<Company[]> {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.dynamicCompanies = [];

    await this.loadDynamicCompanies();
    return this.dynamicCompanies;
  }

  // Check if a company is dynamic (from API)
  async isDynamicCompany(id: string): Promise<boolean> {
    await this.loadDynamicCompanies();
    return this.dynamicCompanies.some(c => c.id === id);
  }

  // Get company with fallback to static if dynamic not found
  async getCompanyWithFallback(id: string): Promise<Company | undefined> {
    const company = await this.getCompanyById(id);
    if (company) {
      return company;
    }

    // If not found, try to find a similar static company as fallback
    // This is useful when templates reference static companies but user selects dynamic ones
    const staticFallback = staticCompanies.find(c =>
      c.name.toLowerCase().includes(id.toLowerCase()) ||
      id.toLowerCase().includes(c.name.toLowerCase())
    );

    return staticFallback || staticCompanies[0]; // Return first static company as ultimate fallback
  }
}

// Export singleton instance
export const companyService = CompanyService.getInstance();

// Export for backward compatibility
export const getCompanyById = async (id: string): Promise<Company | undefined> => {
  return companyService.getCompanyById(id);
};

export const getAllCompanies = async (): Promise<Company[]> => {
  return companyService.getAllCompanies();
};