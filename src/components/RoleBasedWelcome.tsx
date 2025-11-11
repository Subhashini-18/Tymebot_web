import React from 'react';
import { getAuthData } from '../utils/auth';

const RoleBasedWelcome: React.FC = () => {
    const authData = getAuthData();

    if (!authData) {
        return null;
    }

    const getRoleDisplayName = (role: string, roleName?: string) => {
        if (roleName) {
            return roleName;
        }

        switch (role) {
            case 'platform':
                return 'Platform Administrator';
            case 'client':
                return 'Client User';
            case 'vendor':
                return 'Vendor User';
            default:
                return 'User';
        }
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case 'platform':
                return 'You have full access to platform administration features including client management, template library, and system configuration.';
            case 'client':
                return 'You have access to vendor management, risk assessments, and reporting features for your organization.';
            case 'vendor':
                return 'You have access to questionnaire forms, risk analysis, and vendor-specific reporting features.';
            default:
                return 'Welcome to the Third Party Risk Intelligence Platform.';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'platform':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'client':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'vendor':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Welcome back, {authData.name}!
                    </h2>
                    <p className="text-sm text-gray-600">
                        {authData.tenantName && `${authData.tenantName} • `}
                        Logged in as {getRoleDisplayName(authData.role, authData.roleName)}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(authData.role)}`}>
                    {getRoleDisplayName(authData.role, authData.roleName)}
                </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
                {getRoleDescription(authData.role)}
            </p>

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Debug Info:</h4>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify({
                            role: authData.role,
                            roleName: authData.roleName,
                            tenantName: authData.tenantName,
                            authUserId: authData.authUserId
                        }, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default RoleBasedWelcome;