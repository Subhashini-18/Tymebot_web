import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  User,
  Shield,
  FileText,
  Database,
  Server,
  Activity,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Send,
  Save,
} from "lucide-react";
import Button from "./ui/Button";
import { Select } from "./ui/Select";
import FormField from "./ui/form/FormField";

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  eventType: string;
  conditions: string[];
  channels: string[];
  recipients: string[];
  priority: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  eventType: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  channels: string[];
  recipients: string[];
  timestamp: string;
  status: "sent" | "failed" | "pending";
  details?: any;
}

const AlertsNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"rules" | "history" | "settings">(
    "rules"
  );
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock data for demonstration
  const mockRules: NotificationRule[] = [
    {
      id: "1",
      name: "High Risk Vendor Alert",
      description: "Alert when a vendor assessment results in high risk score",
      eventType: "vendor_assessment_completed",
      conditions: ["risk_score > 80", "vendor_tier = critical"],
      channels: ["email", "sms"],
      recipients: ["admin@company.com", "risk@company.com"],
      priority: "high",
      isActive: true,
      createdAt: "2024-01-10T10:00:00Z",
      lastTriggered: "2024-01-14T15:30:00Z",
      triggerCount: 5,
    },
    {
      id: "2",
      name: "Failed Login Attempts",
      description: "Alert for multiple failed login attempts",
      eventType: "authentication_failed",
      conditions: ["failed_attempts >= 5", "within_timeframe = 15_minutes"],
      channels: ["email", "slack"],
      recipients: ["security@company.com"],
      priority: "critical",
      isActive: true,
      createdAt: "2024-01-08T09:00:00Z",
      lastTriggered: "2024-01-15T08:45:00Z",
      triggerCount: 3,
    },
    {
      id: "3",
      name: "Client License Expiry",
      description: "Alert when client licenses are about to expire",
      eventType: "license_expiry_warning",
      conditions: ["expires_in_days <= 30"],
      channels: ["email"],
      recipients: ["billing@company.com", "account@company.com"],
      priority: "medium",
      isActive: true,
      createdAt: "2024-01-05T14:00:00Z",
      lastTriggered: "2024-01-13T10:00:00Z",
      triggerCount: 12,
    },
    {
      id: "4",
      name: "System Backup Failure",
      description: "Alert when system backup fails",
      eventType: "system_backup_failed",
      conditions: ["backup_status = failed"],
      channels: ["email", "sms", "slack"],
      recipients: ["devops@company.com", "admin@company.com"],
      priority: "critical",
      isActive: true,
      createdAt: "2024-01-01T08:00:00Z",
      lastTriggered: undefined,
      triggerCount: 0,
    },
    {
      id: "5",
      name: "New Client Onboarding",
      description: "Notification when a new client completes onboarding",
      eventType: "client_onboarded",
      conditions: ["onboarding_status = completed"],
      channels: ["email", "slack"],
      recipients: ["sales@company.com", "success@company.com"],
      priority: "low",
      isActive: true,
      createdAt: "2023-12-20T12:00:00Z",
      lastTriggered: "2024-01-15T16:20:00Z",
      triggerCount: 8,
    },
  ];

  const mockAlertHistory: AlertHistory[] = [
    {
      id: "1",
      ruleId: "2",
      ruleName: "Failed Login Attempts",
      eventType: "authentication_failed",
      message: "Multiple failed login attempts detected from IP 203.0.113.45",
      priority: "critical",
      channels: ["email", "slack"],
      recipients: ["security@company.com"],
      timestamp: "2024-01-15T08:45:00Z",
      status: "sent",
      details: { ip: "203.0.113.45", user: "mike.johnson", attempts: 5 },
    },
    {
      id: "2",
      ruleId: "5",
      ruleName: "New Client Onboarding",
      eventType: "client_onboarded",
      message: 'New client "TechCorp Inc." has completed onboarding',
      priority: "low",
      channels: ["email", "slack"],
      recipients: ["sales@company.com", "success@company.com"],
      timestamp: "2024-01-15T16:20:00Z",
      status: "sent",
      details: { clientName: "TechCorp Inc.", tier: "Enterprise" },
    },
    {
      id: "3",
      ruleId: "1",
      ruleName: "High Risk Vendor Alert",
      eventType: "vendor_assessment_completed",
      message: 'Vendor "DataSync Solutions" assessed with high risk score: 85',
      priority: "high",
      channels: ["email", "sms"],
      recipients: ["admin@company.com", "risk@company.com"],
      timestamp: "2024-01-14T15:30:00Z",
      status: "sent",
      details: {
        vendorName: "DataSync Solutions",
        riskScore: 85,
        assessmentId: "assess_789",
      },
    },
    {
      id: "4",
      ruleId: "3",
      ruleName: "Client License Expiry",
      eventType: "license_expiry_warning",
      message: 'Client "Financial Services Ltd" license expires in 15 days',
      priority: "medium",
      channels: ["email"],
      recipients: ["billing@company.com", "account@company.com"],
      timestamp: "2024-01-13T10:00:00Z",
      status: "sent",
      details: { clientName: "Financial Services Ltd", daysToExpiry: 15 },
    },
    {
      id: "5",
      ruleId: "2",
      ruleName: "Failed Login Attempts",
      eventType: "authentication_failed",
      message: "Multiple failed login attempts detected from IP 192.168.1.200",
      priority: "critical",
      channels: ["email", "slack"],
      recipients: ["security@company.com"],
      timestamp: "2024-01-12T14:22:00Z",
      status: "failed",
      details: {
        ip: "192.168.1.200",
        user: "jane.doe",
        attempts: 6,
        error: "SMTP server unavailable",
      },
    },
  ];

  const eventTypes = [
    {
      value: "vendor_assessment_completed",
      label: "Vendor Assessment Completed",
    },
    { value: "authentication_failed", label: "Authentication Failed" },
    { value: "license_expiry_warning", label: "License Expiry Warning" },
    { value: "system_backup_failed", label: "System Backup Failed" },
    { value: "client_onboarded", label: "Client Onboarded" },
    { value: "user_created", label: "User Created" },
    { value: "data_export_requested", label: "Data Export Requested" },
    { value: "security_scan_completed", label: "Security Scan Completed" },
  ];

  const channels = [
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "slack", label: "Slack" },
    { value: "webhook", label: "Webhook" },
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    ...priorities,
  ];

  const channelOptions = [{ value: "all", label: "All Channels" }, ...channels];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "sent", label: "Sent" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setRules(mockRules);
      setAlertHistory(mockAlertHistory);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      case "slack":
        return <MessageSquare className="h-4 w-4" />;
      case "webhook":
        return <Server className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter((rule) => rule.id !== ruleId));
  };

  const editRule = (rule: NotificationRule) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const createNewRule = () => {
    setEditingRule(null);
    setShowRuleModal(true);
  };

  const filteredHistory = alertHistory.filter((alert) => {
    const matchesSearch =
      searchTerm === "" ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.ruleName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      selectedPriority === "all" || alert.priority === selectedPriority;
    const matchesChannel =
      selectedChannel === "all" || alert.channels.includes(selectedChannel);
    const matchesStatus =
      selectedStatus === "all" || alert.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesChannel && matchesStatus;
  });

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  const RuleModal = () =>
    showRuleModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRule
                  ? "Edit Notification Rule"
                  : "Create New Notification Rule"}
              </h3>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Rule Name"
                  name="ruleName"
                  placeholder="Enter rule name"
                  required
                />
                <div>
                  <Select label="Event Type" options={eventTypes} required />
                </div>
              </div>

              <FormField
                label="Description"
                name="description"
                placeholder="Enter rule description"
                textarea
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select label="Priority" options={priorities} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Channels
                  </label>
                  <div className="space-y-2">
                    {channels.map((channel) => (
                      <label
                        htmlFor="notification-channels"
                        key={channel.value}
                        className="flex items-center"
                      >
                        <input
                          id="notification-channels"
                          name="notification-channels"
                          type="checkbox"
                          className="mr-2 rounded"
                          defaultChecked={editingRule?.channels.includes(
                            channel.value
                          )}
                        />
                        <div className="flex items-center">
                          {getChannelIcon(channel.value)}
                          <span className="ml-2 text-sm">{channel.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <FormField
                label="Recipients"
                name="recipients"
                placeholder="Enter email addresses separated by commas"
                helpText="Separate multiple recipients with commas"
              />

              <FormField
                label="Conditions"
                name="conditions"
                placeholder="Enter conditions (one per line)"
                textarea
                rows={4}
                helpText="Define when this rule should trigger"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="mr-2 rounded"
                  defaultChecked={editingRule?.isActive ?? true}
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Rule is active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowRuleModal(false)}>
                Cancel
              </Button>
              <Button className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingRule ? "Update Rule" : "Create Rule"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alerts & Notifications
          </h1>
          <p className="text-gray-600">
            Configure email/SMS triggers and escalation rules
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={createNewRule} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("rules")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "rules"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Notification Rules ({rules.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "history"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Alert History
            </div>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "settings"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          {/* Rules List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {rules.length}
                  </div>
                  <div className="text-sm text-blue-600">Total Rules</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {rules.filter((r) => r.isActive).length}
                  </div>
                  <div className="text-sm text-green-600">Active Rules</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {rules.filter((r) => r.priority === "critical").length}
                  </div>
                  <div className="text-sm text-yellow-600">
                    Critical Priority
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {rules.reduce((sum, rule) => sum + rule.triggerCount, 0)}
                  </div>
                  <div className="text-sm text-purple-600">Total Triggers</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Triggered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => (
                    <motion.tr
                      key={rule.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {rule.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rule.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {
                          eventTypes.find((et) => et.value === rule.eventType)
                            ?.label
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                            rule.priority
                          )}`}
                        >
                          {rule.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {rule.channels.map((channel) => (
                            <div
                              key={channel}
                              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                            >
                              {getChannelIcon(channel)}
                              <span>{channel}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${rule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {rule.isActive ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {rule.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.lastTriggered
                          ? formatTimestamp(rule.lastTriggered)
                          : "Never"}
                        <div className="text-xs text-gray-500">
                          {rule.triggerCount} triggers
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editRule(rule)}
                            className="text-[#01443B] hover:text-[#09B591]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    placeholder="Search alerts..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B] pl-10"
                  />
                </div>
              </div>
              <div>
                <Select
                  label="Priority"
                  options={priorityOptions}
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                />
              </div>
              <div>
                <Select
                  label="Channel"
                  options={channelOptions}
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                />
              </div>
              <div>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Alert History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Alert History
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Showing {paginatedHistory.length} of{" "}
                    {filteredHistory.length} alerts
                  </span>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedHistory.map((alert) => (
                    <motion.tr
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(alert.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {alert.ruleName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {alert.eventType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {alert.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                            alert.priority
                          )}`}
                        >
                          {alert.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {alert.channels.map((channel) => (
                            <div
                              key={channel}
                              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                            >
                              {getChannelIcon(channel)}
                              <span>{channel}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(alert.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {alert.status}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
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
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Settings
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Email Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="SMTP Server"
                    name="smtpServer"
                    placeholder="smtp.example.com"
                  />
                  <FormField
                    label="SMTP Port"
                    name="smtpPort"
                    type="number"
                    placeholder="587"
                  />
                  <FormField
                    label="From Email"
                    name="fromEmail"
                    type="email"
                    placeholder="noreply@company.com"
                  />
                  <FormField
                    label="From Name"
                    name="fromName"
                    placeholder="Risk Intelligence Platform"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  SMS Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="SMS Provider"
                    name="smsProvider"
                    placeholder="Twilio"
                  />
                  <FormField
                    label="API Key"
                    name="smsApiKey"
                    type="password"
                    placeholder="Enter API key"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Slack Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Webhook URL"
                    name="slackWebhook"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <FormField
                    label="Default Channel"
                    name="slackChannel"
                    placeholder="#alerts"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  General Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-700">
                      Enable notifications
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-700">
                      Send digest emails
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded" />
                    <span className="text-sm text-gray-700">
                      Rate limit notifications
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Test Configuration</Button>
              <Button className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      <RuleModal />
    </div>
  );
};

export default AlertsNotifications;
