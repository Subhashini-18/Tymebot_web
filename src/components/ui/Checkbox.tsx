import { useFormContext as useRHFContext, Controller } from "react-hook-form";

interface CheckboxProps {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
}

export default function Checkbox({
  name,
  label,
  required = false,
  helpText,
}: CheckboxProps) {
  const { control } = useRHFContext();

  return (
    <div className="mb-4">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="flex items-center">
              <input
                id={name}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <label
                htmlFor={name}
                className="ml-2 block text-sm text-slate-700"
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            
            {error && (
              <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
          </>
        )}
      />
      
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

interface CheckboxGroupProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
}

export function CheckboxGroup({
  name,
  label,
  options,
  required = false,
  helpText,
}: CheckboxGroupProps) {
  const { control } = useRHFContext();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className="flex flex-col gap-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`${name}-${option.value}`}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    checked={(field.value || []).includes(option.value)}
                    onChange={(e) => {
                      const values = field.value || [];
                      if (e.target.checked) {
                        field.onChange([...values, option.value]);
                      } else {
                        field.onChange(
                          values.filter((value: string) => value !== option.value)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`${name}-${option.value}`}
                    className="ml-2 block text-sm text-slate-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            
            {error && (
              <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
          </>
        )}
      />
      
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}
