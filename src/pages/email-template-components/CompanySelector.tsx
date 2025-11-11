import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Company } from './index';
import { companyService } from './companyService';
// import { companyService } from './companyService';



interface CompanySelectorProps {
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
}

export default function CompanySelector({ selectedCompanyId, onSelectCompany }: CompanySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dynamicCompanyIds, setDynamicCompanyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies using the company service
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all companies (static + dynamic)
      const allCompanies = await companyService.getAllCompanies();
      const dynamicCompanies = await companyService.getDynamicCompanies();

      setCompanies(allCompanies);
      setDynamicCompanyIds(new Set(dynamicCompanies.map(c => c.id)));
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.message || 'Failed to load companies');

      // Fallback to static companies only
      const staticCompanies = companyService.getStaticCompanies();
      setCompanies(staticCompanies);
      setDynamicCompanyIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Refresh companies (useful for dynamic companies)
  const refreshCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Force refresh dynamic companies
      await companyService.refreshDynamicCompanies();
      const allCompanies = await companyService.getAllCompanies();
      const dynamicCompanies = await companyService.getDynamicCompanies();

      setCompanies(allCompanies);
      setDynamicCompanyIds(new Set(dynamicCompanies.map(c => c.id)));
    } catch (err: any) {
      console.error('Error refreshing companies:', err);
      setError(err.message || 'Failed to refresh companies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Company Branding</h3>
            <p className="mt-1 text-sm text-gray-600">Select a company for your email</p>
          </div>
          <button
            onClick={refreshCompanies}
            className={`p-2 text-gray-400 hover:text-gray-600 transition-colors ${loading ? 'animate-spin' : ''}`}
            title="Refresh companies"
            disabled={loading}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[250px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={24} className="animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading companies...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={refreshCompanies}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyItem
              key={company.id}
              company={company}
              isSelected={company.id === selectedCompanyId}
              isDynamic={dynamicCompanyIds.has(company.id)}
              onSelect={() => onSelectCompany(company.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No companies found matching your search.' : 'No companies available.'}
          </div>
        )}
      </div>

      {selectedCompany && !loading && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Selected Brand Preview</h4>
          <div className="mt-3 flex items-center space-x-3">
            <img
              src={selectedCompany.logoUrl}
              alt={selectedCompany.name}
              className="w-8 h-8 object-contain rounded"
              onError={(e) => {
                // Fallback if logo fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-sm font-medium text-gray-900">{selectedCompany.name}</div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: selectedCompany.primaryColor }}
              ></div>
              <div className="text-sm text-gray-600">Primary: {selectedCompany.primaryColor}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: selectedCompany.secondaryColor }}
              ></div>
              <div className="text-sm text-gray-600">Secondary: {selectedCompany.secondaryColor}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompanyItemProps {
  company: Company;
  isSelected: boolean;
  isDynamic: boolean;
  onSelect: () => void;
}

function CompanyItem({ company, isSelected, isDynamic, onSelect }: CompanyItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500 shadow-sm' : ''
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 relative">
          {!imageError ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="h-8 w-8 object-contain rounded border border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-8 w-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">
                {company.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isDynamic && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" title="Dynamic Company"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">{company.name}</h4>
            {isDynamic && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: company.primaryColor }}
            ></div>
            <span className="text-xs text-gray-500 truncate">
              {company.primaryColor}
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
