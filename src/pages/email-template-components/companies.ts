import { companyService } from './companyService';
import { Company } from './index';
// import { companyService } from './companyService';

// Legacy export for backward compatibility
export const companies: Company[] = companyService.getStaticCompanies();

// Enhanced function that checks both static and dynamic companies
export const getCompanyById = async (id: string): Promise<Company | undefined> => {
  return companyService.getCompanyById(id);
};

// Synchronous version for backward compatibility (only checks static companies)
export const getCompanyByIdSync = (id: string): Company | undefined => {
  return companies.find(company => company.id === id);
};

// Get all companies (static + dynamic)
export const getAllCompanies = async (): Promise<Company[]> => {
  return companyService.getAllCompanies();
};
