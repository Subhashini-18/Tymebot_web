import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import RiskSummaryDashboard from '@/pages/rif-form-vendors/RiskSummaryDashboard';

const RiskSummaryWrapper: React.FC = () => {
  const formData: any = useSelector((state: RootState) => state.rifForm.data);
  
  return (
    <RiskSummaryDashboard
      data={formData}
      onComplete={() => alert('Risk assessment completed!')}
      onExport={() => alert('Export functionality coming soon!')}
    />
  );
};

export default RiskSummaryWrapper;