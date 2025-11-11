import { z, ZodTypeAny } from 'zod';

export function generateZodSchema(fields: any[]): ZodTypeAny {
    const schema: Record<string, ZodTypeAny> = {};

    fields.forEach(field => {
        let fieldSchema: ZodTypeAny;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
                fieldSchema = z.string()
                    .min(field.validation?.minLength || 0, field.validation?.errorMessage)
                    .max(field.validation?.maxLength || Infinity, field.validation?.errorMessage)
                    .regex(new RegExp(field.validation?.pattern || '.*'), field.validation?.errorMessage);
                break;
            case 'select':
            case 'radio': {
                // Use options if available, else fallback to string
                const options = field.options || field.dynamicOptions;
                if (Array.isArray(options) && options.length > 0) {
                    const enumValues = options.map((option: any) => option.value) as [string, ...string[]];
                    fieldSchema = z.enum(enumValues);
                } else {
                    fieldSchema = z.string();
                }
                break;
            }
            case 'number':
                let numberSchema = z.number();
                if (field.validation?.min !== undefined) {
                    numberSchema = numberSchema.min(field.validation.min, field.validation.errorMessage);
                }
                if (field.validation?.max !== undefined) {
                    numberSchema = numberSchema.max(field.validation.max, field.validation.errorMessage);
                }
                // Transform string to number for form inputs
                fieldSchema = z.preprocess((val) => {
                    if (typeof val === 'string') {
                        const parsed = parseFloat(val);
                        return isNaN(parsed) ? undefined : parsed;
                    }
                    return val;
                }, numberSchema);
                break;
            case 'checkbox':
                // For checkboxes, allow both true and false values
                // Only validate that it's a boolean, don't force it to be true
                if (field.required && field.validation?.mustBeTrue) {
                    // Only use the strict validation if explicitly specified
                    fieldSchema = z.boolean().refine(val => val === true, field.validation?.errorMessage);
                } else {
                    // Allow both true and false for status fields like isActive
                    fieldSchema = z.boolean();
                }
                break;
            case 'file':
                fieldSchema = z.any(); // Adjust based on file handling
                break;
            default:
                fieldSchema = z.string();
                break;
        }

        // Apply optional/nullable based on required field
        if (field.required === false) {
            // For select fields, allow empty string or null/undefined
            if (field.type === 'select' || field.type === 'radio') {
                schema[field.name] = z.union([
                    fieldSchema,
                    z.string().length(0), // Allow empty string
                    z.null(),
                    z.undefined()
                ]).optional();
            } else {
                schema[field.name] = fieldSchema.optional();
            }
        } else {
            schema[field.name] = fieldSchema;
        }
    });

    console.log('Generated schema:', schema);
    return z.object(schema);
}