export interface AuthData {
    email: string;
    isAuthenticated: boolean;
    isOtpVerified?: boolean; // New field to track OTP verification
    loginTime: string;
    role: 'platform' | 'client' | 'vendor';
    roleName?: string; // Original role name from API
    tenantName?: string;
    authUserId?: number;
    clientName?: string; // Client name from API
    name: string;
    permissions: string[];
    rememberMe?: boolean;
    clientId?: number; // Client ID from API
    tenantId?: number; // Tenant ID from API
    vendorId?: number; // Vendor ID from API
    clientLogoUrl?: string; // Client logo URL from API
    clientStatus?: number; // Client status from API
    moduleId?: number; // Module ID from API

}

export const getAuthData = (): AuthData | null => {
    try {
        const authData = localStorage.getItem('authData');
        return authData ? JSON.parse(authData) : null;
    } catch (error) {
        console.error('Error parsing auth data:', error);
        return null;
    }
};

export const setAuthData = (data: AuthData) => {
    try {
        localStorage.setItem('authData', JSON.stringify(data));
        if (data.rememberMe) {
            sessionStorage.setItem('authData', JSON.stringify(data));
        }
        // Dispatch custom event to notify auth change
        window.dispatchEvent(new Event('authChange'));
    } catch (error) {
        console.error('Error setting auth data:', error);
    }
};

export const clearAuthData = () => {
    try {
        localStorage.removeItem('authData');
        localStorage.removeItem('otpMeta'); // Also clear OTP meta
        // Dispatch custom event to notify auth change
        window.dispatchEvent(new Event('authChange'));
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

export const isAuthenticated = (): boolean => {
    const authData = getAuthData();
    return (authData?.isAuthenticated && authData?.isOtpVerified) || false;
};

export const isLoggedInButNotVerified = (): boolean => {
    const authData = getAuthData();
    return (authData?.isAuthenticated && !authData?.isOtpVerified) || false;
};

export const getUserRole = (): 'platform' | 'client' | 'vendor' | null => {
    const authData = getAuthData();
    return authData?.role || null;
};

export const hasPermission = (permission: string): boolean => {
    const authData = getAuthData();
    return authData?.permissions?.includes(permission) || false;
};

export const isPlatformUser = (): boolean => {
    return getUserRole() === 'platform';
};

export const isClientUser = (): boolean => {
    return getUserRole() === 'client';
};

export const isVendorUser = (): boolean => {
    return getUserRole() === 'vendor';
};