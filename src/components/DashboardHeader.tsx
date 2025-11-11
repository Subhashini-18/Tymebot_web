import React from 'react';
import { getUserRole, getAuthData } from '../utils/auth';
// import { ThemeSelector } from './ThemeSelector';

const DashboardHeader: React.FC = () => {
    const userRole = getUserRole();
    const userData = getAuthData();

    console.log(userRole)
    return (
        <div className="">
            <div className="flex items-center justify-between">
                <div>
                    {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {userRole === 'platform' ? 'Platform Dashboard' : 'Client Details'}
                    </h1>
                    <p className="text-gray-600">
                        {userRole === 'platform'
                            ? 'Welcome to your Third Party Risk Intelligence Platform'
                            : 'Manage your vendors and assess third-party risks'}
                    </p> */}
                </div>
                <div className="text-right flex items-center space-x-6">
                    {/* <ThemeSelector /> */}
                    <div className="flex items-center space-x-3">
                        <p className="text-sm text-gray-500">Welcome back</p>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{userData?.name}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userRole === 'platform'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {userRole}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
