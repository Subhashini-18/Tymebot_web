import { lazy } from "react";

export interface RouteConfig {
    path: string;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
    protected?: boolean;
    exact?: boolean;
}

export const routes: RouteConfig[] = [

    {
        path: "/otp-verification",
        component: lazy(() => import("@/components/OTPVerification")),
        protected: false,
    },

    {
        path: "/dashboard",
        component: lazy(() => import("@/components/Dashboard")),
        protected: true,
    },

    // create credentials
    {
        path: "/create-credentials",
        component: lazy(() => import("@/components/CreateCredentials")),
        protected: true,
    },
    {
        path: "/audit-logs",
        component: lazy(() => import("@/components/AuditLogs")),
        protected: true,
    },
    {
        path: "/alerts-notifications",
        component: lazy(() => import("@/components/AlertsNotifications")),
        protected: true,
    },

    //user-access-management
    {
        path: "/user-access-management",
        component: lazy(() => import("@/components/IAMManager")),
        protected: true,
    },

    // email-templates
    {
        path: "/email-templates",
        component: lazy(
            () => import("@/pages/email-template-components/BuilderPage")
        ),
        protected: true,
    },

    //tenant-manager
    {
        path: "/tenant-manager",
        component: lazy(
            () => import("@/pages/tenant/tenant-masters-parent/TenantSuiteManager")
        ),
        protected: true,
    },

    // master menu
    {
        path: "/master-manager",
        component: lazy(
            () => import("@/pages/masters/masters-parent/MasterSuiteManager")
        ),
        protected: true,
    },
     {
        path: '/application-config',
        component: lazy(() =>
            import('@/components/applicationConfig/ApplicationConfig').then((module) => ({ default: module.default })),
        ),
        protected: false,
    },
]