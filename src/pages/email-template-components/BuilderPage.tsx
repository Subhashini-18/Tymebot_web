import { useState, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';
import CompanySelector from './CompanySelector';
import PropsEditor from './PropsEditor';
import EmailPreview from './EmailPreview';
import EmailSender from './EmailSender';
import EmailTester from './EmailTester';
import { templates, getTemplateById } from './templates';
import { companies } from './companies';
import { renderEmailPreview } from './emailRenderer';
import { apiService } from '../../services/api/apiservice';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, Sparkles, Palette, Zap, Mail, Save, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { companyService } from './companyService';

interface SubmitModalData {
  layoutName: string;
  layoutHtml: string;
  description: string;
  isActive: boolean;
}

export default function BuilderPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [selectedCompanyId, setSelectedCompanyId] = useState('meta');
  const [templateProps, setTemplateProps] = useState<Record<string, any>>({});

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitData, setSubmitData] = useState<SubmitModalData>({
    layoutName: '',
    layoutHtml: '',
    description: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log(companyService.getAllCompanies())
  const selectedTemplate: any = getTemplateById(selectedTemplateId);
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fetch companies on mount to ensure API call is made
  useEffect(() => {
    companyService.getAllCompanies()
  }, []);

  // Initialize template props when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialProps: Record<string, any> = {};
      selectedTemplate.propDefinitions.forEach((prop: any) => {
        initialProps[prop.name] = prop.defaultValue !== undefined ? prop.defaultValue : null;
      });
      setTemplateProps(initialProps);
    }
  }, [selectedTemplateId]);

  const handleCreateTemplate = () => {
    // Always start from scratch: pass empty blocks and optionally other metadata
    navigate('/editor/new', {
      state: {
        blocks: { header: [], body: [], footer: [] },
        // Optionally add: name, category, etc.
      }
    });
  };

  // Generate preview HTML for selected template (async version)
  const generatePreviewHtml = async () => {
    if (!selectedTemplate || !selectedCompanyId) return '<div>Loading...</div>';

    try {
      const { renderEmailPreviewAsync } = await import('./emailRenderer');
      return await renderEmailPreviewAsync(selectedTemplateId, selectedCompanyId, templateProps);
    } catch (error) {
      console.error('Error generating preview:', error);
      return '<div>Error generating preview</div>';
    }
  };

  // Handle submit template
  const handleSubmitTemplate = async () => {
    const htmlContent = await generatePreviewHtml();
    const { companyService } = await import('./companyService');
    const company = await companyService.getCompanyById(selectedCompanyId);

    setSubmitData({
      layoutName: `${selectedTemplate.name} - ${company?.name || 'Company'}`,
      layoutHtml: htmlContent,
      description: selectedTemplate.description,
      isActive: true
    });
    setShowSubmitModal(true);
  };

  // Handle form submission to backend
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.post(`${import.meta.env.VITE_EMAIL_API_PATH}/create_email_layout`, submitData, import.meta.env.VITE_EMAIL_PORT);
      showToast({
        message: 'Email template saved successfully!',
        type: 'success'
      });
      setShowSubmitModal(false);
      setSubmitData({
        layoutName: '',
        layoutHtml: '',
        description: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error saving template:', error);
      showToast({
        message: 'Failed to save email template',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Action Buttons - Top Right */}
        <div className="w-full flex justify-end gap-4 mb-2">
          <button
            onClick={() => navigate(`/editor/${selectedTemplateId}?companyId=${selectedCompanyId}`)}
            className="group relative px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 flex items-center gap-2 shadow-lg"
            title="Edit current template"
          >
            <Edit size={18} className="text-gray-600 group-hover:text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Edit</span>
          </button>

          <button
            onClick={handleSubmitTemplate}
            className="group relative px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
            title="Submit template to backend"
          >
            <Save size={18} className="text-white" />
            <span className="text-sm font-medium">Submit</span>
          </button>

          <button
            onClick={handleCreateTemplate}
            className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            title="Create new template from scratch"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Button Content */}
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <Plus className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-90" />
                <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
              </div>
              <span className="text-white font-semibold text-sm">Create Template</span>
              <Zap className="w-4 h-4 text-white/80 transition-all duration-300 group-hover:text-yellow-300 group-hover:scale-110" />
            </div>

            {/* Sparkle Effect */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">
              <Sparkles className="w-2 h-2 text-yellow-600" />
            </div>
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Template Settings</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <TemplateSelector
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={setSelectedTemplateId}
                />

                <CompanySelector

                  selectedCompanyId={selectedCompanyId}
                  onSelectCompany={setSelectedCompanyId}
                />

                {/* <EmailSender
                  templateId={selectedTemplateId}
                  companyId={selectedCompanyId}
                  props={templateProps}
                  template={selectedTemplate}
                /> */}
              </div>
            </div>
          </div>

          {/* Right Main Area - Preview & Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Live Preview
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-[600px] relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                  {/* Edit Template Button Overlay */}
                  {/* <button
                    className="absolute top-4 right-4 z-10 group bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-3 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    title="Edit template layout"
                    onClick={() => navigate(`/editor/${selectedTemplateId}`)}
                  >
                    <Edit size={18} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                    <div className="absolute inset-0 bg-indigo-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
                  </button> */}

                  <EmailPreview
                    templateId={selectedTemplateId}
                    companyId={selectedCompanyId}
                    props={templateProps}
                  />
                </div>
              </div>
            </div>

            {/* Props Editor Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Template Properties</h2>
                </div>
              </div>
              <div className="p-6">
                <PropsEditor
                  template={selectedTemplate}
                  props={templateProps}
                  onPropsChange={setTemplateProps}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Tester Component */}
      <EmailTester
        templateId={selectedTemplateId}
        companyId={selectedCompanyId}
        templateProps={templateProps}
      />

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Save Email Template</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Name *
                </label>
                <input
                  type="text"
                  required
                  value={submitData.layoutName}
                  onChange={(e) => setSubmitData(prev => ({ ...prev, layoutName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter layout name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout HTML (Generated)
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <code className="text-xs text-gray-600 whitespace-pre-wrap">
                    {submitData.layoutHtml.substring(0, 500)}...
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This HTML is automatically generated from the selected template and company branding.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={submitData.description}
                  onChange={(e) => setSubmitData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={submitData.isActive}
                  onChange={(e) => setSubmitData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Status
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
