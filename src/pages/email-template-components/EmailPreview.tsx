import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Code, Copy, Download, Eye, Monitor, Smartphone, Edit, RefreshCw } from 'lucide-react';
import { templates } from './templates';
import DynamicEmailRenderer from './DynamicEmailRenderer';

interface EmailPreviewProps {
  templateId: string;
  companyId: string;
  props: Record<string, any>;
}

export default function EmailPreview({ templateId, companyId, props }: EmailPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  const template = templates.find(t => t.id === templateId);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(renderedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([renderedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateId}-${companyId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refreshPreview = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DynamicEmailRenderer
      key={refreshKey}
      templateId={templateId}
      companyId={companyId}
      props={props}
      onRender={setRenderedHtml}
    >
      {(html, loading, error, company) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
                {company && (
                  <div className="flex items-center gap-2">
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-6 h-6 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">{company.name}</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {template ? template.name : 'Select a template'}
                {company && ` • ${company.name} branding`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={refreshPreview}
                className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Refresh preview"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>

              <div className="flex rounded-md shadow-sm mr-2" role="group">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium ${viewportMode === 'desktop'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-300 rounded-l-md`}
                  onClick={() => setViewportMode('desktop')}
                >
                  <Monitor size={16} />
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium ${viewportMode === 'mobile'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-r border-t border-b border-gray-300 rounded-r-md`}
                  onClick={() => setViewportMode('mobile')}
                >
                  <Smartphone size={16} />
                </button>
              </div>

              <div className="flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium ${previewMode === 'visual'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-gray-300 rounded-l-md`}
                  onClick={() => setPreviewMode('visual')}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium ${previewMode === 'code'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } border border-r border-t border-b border-gray-300 rounded-r-md`}
                  onClick={() => setPreviewMode('code')}
                >
                  <Code size={16} />
                </button>
              </div>

              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={copyToClipboard}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>

              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={downloadHtml}
              >
                <Download size={16} />
              </button>

              {/* Edit icon */}
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Edit template layout"
                onClick={() =>
                  navigate(`/editor/${templateId}?companyId=${companyId}`, {
                    state: {
                      // Pass the current layout/blocks for editing
                      blocks: props?.blocks || null
                    }
                  })
                }
              >
                <Edit size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
                  <p className="text-gray-500">Loading email preview...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={refreshPreview}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            ) : previewMode === 'visual' ? (
              <div
                className={`h-full flex justify-center overflow-auto custom-scrollbar bg-gray-100 ${viewportMode === 'mobile' ? 'items-start pt-4' : ''
                  }`}
              >
                <div
                  className={`bg-white shadow-md custom-scrollbar ${viewportMode === 'mobile'
                    ? 'w-[375px] h-[667px] rounded-xl overflow-hidden '
                    : 'w-full h-full custom-scrollbar'
                    }`}
                >
                  <iframe
                    ref={iframeRef}
                    title="Email Preview"
                    srcDoc={html}
                    className="w-full h-full border-0 custom-scrollbar"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto custom-scrollbar">
                <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap">
                  {html}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </DynamicEmailRenderer>
  );
}
