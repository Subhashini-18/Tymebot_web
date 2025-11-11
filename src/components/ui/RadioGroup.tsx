import { useFormContext as useRHFContext, Controller } from "react-hook-form";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  required?: boolean;
  helpText?: string;
  direction?: "horizontal" | "vertical";
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function RadioGroup({
  name,
  label,
  options,
  required = false,
  helpText,
  direction = "horizontal",
  onChange,
  disabled = false,
}: RadioGroupProps) {
  const { control } = useRHFContext();

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <div className={`flex ${direction === "vertical" ? "flex-col gap-2" : "flex-wrap gap-4"}`}>
              {options.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${name}-${option.value}`}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={field.value === option.value}
                    onChange={() => {
                      field.onChange(option.value);
                      onChange?.(option.value);
                    }}
                    disabled={disabled}
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
