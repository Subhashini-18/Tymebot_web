import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getAuthData } from '@/utils/auth';
import {
    fetchClientDashboardData,
    refreshClientDashboard,
    setRefreshInterval,
    clearError,
    resetDashboard,
    selectClientDashboardData,
    selectClientDashboardError,
    selectClientDashboardLastUpdated,
    selectClientDashboardLoading,
    selectClientRefreshInterval,
    selectClientCharts,
} from '@/store/slice/clientDashboardSlice';

export interface UseClientDashboardOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    clientId?: number; // optional override
}

export const useClientDashboard = (options: UseClientDashboardOptions = {}) => {
    const {
        autoRefresh = true,
        refreshInterval = 300000,
        clientId: clientIdOverride,
    } = options;

    const dispatch = useAppDispatch();

    // Selectors
    const data = useAppSelector(selectClientDashboardData);
    const loading = useAppSelector(selectClientDashboardLoading);
    const error = useAppSelector(selectClientDashboardError);
    const lastUpdated = useAppSelector(selectClientDashboardLastUpdated);
    const currentRefreshInterval = useAppSelector(selectClientRefreshInterval);
    const charts = useAppSelector(selectClientCharts);

    const clientId = useMemo(() => clientIdOverride ?? getAuthData()?.clientId ?? undefined, [clientIdOverride]);

    const initialize = useCallback(async () => {
        try {
            // ensure interval is set
            if (currentRefreshInterval !== refreshInterval) {
                dispatch(setRefreshInterval(refreshInterval));
            }
            if (!data && clientId) {
                await dispatch(fetchClientDashboardData({ clientId })).unwrap();
            }
        } catch (e) {
            console.error('Failed to initialize client dashboard', e);
        }
    }, [dispatch, data, clientId, currentRefreshInterval, refreshInterval]);

    const fetchData = useCallback(async () => {
        if (!clientId) return;
        await dispatch(fetchClientDashboardData({ clientId })).unwrap();
    }, [dispatch, clientId]);

    const refresh = useCallback(async () => {
        if (!clientId) return;
        await dispatch(refreshClientDashboard({ clientId })).unwrap();
    }, [dispatch, clientId]);

    const dismissError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(resetDashboard());
    }, [dispatch]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh || !clientId) return;
        const id = setInterval(() => {
            if (data && !loading) {
                dispatch(refreshClientDashboard({ clientId }));
            }
        }, refreshInterval);
        return () => clearInterval(id);
    }, [autoRefresh, refreshInterval, data, loading, dispatch, clientId]);

    // Initialize
    useEffect(() => {
        initialize();
    }, [initialize]);

    const hasData = useMemo(() => !!data, [data]);

    // Compose summary similar to platform hook
    const summary = useMemo(() => {
        if (!data?.summary) return null;
        const s = data.summary;
        return {
            vendorCount: s.vendorCount,
            licenseCount: s.licenseCount,
            storageUsage: s.storageUsage,
            totalAssessments: s.totalAssessments,
            lowRiskVendors: s.lowRiskVendors,
            mediumRiskVendors: s.mediumRiskVendors,
            highRiskVendors: s.highRiskVendors,
            countryDistribution: s.countryDistribution,
        };
    }, [data]);

    return {
        data,
        charts,
        summary,
        loading,
        error,
        lastUpdated,
        hasData,

        // actions
        fetchData,
        refresh,
        dismissError,
        reset,
    };
};

export default useClientDashboard;