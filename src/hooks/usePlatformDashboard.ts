import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchPlatformDashboardData,
    refreshPlatformDashboard,
    setSelectedTimeframe,
    setSelectedRegion,
    setRefreshInterval,
    clearError,
    resetDashboard,
    selectPlatformDashboardData,
    selectPlatformDashboardLoading,
    selectPlatformDashboardError,
    selectPlatformDashboardLastUpdated,
    selectSelectedTimeframe,
    selectSelectedRegion,
    selectChartData
} from '@/store/slice/platformDashboardSlice';

export interface UsePlatformDashboardOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    initialTimeframe?: string;
    initialRegion?: string | null;
}

export const usePlatformDashboard = (options: UsePlatformDashboardOptions = {}) => {
    const {
        autoRefresh = true,
        refreshInterval = 300000, // 5 minutes
        initialTimeframe = 'monthly',
        initialRegion = null
    } = options;

    const dispatch = useAppDispatch();

    // Selectors
    const data = useAppSelector(selectPlatformDashboardData);
    const loading = useAppSelector(selectPlatformDashboardLoading);
    const error = useAppSelector(selectPlatformDashboardError);
    const lastUpdated = useAppSelector(selectPlatformDashboardLastUpdated);
    const selectedTimeframe = useAppSelector(selectSelectedTimeframe);
    const selectedRegion = useAppSelector(selectSelectedRegion);
    const chartData = useAppSelector(selectChartData);

    // Initialize dashboard
    const initialize = useCallback(async () => {
        try {
            // Set initial values if different from current
            if (selectedTimeframe !== initialTimeframe) {
                dispatch(setSelectedTimeframe(initialTimeframe));
            }
            if (selectedRegion !== initialRegion) {
                dispatch(setSelectedRegion(initialRegion));
            }

            // Set refresh interval
            dispatch(setRefreshInterval(refreshInterval));

            // Fetch initial data if not already loaded
            if (!data) {
                await dispatch(fetchPlatformDashboardData({
                    timeframe: initialTimeframe,
                    region: initialRegion
                })).unwrap();
            }
        } catch (error) {
            console.error('Failed to initialize platform dashboard:', error);
        }
    }, [dispatch, data, initialTimeframe, initialRegion, refreshInterval, selectedTimeframe, selectedRegion]);

    // Fetch data with current filters
    const fetchData = useCallback(async (forceRefresh = false) => {
        try {
            await dispatch(fetchPlatformDashboardData({
                timeframe: selectedTimeframe,
                region: selectedRegion,
                forceRefresh
            })).unwrap();
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            throw error;
        }
    }, [dispatch, selectedTimeframe, selectedRegion]);

    // Refresh data
    const refresh = useCallback(async () => {
        try {
            await dispatch(refreshPlatformDashboard()).unwrap();
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            throw error;
        }
    }, [dispatch]);

    // Change timeframe
    const changeTimeframe = useCallback(async (timeframe: string) => {
        try {
            dispatch(setSelectedTimeframe(timeframe));
            await dispatch(fetchPlatformDashboardData({
                timeframe,
                region: selectedRegion,
                forceRefresh: true
            })).unwrap();
        } catch (error) {
            console.error('Failed to change timeframe:', error);
            throw error;
        }
    }, [dispatch, selectedRegion]);

    // Change region
    const changeRegion = useCallback(async (region: string | null) => {
        try {
            dispatch(setSelectedRegion(region));
            await dispatch(fetchPlatformDashboardData({
                timeframe: selectedTimeframe,
                region,
                forceRefresh: true
            })).unwrap();
        } catch (error) {
            console.error('Failed to change region:', error);
            throw error;
        }
    }, [dispatch, selectedTimeframe]);

    // Clear error
    const dismissError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Reset dashboard
    const reset = useCallback(() => {
        dispatch(resetDashboard());
    }, [dispatch]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            if (data && !loading) {
                dispatch(refreshPlatformDashboard());
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, data, loading, dispatch]);

    // Initialize on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Computed values
    const isStale = useMemo(() => {
        if (!lastUpdated) return false;
        const staleThreshold = refreshInterval * 1.5; // Consider stale after 1.5x refresh interval
        return Date.now() - new Date(lastUpdated).getTime() > staleThreshold;
    }, [lastUpdated, refreshInterval]);

    const hasData = useMemo(() => {
        return data !== null;
    }, [data]);

    const isEmpty = useMemo(() => {
        if (!data) return true;
        return (
            !data.summary ||
            (!data.topClients || data.topClients.length === 0) ||
            (!data.engagementTrends || data.engagementTrends.length === 0)
        );
    }, [data]);

    // Summary statistics
    const summary = useMemo(() => {
        if (!data?.summary) return null;

        return {
            totalClients: data.summary.clientCount,
            totalVendors: data.summary.vendorCount,
            totalLicenses: data.summary.licenseCount,
            storageUsage: data.summary.storageUsage,
            activeClients: data.statusDistribution?.find(s => s.clientStatusName === 'Active')?.clientCount || 0,
            onboardedClients: data.statusDistribution?.find(s => s.clientStatusName === 'Onboarded')?.clientCount || 0
        };
    }, [data]);

    // Chart data with fallbacks
    const charts = useMemo(() => {
        if (!chartData) return null;

        return {
            statusDistribution: chartData.statusDistribution || { labels: [], data: [] },
            industryDistribution: chartData.industryDistribution || { labels: [], data: [] },
            businessSizeDistribution: chartData.businessSizeDistribution || { labels: [], data: [] },
            subscriptionTierDistribution: chartData.subscriptionTierDistribution || { labels: [], data: [] },
            engagementTrends: chartData.engagementTrends || { labels: [], logins: [], activeUsers: [], assessments: [] }
        };
    }, [chartData]);

    return {
        // Data
        data,
        summary,
        charts,
        topClients: data?.topClients || [],

        // State
        loading,
        error,
        lastUpdated,
        selectedTimeframe,
        selectedRegion,
        isStale,
        hasData,
        isEmpty,

        // Actions
        fetchData,
        refresh,
        changeTimeframe,
        changeRegion,
        dismissError,
        reset,
        initialize
    };
};

export default usePlatformDashboard;