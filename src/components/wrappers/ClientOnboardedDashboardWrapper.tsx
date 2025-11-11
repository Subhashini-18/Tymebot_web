import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ClientOnboardedDataDashboard from '@/pages/client-onboarding/dashboard/ClientOnboardedDataDashboard';

const ClientOnboardedDashboardWrapper: React.FC = () => {
  const formData: any = useSelector((state: RootState) => state.rifForm.data);

  return (
    <ClientOnboardedDataDashboard
      data={formData}
      onComplete={() => alert('Onboarding completed!')}
      onExport={() => alert('Export functionality coming soon!')}
    />
  );
};

export default ClientOnboardedDashboardWrapper;