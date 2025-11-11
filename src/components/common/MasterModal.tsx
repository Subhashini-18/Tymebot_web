import React, { useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/context/ThemeContext';
// import { generateZodSchema } from '@/utils/zodSchemaCreate';
// import FormField from '@/components/ui/form/FormField';
// import Button from '@/components/ui/form/Button';
import { useDispatch } from 'react-redux';
import { fetchCommonDataByEndpoint } from '@/store/slice/commonSlice';
import { AppDispatch } from '@/store';
import { generateZodSchema } from '@/utils/zodSchemaCreate';
import Button from '../ui/Button';
import FormField from '../ui/form/FormField';
// import { AppDispatch, RootState } from '@/store/store';

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formFields: any[];
  initialData?: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
  titleClassName?: string;
  submitButtonClassName?: string;
}

export const MasterModal: React.FC<MasterModalProps> = ({
  isOpen,
  onClose,
  title,
  formFields,
  initialData,
  onSave,
  isLoading = false,
  titleClassName = 'bg-gradient-to-r from-blue-600 to-purple-600',
  submitButtonClassName = 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-500'
}) => {
  const { currentTheme }: any = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [dynamicOptions, setDynamicOptions] = React.useState<Record<string, any[]>>({});

  const zodSchema: any = generateZodSchema(formFields);

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: normalizeInitialData(initialData, formFields) || {}
  });

  const { handleSubmit, reset, formState: { errors } }: any = methods;

  // Normalize select field values to string for Zod enum validation and handle transforms
  function normalizeInitialData(data: any, fields: any[]) {
    if (!data) return data;
    const normalized = { ...data };
    fields.forEach(field => {
      if (
        (field.type === 'select' || field.type === 'radio') &&
        normalized[field.name] !== undefined &&
        normalized[field.name] !== null
      ) {
        normalized[field.name] = String(normalized[field.name]);
      }

      // Handle transform.input for fields with transform logic
      if (field.transform && field.transform.input && normalized[field.name] !== undefined) {
        normalized[field.name] = field.transform.input(normalized[field.name]);
      }
    });
    return normalized;
  }

  // Always reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset(normalizeInitialData(initialData, formFields) || {});
    }
  }, [isOpen, initialData, reset, formFields]);

  useEffect(() => {
    const fetchOptions = async () => {
      const promises = formFields
        .filter(field => field.type === 'select' && field.optionsApi)
        .map(async field => {
          const endpoint = field.optionsApi;
          const port = field.optionsApiPort || 443;
          try {
            const result: any = await dispatch(fetchCommonDataByEndpoint({
              endpoint,
              port: port
            })).unwrap();
            // Use labelName if provided, else fallback
            const options = (result.data || result.data.data || []).map((item: any) => ({
              label: field.labelName ? item[field.labelName] : (item.name || item.taskTypeName || item.label || item.id),
              value: item.id
            }));
            console.log(result.data)
            return { name: field.name, options };
          } catch {
            return { name: field.name, options: [] };
          }
        });
      const results = await Promise.all(promises);
      console.log(results)
      const optionsMap: Record<string, any[]> = {};
      results.forEach(({ name, options }) => {
        optionsMap[name] = options;
      });
      setDynamicOptions(optionsMap);
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, formFields, dispatch]);

  const onSubmit = (data: any) => {
    console.log('Form submission data (before transform):', data);

    // Apply transform.output logic to fields that have it
    const transformedData = { ...data };
    formFields.forEach(field => {
      if (field.transform && field.transform.output && transformedData[field.name] !== undefined) {
        transformedData[field.name] = field.transform.output(transformedData[field.name]);
      }
    });

    console.log('Form submission data (after transform):', transformedData);
    onSave(transformedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
      {/* Enhanced Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Enhanced Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] mx-4 rounded-2xl shadow-2xl border overflow-hidden transform transition-all duration-300 scale-100"
        style={{
          backgroundColor: currentTheme?.colors.primary,
          borderColor: currentTheme?.colors.accent
        }}
      >
        {/* Enhanced Header */}
        <div
          className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-transparent to-transparent"
          style={{ borderColor: currentTheme?.colors.accent }}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${titleClassName} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${titleClassName} bg-clip-text text-transparent`}>
                {title}
              </h2>
              <p className="text-sm opacity-70" style={{ color: currentTheme?.colors.text }}>
                {initialData?.id ? 'Edit existing record' : 'Create new record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-opacity-80 transition-all duration-200 hover:scale-105 group"
            style={{
              backgroundColor: currentTheme?.colors.secondary,
              color: currentTheme?.colors.text
            }}
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Enhanced Form */}
        <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className={`${formFields.length > 5 ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-2'}`}>
              {formFields.map((field, index) => (
                <div key={field.name} className="group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  {field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-3"
                      style={{ borderColor: currentTheme?.colors.accent + '40' }}>
                      <FormField
                        name={field.name}
                        label=""
                        type="checkbox"
                        className="mb-7 ml-2 w-5 h-5 rounded content-center text-blue-600 focus:ring-blue-500 focus:ring-2"
                        error={errors[field.name]?.message}

                      />
                      <span
                        className="text-sm font-medium select-none cursor-pointer"
                        style={{ color: currentTheme?.colors.text }}
                        onClick={() => {
                          const currentValue = methods.getValues(field.name);
                          methods.setValue(field.name, !currentValue);
                        }}
                      >
                        {field.label}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FormField
                        name={field.name}
                        label={field.label}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        error={errors[field.name]?.message}
                        textarea={field.textarea}
                        className={`transition-all duration-200 `}
                        options={field.type === 'select'
                          ? dynamicOptions[field.name] || field.options
                          : undefined
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </form>
          </FormProvider>
        </div>

        {/* Enhanced Footer */}
        <div
          className="flex items-center justify-between p-6 border-t bg-gradient-to-r from-transparent to-transparent"
          style={{ borderColor: currentTheme?.colors.accent }}
        >
          <div className="flex items-center space-x-2 text-sm" style={{ color: currentTheme?.colors.text }}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="opacity-70">
              {initialData?.id ? 'Updating existing record' : 'Creating new record'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                borderColor: currentTheme?.colors.accent,
                color: currentTheme?.colors.text
              }}
            >
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg ${submitButtonClassName} text-white font-semibold`}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterModal;
