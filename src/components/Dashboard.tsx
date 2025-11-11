import React, { useState, useEffect } from 'react';
import { getUserRole, getAuthData } from '../utils/auth';
import PlatformDashboard from './dashboards/PlatformDashboardSimplified';
import ClientDashboard from './dashboards/ClientDashboard';
import VendorDashboard from './dashboards/VendorDashboard';

const Dashboard: React.FC = () => {
    const [userRole, setUserRole] = useState<'platform' | 'client' | 'vendor' | null>(null);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const role = getUserRole();
        const authData = getAuthData();
        setUserRole(role);
        setUserData(authData);
    }, []);

    // Loading state
    if (!userRole) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Render appropriate dashboard based on user role
    switch (userRole) {
        case 'platform':
            return <PlatformDashboard />;
        case 'client':
            return <ClientDashboard />;
        case 'vendor':
            return <VendorDashboard />;
        default:
            return (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You don't have permission to access this dashboard.</p>
                    </div>
                </div>
            );
    }
};

export default Dashboard;