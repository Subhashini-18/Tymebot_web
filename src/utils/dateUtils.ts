/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Formats a date to the API required format: YYYY-MM-DDTHH:mm:ss.ssssss
 * @param dateValue - Date object, ISO string, or any valid date input
 * @returns Formatted date string or null if invalid
 */
export const formatDateForAPI = (dateValue: any): string | null => {
    if (!dateValue) return null;

    try {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

        // Check if date is valid
        if (isNaN(date.getTime())) return null;

        // Format to match your required format: 2025-07-13T19:33:01.713382
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

        // Add microseconds (3 more digits) to match your format
        const microseconds = '000'; // Default to 000 for microseconds

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${microseconds}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return null;
    }
};

/**
 * Parses various date formats and returns a Date object
 * @param dateValue - Date string, Date object, or any valid date input
 * @returns Date object or null if invalid
 */
export const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;

    try {
        // Handle various date formats
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? null : dateValue;
        }

        // Handle ISO string or other string formats
        const parsedDate = new Date(dateValue);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
};

/**
 * Processes form data to format all date fields for API submission
 * @param data - Form data object
 * @param formFields - Array of form field definitions
 * @returns Processed data with formatted dates
 */
export const processFormDataDates = (data: any, formFields: any[]): any => {
    const processedData = { ...data };

    console.log('Processing dates - Input data:', data);
    console.log('Processing dates - Form fields:', formFields);

    // Find all date fields in formFields and format them
    formFields.forEach(field => {
        console.log(`Checking field: ${field.name}, type: ${field.type}, value:`, processedData[field.name]);

        if (field.type === 'date') {
            const fieldValue = processedData[field.name];

            if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                console.log(`Processing date field: ${field.name} with value:`, fieldValue);
                const formattedDate = formatDateForAPI(fieldValue);
                console.log(`Formatted date for ${field.name}:`, formattedDate);

                if (formattedDate) {
                    processedData[field.name] = formattedDate;
                } else {
                    console.log(`Invalid date for ${field.name}, removing from data`);
                    // Remove invalid dates
                    delete processedData[field.name];
                }
            } else {
                console.log(`No value found for date field: ${field.name}, value is:`, fieldValue);
                // If field is required but has no value, keep it as null to trigger validation error
                if (field.required) {
                    console.log(`Date field ${field.name} is required but empty`);
                    // Don't delete required fields, let validation handle it
                } else {
                    // Remove optional empty date fields
                    delete processedData[field.name];
                }
            }
        }
    });

    console.log('Final processed data:', processedData);
    return processedData;
};

/**
 * Formats date for display in UI components
 * @param dateValue - Date value to format
 * @param format - Display format (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 */
export const formatDateForDisplay = (dateValue: any, format: string = 'YYYY-MM-DD'): string => {
    const date = parseDate(dateValue);
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    switch (format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'YYYY-MM-DD HH:mm':
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        default:
            return `${year}-${month}-${day}`;
    }
};