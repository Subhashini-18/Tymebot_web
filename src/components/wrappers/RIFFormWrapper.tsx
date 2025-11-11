import React from 'react';
import { useFormContext } from '@/context/FormContext';
import RIFFormIndex from '@/pages/rif-form-vendors';

const RIFFormWrapper: React.FC = () => {
  const { setStepValidity, updateFormData } = useFormContext();

  return (
    <RIFFormIndex
      initialStep={0}
      onInit={() => {
        // Optionally reset or initialize form data here if needed
        setStepValidity(0, false);
        updateFormData({});
      }}
    />
  );
};

export default RIFFormWrapper;