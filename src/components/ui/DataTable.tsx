import { useState, useMemo, useEffect } from 'react';
import type React from 'react';
import { ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Filter, LayoutGrid, Table } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { useTheme } from '@/context/ThemeContext';
import { themes } from '../config/themes';
// import { themes, useTheme } from '../../context/ThemeContext';
interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number';
    filterOptions?: { label: string; value: any }[];
    render?: (item: any) => React.ReactNode;
}

interface FilterState {
    [key: string]: {
        value: any;
        operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    };
}

interface DataTableProps {
    columns: any;
    data: any[];
    itemsPerPage?: number;
    actions?: (item: any) => React.ReactNode;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    emptyMessage?: string;
    renderGridItem?: (item: any) => React.ReactNode; // Optional custom grid item renderer
    nestedData?: {
        key: string;
        columns: Column[];
        actions?: (item: any) => React.ReactNode;
        emptyMessage?: string;
    };
    onVisibleRowsChange?: (rows: any[]) => void; // optional callback to get visible rows after filtering + paging
}


const defaultGridItem = (currentTheme: any, item: any, columns: any[], actions?: (item: any) => React.ReactNode) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group hover:border-blue-300 dark:hover:border-blue-600">
        <div className="space-y-4">
            {/* Header Section - First Column as Title */}
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold ">
                    {columns[0].render ? columns[0].render(item) : item[columns[0].key]}
                </h3>
                {actions && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                        {actions(item)}
                    </div>
                )}
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-2 gap-3 flex justify-between items-center text-center">
                {columns.slice(1).map((column) => (
                    <div key={column.key} className="space-y-2 justify-items-center">
                        <dt className="text-md font-semibold text-gray-500 items- text-start">{column.label}</dt>
                        <dd className="text-sm  flex justify-start" >
                            {column.render ? column.render(item) : item[column.key]}
                        </dd>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default function DataTable({
    columns,
    data,
    itemsPerPage = 10,
    actions,
    onSort,
    sortKey,
    sortDirection = 'asc',
    emptyMessage = 'No data found',
    renderGridItem,
    nestedData,
    onVisibleRowsChange,
}: DataTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [localSortKey, setLocalSortKey] = useState(sortKey);
    const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>(sortDirection);
    const [filters, setFilters]: any = useState<FilterState>({});
    console.log(filters)
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const { currentTheme }: any = useTheme()
    // const currentTheme: any = themes[theme]

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const filteredData = useMemo(() => {
        return data.filter(item => {
            return Object.entries(filters).every(([key, filter]: any) => {
                if (!filter.value) return true;

                const columnValue = item[key];
                console.log(item[key])
                switch (filter.operator) {
                    case 'equals':
                        return columnValue === filter.value;
                    case 'contains':
                        return String(columnValue)
                            .toLowerCase()
                            .includes(String(filter.value).toLowerCase());
                    case 'greaterThan':
                        return columnValue > filter.value;
                    case 'lessThan':
                        return columnValue < filter.value;
                    case 'between':
                        return columnValue >= filter.value[0] && columnValue <= filter.value[1];
                    case 'in':
                        return filter.value.includes(columnValue);
                    default:
                        return true;
                }
            });
        });
    }, [data, filters]);

    const currentData = filteredData.slice(startIndex, endIndex);

    // Notify parent about visible rows for features like 'Select visible'
    useEffect(() => {
        onVisibleRowsChange?.(currentData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(currentData.map((r: any) => r?.id ?? r)), itemsPerPage, currentPage, JSON.stringify(filters)]);

    const handleSort = (key: string) => {
        const newDirection = localSortKey === key && localSortDirection === 'asc' ? 'desc' : 'asc';
        setLocalSortKey(key);
        setLocalSortDirection(newDirection);
        onSort?.(key, newDirection);
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleFilterChange = (columnKey: string, value: any, operator: string) => {
        setFilters((prev: any) => ({
            ...prev,
            [columnKey]: { value, operator }
        }));

        if (value && !activeFilters.includes(columnKey)) {
            setActiveFilters([...activeFilters, columnKey]);
        } else if (!value && activeFilters.includes(columnKey)) {
            setActiveFilters(activeFilters.filter(key => key !== columnKey));
        }
    };

    const renderFilterPanel = () => (
        <div className=' '>
            <div className={`absolute mt-2 right-0 z-10 w-72 bg-white border rounded-lg shadow-lg p-4 space-y-4 ${currentTheme?.primary} ${currentTheme?.text}`}>
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-medium ">Filters</h3>
                    <button
                        onClick={() => {
                            setFilters({});
                            setActiveFilters([]);
                        }}
                        className={`text-xs ${currentTheme?.primary} ${currentTheme?.hover}`}
                    >
                        Clear all
                    </button>
                </div>
                <div className="space-y-3">
                    {columns.filter(col => col.filterable).map(column => (
                        <div key={column.key} className="space-y-1">
                            <label className="text-xs font-medium ">
                                {column.label}
                            </label>
                            {renderFilterInput(column)}
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );

    const renderFilterInput = (column: Column) => {
        const baseInputStyles = "w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black";

        switch (column.filterType) {
            case 'select':
                return (
                    <Dropdown
                        items={column.filterOptions || []}
                        value={filters[column.key]?.value || ''}
                        onChange={(value) => handleFilterChange(column.key, value, 'contains')}
                        placeholder={`Select ${column.label}`}
                        className="text-xs bg-white"
                    />
                );
            case 'date':
                return (
                    <input
                        type="datetime-local"
                        value={filters[column.key]?.value || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value, 'equals')}
                        className={baseInputStyles}
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={filters[column.key]?.value || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value, 'contains')}
                        placeholder={`Filter ${column.label}`}
                        className={baseInputStyles}
                    />
                );
        }
    };

    const toggleRow = (index: number) => {
        const newExpandedRows = new Set(expandedRows);
        if (expandedRows.has(index)) {
            newExpandedRows.delete(index);
        } else {
            newExpandedRows.add(index);
        }
        setExpandedRows(newExpandedRows);
    };

    return (
        <div className={`space-y-4 ${currentTheme?.primary} ${currentTheme?.text}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.map(key => {
                                const column = columns.find(col => col.key === key);
                                return (
                                    <span key={key}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md">
                                        {column?.label}: {filters[key].value}
                                        <button
                                            onClick={() => handleFilterChange(key, '', '')}
                                            className="ml-1 hover:text-blue-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-4 ">
                    <div className={`flex items-center space-x-2 backdrop-blur-sm rounded-lg p-1 `}>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'table'
                                ? 'bg-violet-500 text-white'
                                : `{${currentTheme?.text} hover:bg-white/10}`
                                }`}
                        >
                            <Table className="w-5 h-5 " />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                ? 'bg-violet-500 text-white'
                                : `{${currentTheme?.text} hover:bg-white/10}`

                                }`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`flex items-center px-2 py-1 text-sm border rounded-md
                                ${activeFilters.length > 0 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600'}`}
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            <span className=''>{activeFilters.length > 0 ? `Filters (${activeFilters.length})` : 'Filter'}</span>
                        </button>
                        {showFilterPanel &&

                            renderFilterPanel()
                        }
                    </div>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className={`overflow-x-auto  rounded-lg shadow ${currentTheme?.primary} ${currentTheme?.text}`}>
                    <table className={`min-w-full divide-y divide-gray-200 ${currentTheme?.text}${currentTheme?.primary} `}>
                        <thead className="">
                            <tr>
                                {nestedData && (
                                    <th className="w-10 px-4 py-3 "></th>
                                )}
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider"
                                    >
                                        {onSort && column.sortable ? (
                                            <button
                                                className="flex items-center space-x-1"
                                                onClick={() => handleSort(column.key)}
                                            >
                                                <span>{column.label}</span>
                                                <ChevronDown
                                                    className={`w-4 h-4 transform transition-transform ${localSortKey === column.key &&
                                                        (localSortDirection === 'desc' ? 'rotate-180' : '')
                                                        }`}
                                                />
                                            </button>
                                        ) : (
                                            column.label
                                        )}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-6 py-3 text-right text-xs font-medium  uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className=" divide-y divide-gray-200">
                            {currentData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions ? 1 : 0) + (nestedData ? 1 : 0)}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((item, index) => (
                                    <>
                                        <tr key={`row-${index}`} className={`${currentTheme?.hover}`}>
                                            {nestedData && (
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        {expandedRows.has(index) ?
                                                            <ChevronDown className="w-4 h-4 text-gray-500" /> :
                                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                                        }
                                                    </button>
                                                </td>
                                            )}
                                            {columns.map((column) => (
                                                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                                    {column.render ? column.render(item) : item[column.key]}
                                                </td>
                                            ))}
                                            {actions && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {actions(item)}
                                                </td>
                                            )}
                                        </tr>
                                        {nestedData && expandedRows.has(index) && (
                                            <tr key={`nested-${index}`}>
                                                <td colSpan={columns.length + (actions ? 2 : 1)} className="px-4 py-2 bg-gray-50">
                                                    <div className="ml-8">
                                                        {item[nestedData.key]?.length > 0 ? (
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        {nestedData.columns.map((column) => (
                                                                            <th key={column.key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                {column.label}
                                                                            </th>
                                                                        ))}
                                                                        {nestedData.actions && (
                                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                                                Actions
                                                                            </th>
                                                                        )}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white">
                                                                    {item[nestedData.key].map((nestedItem: any, nestedIndex: number) => (
                                                                        <tr key={nestedIndex} className="hover:bg-gray-50">
                                                                            {nestedData.columns.map((column) => (
                                                                                <td key={column.key} className="px-4 py-2 text-sm">
                                                                                    {column.render ? column.render(nestedItem) : nestedItem[column.key]}
                                                                                </td>
                                                                            ))}
                                                                            {nestedData.actions && (
                                                                                <td className="px-4 py-2 text-right">
                                                                                    {nestedData.actions(nestedItem)}
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 py-2">{nestedData.emptyMessage || 'No data found'}</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>

                    {filteredData.length > itemsPerPage && (
                        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(endIndex, filteredData.length)}
                                </span>{' '}
                                of <span className="font-medium">{filteredData.length}</span> results
                            </div>
                            <div className="flex-1 flex justify-end">
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="mx-4 py-2 text-sm text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {currentData.length === 0 ? (
                        <div className="col-span-full flex items-center justify-center h-32 text-white/60">
                            {emptyMessage}
                        </div>
                    ) : (
                        currentData.map((item, index) => (
                            <div key={index}>
                                {renderGridItem ? renderGridItem(item) : defaultGridItem(currentTheme, item, columns, actions)}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

