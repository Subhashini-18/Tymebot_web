import { useState, useEffect } from 'react';
import { EmailTemplate } from '../types';
import AceEditor from 'react-ace';
// import 'ace-builds/src-noconflict/mode-json';
// import 'ace-builds/src-noconflict/theme-github';
// import 'ace-builds/src-noconflict/ext-language_tools';
import { Code, ExternalLink, FileJson, Squircle } from 'lucide-react';

interface PropsEditorProps {
  template: EmailTemplate | null;
  props: Record<string, any>;
  onPropsChange: (newProps: Record<string, any>) => void;
}

export default function PropsEditor({ template, props, onPropsChange }: PropsEditorProps) {
  const [mode, setMode] = useState<'form' | 'json'>('form');
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  useEffect(() => {
    // Update JSON editor when props change
    setJsonValue(JSON.stringify(props, null, 2));
  }, [props]);
  
  const handleJsonChange = (newValue: string) => {
    setJsonValue(newValue);
    try {
      const parsed = JSON.parse(newValue);
      setJsonError(null);
      onPropsChange(parsed);
    } catch (e) {
      setJsonError('Invalid JSON: ' + (e as Error).message);
    }
  };
  
  const handleFormValueChange = (name: string, value: any) => {
    onPropsChange({
      ...props,
      [name]: value
    });
  };
  
  if (!template) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center text-gray-500">
        Select a template to customize its properties.
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Template Properties</h3>
          <p className="mt-1 text-sm text-gray-600">Customize the content for {template.name}</p>
        </div>
        
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              mode === 'form'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300 rounded-l-md`}
            onClick={() => setMode('form')}
          >
            <div className="flex items-center space-x-1">
              <Squircle size={16} />
              <span>Form</span>
            </div>
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              mode === 'json'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-r border-t border-b border-gray-300 rounded-r-md`}
            onClick={() => setMode('json')}
          >
            <div className="flex items-center space-x-1">
              <FileJson size={16} />
              <span>JSON</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {mode === 'form' ? (
          <div className="p-4 space-y-4">
            {template.propDefinitions.map((propDef) => (
              <div key={propDef.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {propDef.name}
                  {propDef.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="mt-1 text-xs text-gray-500">{propDef.description}</p>
                
                {propDef.type === 'string' && (
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={props[propDef.name] || ''}
                    onChange={(e) => handleFormValueChange(propDef.name, e.target.value)}
                  />
                )}
                
                {propDef.type === 'number' && (
                  <input
                    type="number"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={props[propDef.name] || 0}
                    onChange={(e) => handleFormValueChange(propDef.name, parseFloat(e.target.value))}
                  />
                )}
                
                {propDef.type === 'boolean' && (
                  <div className="mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        checked={Boolean(props[propDef.name])}
                        onChange={(e) => handleFormValueChange(propDef.name, e.target.checked)}
                      />
                      <span className="ml-2">{props[propDef.name] ? 'True' : 'False'}</span>
                    </label>
                  </div>
                )}
                
                {(propDef.type === 'array' || propDef.type === 'object') && (
                  <div className="mt-1">
                    <div className="bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {propDef.type === 'array' ? 'Array' : 'Object'} (edit in JSON mode)
                        </span>
                        <button
                          type="button"
                          className="text-indigo-600 text-xs hover:text-indigo-900"
                          onClick={() => setMode('json')}
                        >
                          <div className="flex items-center space-x-1">
                            <Code size={14} />
                            <span>Edit as JSON</span>
                          </div>
                        </button>
                      </div>
                      <div className="mt-1 bg-gray-100 p-2 rounded text-xs font-mono overflow-auto max-h-24">
                        {JSON.stringify(props[propDef.name], null, 2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-0">
            <AceEditor
              mode="json"
              theme="github"
              value={jsonValue}
              onChange={handleJsonChange}
              name="json-editor"
              width="100%"
              height="400px"
              fontSize={14}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
            {jsonError && (
              <div className="p-3 bg-red-50 text-red-600 border-t border-red-100 text-sm">
                {jsonError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
