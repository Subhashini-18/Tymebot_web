import { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
// import { EmailTemplate } from '../types';
import { templates } from './templates';
import { EmailTemplate } from '.';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSelector({ selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
        <p className="mt-1 text-sm text-gray-600">Select a template to customize</p>

        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-full ${!activeCategory ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${activeCategory === category ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              onClick={() => setActiveCategory(category === activeCategory ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto custom-scrollbar">
        {filteredTemplates.map((template) => (
          <TemplateItem
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplateId}
            onSelect={() => onSelectTemplate(template.id)}
          />
        ))}

        {filteredTemplates.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No templates found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateItemProps {
  template: EmailTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateItem({ template, isSelected, onSelect }: TemplateItemProps) {
  return (
    <div
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
        }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
          <p className="mt-1 text-xs text-gray-600">{template.description}</p>
          <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
            ${template.category === 'transactional' ? 'bg-blue-100 text-blue-800' : ''}
            ${template.category === 'marketing' ? 'bg-green-100 text-green-800' : ''}
            ${template.category === 'notification' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${template.category === 'system' ? 'bg-purple-100 text-purple-800' : ''}
          `}>
            {template.category}
          </span>
        </div>
        <ArrowUpRight size={16} className="text-gray-400" />
      </div>
    </div>
  );
}
