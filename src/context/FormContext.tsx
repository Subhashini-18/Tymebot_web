import { createContext, useContext, useState, useCallback } from 'react';
// import { ThirdPartyInfoFormData as OriginalThirdPartyInfoFormData } from '../pages/rif-form-vendors/validation-schema/formSchemas';

// Extend the form data type to allow questionnaire fields
export type ThirdPartyInfoFormData = OriginalThirdPartyInfoFormData & {
    questionnaire?: any;
    questionnaireRiskLevel?: string;
};

interface FormState {
    currentStep: number;
    formData: ThirdPartyInfoFormData;
    isValid: boolean;
    isDirty: boolean;
}

interface FormContextType extends FormState {
    updateFormData: (data: Partial<ThirdPartyInfoFormData>) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    resetForm: () => void;
    validateStep: (step: number) => boolean;
    setStepValidity: (step: number, isValid: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<FormState>({
        currentStep: 0,
        formData: {} as ThirdPartyInfoFormData,
        isValid: false,
        isDirty: false,
    });

    const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});

    const updateFormData = useCallback((updates: Partial<ThirdPartyInfoFormData>) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, ...updates },
            isDirty: true,
        }));
    }, []);

    const validateStep = useCallback((step: number) => {
        return stepValidation[step] || false;
    }, [stepValidation]);

    const setStepValidity = useCallback((step: number, isValid: boolean) => {
        setStepValidation(prev => ({ ...prev, [step]: isValid }));
    }, []);

    const goToNextStep = useCallback(() => {
        // Allow step 0 to proceed without validation
        if (state.currentStep === 0) {
            setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
            return;
        }

        // For other steps, check validation
        const isValid = validateStep(state.currentStep);
        if (isValid) {
            setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
        }
    }, [state.currentStep, validateStep]);

    const goToPreviousStep = useCallback(() => {
        setState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
    }, []);

    const resetForm = useCallback(() => {
        setState({
            currentStep: 0,
            formData: {} as ThirdPartyInfoFormData,
            isValid: false,
            isDirty: false,
        });
        setStepValidation({});
    }, []);

    return (
        <FormContext.Provider
            value={{
                ...state,
                updateFormData,
                goToNextStep,
                goToPreviousStep,
                resetForm,
                validateStep,
                setStepValidity,
            }}
        >
            {children}
        </FormContext.Provider>
    );
};

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};
