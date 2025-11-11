import React, { useState } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from 'react-simple-maps';
import { motion } from 'framer-motion';

const geoUrl = "/features.json";

// Add country coordinates lookup
const countryCoordinates: Record<string, [number, number]> = {
    USA: [-100, 38],
    India: [78, 22],
    // Add more countries as needed
    // Example: Canada: [-106, 56], China: [104, 35], etc.
};

interface CountryDataItem {
    countryName: string;
    count: number;
}

interface WorldMapProps {
    countryData: CountryDataItem[];
    onRegionClick?: (region: string) => void;
    selectedRegion?: string | null;
}

// Remove regionData, use countryData instead
const WorldMap: React.FC<WorldMapProps> = ({ countryData, onRegionClick, selectedRegion }) => {
    const [tooltip, setTooltip] = useState<{
        show: boolean;
        x: number;
        y: number;
        content: string;
        count: number;
    }>({ show: false, x: 0, y: 0, content: '', count: 0 });

    // Add country tooltip state
    const [countryTooltip, setCountryTooltip] = useState<{
        show: boolean;
        x: number;
        y: number;
        name: string;
    }>({ show: false, x: 0, y: 0, name: '' });

    const handleMouseEnter = (region: RegionData, event: React.MouseEvent) => {
        setTooltip({
            show: true,
            x: event.clientX,
            y: event.clientY,
            content: region.name,
            count: region.count
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ show: false, x: 0, y: 0, content: '', count: 0 });
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (tooltip.show) {
            setTooltip(prev => ({
                ...prev,
                x: event.clientX,
                y: event.clientY
            }));
        }
    };

    const handleCountryMouseEnter = (geo: any, event: React.MouseEvent) => {
        setCountryTooltip({
            show: true,
            x: event.clientX,
            y: event.clientY,
            name: geo.properties?.name || ''
        });
    };

    const handleCountryMouseLeave = () => {
        setCountryTooltip({ show: false, x: 0, y: 0, name: '' });
    };

    const handleCountryMouseMove = (event: React.MouseEvent) => {
        if (countryTooltip.show) {
            setCountryTooltip(prev => ({
                ...prev,
                x: event.clientX,
                y: event.clientY
            }));
        }
    };

    const getMarkerSize = (count: number) => {
        if (count >= 40) return 20;
        if (count >= 30) return 16;
        if (count >= 20) return 14;
        if (count >= 10) return 12;
        return 8;
    };

    // Elegant color palette for countries
    const countryColors: string[] = [
        "#2563EB", // blue
        "#F59E42", // amber
        "#10B981", // green
        "#EF4444", // red
        "#6366F1", // indigo
        "#FBBF24", // yellow
        "#8B5CF6", // purple
        "#7C2D12", // brown
        "#09B591", // teal
        "#A78BFA", // violet
        "#F472B6", // pink
        "#6B7280", // gray
    ];

    // Helper to get color for each country
    const getCountryColor = (idx: number) => countryColors[idx % countryColors.length];

    return (
        <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
            <ComposableMap
                projectionConfig={{
                    scale: 120,
                    center: [0, 0]
                }}
                width={800}
                height={400}
                className="w-full h-full"
            >
                <ZoomableGroup>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#09B591"
                                    stroke="#01443B"
                                    strokeWidth={0.5}
                                    style={{
                                        default: {
                                            outline: 'none',
                                        },
                                        hover: {
                                            fill: '#01443B',
                                            outline: 'none',
                                        },
                                        pressed: {
                                            outline: 'none',
                                        },
                                    }}
                                    // Add country hover handlers
                                    onMouseEnter={(e) => handleCountryMouseEnter(geo, e)}
                                    onMouseLeave={handleCountryMouseLeave}
                                    onMouseMove={handleCountryMouseMove}
                                />
                            ))
                        }
                    </Geographies>

                    {/* Render markers for each country in countryData */}
                    {countryData?.map((item, idx) => {
                        const coords = countryCoordinates[item.countryName];
                        if (!coords) return null; // Skip if no coordinates
                        const color = getCountryColor(idx);
                        return (
                            <Marker key={item.countryName} coordinates={coords}>
                                <motion.g
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    {/* Pulse animation background */}
                                    <motion.circle
                                        r={getMarkerSize(item.count) + 8}
                                        fill={color}
                                        fillOpacity={0.18}
                                        animate={{
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    {/* Main marker */}
                                    <circle
                                        r={getMarkerSize(item.count)}
                                        fill={color}
                                        stroke="#fff"
                                        strokeWidth={2}
                                        className="cursor-pointer transition-all duration-200 shadow-lg"
                                    />
                                    {/* Vendor count label */}
                                    <text
                                        textAnchor="middle"
                                        y={-getMarkerSize(item.count) - 8}
                                        stroke='red'
                                        className="text-md !text-red-200 font-semibold pointer-events-none"
                                        style={{ fontFamily: 'Inter, -serif', fontWeight: 500, color: 'red' }}
                                    >
                                        {item.count}
                                    </text>
                                </motion.g>
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip for region */}
            {tooltip.show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-none"
                    style={{
                        left: tooltip.x + 10,
                        top: tooltip.y - 10,
                        transform: 'translate(0, -100%)'
                    }}
                >
                    <div className="text-sm font-semibold text-gray-900">{tooltip.content}</div>
                    <div className="text-xs text-gray-600">{tooltip.count} vendors</div>
                </motion.div>
            )}

            {/* Tooltip for country */}
            {countryTooltip.show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 pointer-events-none"
                    style={{
                        left: countryTooltip.x + 10,
                        top: countryTooltip.y - 10,
                        transform: 'translate(0, -100%)'
                    }}
                >
                    <div className="text-xs font-semibold text-gray-900">{countryTooltip.name}</div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Countries</h4>
                <div className="space-y-2">
                    {countryData?.map((item, idx) => (
                        <div
                            key={item.countryName}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: getCountryColor(idx) }}
                                />
                                <span className="text-xs text-gray-700 font-medium">{item.countryName}</span>
                            </div>
                            <span className="text-xs ml-2 font-semibold text-gray-900">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Panel */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-600">Live Data</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                    {countryData?.reduce((a, b) => a + b.count, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Vendors</div>
            </div>
        </div>
    );
};

export default WorldMap;