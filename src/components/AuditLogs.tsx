import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  MoreHorizontal,
  FileText,
  Settings,
  Database,
  UserPlus,
  UserMinus,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  Globe,
  Server,
  HardDrive,
  Cpu,
  Network,
  Trash2,
  Edit,
} from "lucide-react";
import Button from "./ui/Button";
import { Select } from "./ui/Select";
import FormField from "./ui/form/FormField";
import DataTable from "./ui/DataTable";
import { Dropdown } from "./ui/Dropdown";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  clientName?: string;
  action: string;
  category: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "warning";
  severity: "low" | "medium" | "high" | "critical";
  location?: string;
  additionalData?: Record<string, any>;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("7");
  const [selectedUser, setSelectedUser] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data for demonstration
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      userId: "user123",
      userName: "John Doe",
      userRole: "Platform Admin",
      clientName: "TechCorp Inc.",
      action: "CLIENT_LOGIN",
      category: "Authentication",
      resource: "User Session",
      details: "Successfully logged into platform dashboard",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "low",
      location: "New York, US",
      additionalData: { sessionId: "sess_abc123", duration: "2h 45m" },
    },
    {
      id: "2",
      timestamp: "2024-01-15T09:15:00Z",
      userId: "user456",
      userName: "Jane Smith",
      userRole: "Client Admin",
      clientName: "Global Manufacturing",
      action: "VENDOR_ASSESSMENT_CREATED",
      category: "Risk Assessment",
      resource: "Vendor Assessment",
      details: "Created new vendor assessment for DataSync Solutions",
      ipAddress: "10.0.0.50",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      status: "success",
      severity: "medium",
      location: "London, UK",
      additionalData: {
        assessmentId: "assess_789",
        vendorName: "DataSync Solutions",
      },
    },
    {
      id: "3",
      timestamp: "2024-01-15T08:45:00Z",
      userId: "user789",
      userName: "Mike Johnson",
      userRole: "Platform User",
      action: "FAILED_LOGIN_ATTEMPT",
      category: "Authentication",
      resource: "User Session",
      details: "Multiple failed login attempts detected",
      ipAddress: "203.0.113.45",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      status: "failed",
      severity: "high",
      location: "Sydney, AU",
      additionalData: { attempts: 5, lockoutDuration: "30m" },
    },
    {
      id: "4",
      timestamp: "2024-01-15T07:20:00Z",
      userId: "system",
      userName: "System",
      userRole: "System",
      action: "SYSTEM_BACKUP_COMPLETED",
      category: "System",
      resource: "Database",
      details: "Automated daily backup completed successfully",
      ipAddress: "127.0.0.1",
      userAgent: "System/1.0",
      status: "success",
      severity: "low",
      location: "Data Center",
      additionalData: { backupSize: "2.3GB", duration: "45m" },
    },
    {
      id: "5",
      timestamp: "2024-01-15T06:00:00Z",
      userId: "user101",
      userName: "Sarah Wilson",
      userRole: "Client User",
      clientName: "Financial Services Ltd",
      action: "REPORT_EXPORTED",
      category: "Reports",
      resource: "Risk Report",
      details: "Exported quarterly risk assessment report",
      ipAddress: "172.16.0.25",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
      location: "Toronto, CA",
      additionalData: {
        reportType: "Quarterly Risk Assessment",
        fileSize: "15MB",
      },
    },
    {
      id: "6",
      timestamp: "2024-01-14T23:30:00Z",
      userId: "user202",
      userName: "David Chen",
      userRole: "Platform Admin",
      action: "CLIENT_CONFIGURATION_UPDATED",
      category: "Configuration",
      resource: "Client Settings",
      details: "Updated client notification settings",
      ipAddress: "192.168.1.200",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      status: "success",
      severity: "medium",
      location: "San Francisco, US",
      additionalData: {
        settingChanged: "email_notifications",
        previousValue: "disabled",
        newValue: "enabled",
      },
    },
    {
      id: "7",
      timestamp: "2024-01-14T22:15:00Z",
      userId: "user303",
      userName: "Emma Rodriguez",
      userRole: "Client Admin",
      clientName: "Healthcare Solutions",
      action: "USER_PERMISSIONS_MODIFIED",
      category: "User Management",
      resource: "User Permissions",
      details: "Updated user permissions for vendor assessment module",
      ipAddress: "10.1.1.75",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "high",
      location: "Chicago, US",
      additionalData: {
        affectedUser: "robert.brown@healthcare.com",
        permissionType: "vendor_assessment_create",
      },
    },
    {
      id: "8",
      timestamp: "2024-01-14T21:00:00Z",
      userId: "system",
      userName: "System",
      userRole: "System",
      action: "SECURITY_SCAN_COMPLETED",
      category: "Security",
      resource: "Security Scanner",
      details: "Weekly security vulnerability scan completed",
      ipAddress: "127.0.0.1",
      userAgent: "SecurityScanner/2.0",
      status: "warning",
      severity: "medium",
      location: "Security Center",
      additionalData: {
        vulnerabilitiesFound: 3,
        riskLevel: "Medium",
        scanDuration: "2h 15m",
      },
    },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Authentication", label: "Authentication" },
    { value: "Risk Assessment", label: "Risk Assessment" },
    { value: "System", label: "System" },
    { value: "Reports", label: "Reports" },
    { value: "Configuration", label: "Configuration" },
    { value: "User Management", label: "User Management" },
    { value: "Security", label: "Security" },
  ];

  const severityOptions = [
    { value: "all", label: "All Severities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "warning", label: "Warning" },
  ];

  const dateRangeOptions = [
    { value: "1", label: "Last 24 Hours" },
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
  ];

  const userOptions = [
    { value: "all", label: "All Users" },
    { value: "John Doe", label: "John Doe" },
    { value: "Jane Smith", label: "Jane Smith" },
    { value: "Mike Johnson", label: "Mike Johnson" },
    { value: "Sarah Wilson", label: "Sarah Wilson" },
    { value: "David Chen", label: "David Chen" },
    { value: "Emma Rodriguez", label: "Emma Rodriguez" },
    { value: "System", label: "System" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    // setTimeout(() => {
    setLogs(mockAuditLogs);
    setFilteredLogs(mockAuditLogs);
    setIsLoading(false);
    // }, 1000);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [
    searchTerm,
    selectedCategory,
    selectedSeverity,
    selectedStatus,
    selectedDateRange,
    selectedUser,
    logs,
  ]);

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((log) => log.category === selectedCategory);
    }

    // Severity filter
    if (selectedSeverity !== "all") {
      filtered = filtered.filter((log) => log.severity === selectedSeverity);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((log) => log.status === selectedStatus);
    }

    // User filter
    if (selectedUser !== "all") {
      filtered = filtered.filter((log) => log.userName === selectedUser);
    }

    // Date range filter
    const now = new Date();
    const daysAgo = new Date(
      now.getTime() - parseInt(selectedDateRange) * 24 * 60 * 60 * 1000
    );
    filtered = filtered.filter((log) => new Date(log.timestamp) >= daysAgo);

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Authentication":
        return <User className="h-4 w-4" />;
      case "Risk Assessment":
        return <Shield className="h-4 w-4" />;
      case "System":
        return <Server className="h-4 w-4" />;
      case "Reports":
        return <FileText className="h-4 w-4" />;
      case "Configuration":
        return <Settings className="h-4 w-4" />;
      case "User Management":
        return <UserPlus className="h-4 w-4" />;
      case "Security":
        return <Lock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const exportLogs = () => {
    // Implementation for exporting logs
    console.log("Exporting logs...");
  };

  const refreshLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLogs(mockAuditLogs);
      setIsLoading(false);
    }, 1000);
  };

  const viewLogDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  // DataTable columns definition
  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      filterable: true,
      filterType: "date",
      render: (log: AuditLogEntry) => formatTimestamp(log.timestamp),
    },
    {
      key: "userName",
      label: "User",
      sortable: true,
      filterable: true,
      render: (log: AuditLogEntry) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-[#01443B] rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{log.userName}</p>
            <p className="text-sm text-gray-500">{log.userRole}</p>
            {log.clientName && (
              <p className="text-xs text-gray-400">{log.clientName}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      filterable: true,
      render: (log: AuditLogEntry) => (
        <div>
          <div className="text-sm text-gray-900 font-medium">{log.action}</div>
          <div className="text-sm text-gray-500">{log.resource}</div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Authentication", label: "Authentication" },
        { value: "Risk Assessment", label: "Risk Assessment" },
        { value: "System", label: "System" },
        { value: "Reports", label: "Reports" },
        { value: "Configuration", label: "Configuration" },
        { value: "User Management", label: "User Management" },
        { value: "Security", label: "Security" },
      ],
      render: (log: AuditLogEntry) => (
        <div className="flex items-center">
          {getCategoryIcon(log.category)}
          <span className="ml-2 text-sm text-gray-900">{log.category}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "success", label: "Success" },
        { value: "failed", label: "Failed" },
        { value: "warning", label: "Warning" },
      ],
      render: (log: AuditLogEntry) => (
        <div className="flex items-center">
          {getStatusIcon(log.status)}
          <span className="ml-2 text-sm text-gray-900 capitalize">
            {log.status}
          </span>
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
      render: (log: AuditLogEntry) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(
            log.severity
          )}`}
        >
          {log.severity.toUpperCase()}
        </span>
      ),
    },
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: false,
      filterable: true,
    },
  ];

  // Actions column for DataTable
  const actions = (log: AuditLogEntry) => (
    <button
      onClick={() => viewLogDetails(log)}
      className="text-[#01443B] hover:text-[#09B591] flex items-center gap-1"
    >
      <Eye className="h-4 w-4" />
      View
    </button>
  );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p className="text-gray-600">
            System-wide event and activity tracker
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={refreshLogs}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportLogs}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] pl-10"
              />
            </div>
          </div>
          <div>
            <Select
              label="Category"
              options={categories}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Severity"
              options={severityOptions}
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            />
          </div>
          <div className="items-center content-end">
            <Dropdown
              className="items-center g"
              items={statusOptions}
              placeholder="Select Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e)}
            />
          </div>
          <div>
            <Select
              label="User"
              options={userOptions}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {paginatedLogs.length} of {filteredLogs.length} entries
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                options={pageSizeOptions}
                value={pageSize.toString()}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page:</span>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-[#01443B] text-white rounded">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B]"></div>
          </div>
        ) : (
          <div className="p-2">
            <DataTable
              columns={columns}
              data={mockAuditLogs}
              itemsPerPage={pageSize}
              actions={actions}
              emptyMessage="No audit logs found"
            />
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Log Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timestamp
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatTimestamp(selectedLog.timestamp)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.userName} ({selectedLog.userRole})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.category}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedLog.status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(
                        selectedLog.severity
                      )}`}
                    >
                      {selectedLog.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP Address
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.location || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedLog.details}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Agent
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>

                {selectedLog.additionalData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Data
                    </label>
                    <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.additionalData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
