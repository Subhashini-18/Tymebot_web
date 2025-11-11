import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Zap,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Database,
  Mail,
  Slack,
  Github,
  Workflow,
  Cloud,
  Key,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Button from "./ui/Button";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "pending";
  icon: React.ComponentType<any>;
  lastSync: string;
  configured: boolean;
  features: string[];
  documentation: string;
  apiKey?: string;
  settings: any;
}

const mockIntegrations: Integration[] = [
  {
    id: "1",
    name: "Slack",
    category: "Communication",
    description: "Send notifications and alerts to Slack channels",
    status: "connected",
    icon: Slack,
    lastSync: "2024-01-15 14:30",
    configured: true,
    features: ["Risk Alerts", "Assessment Notifications", "Approval Workflows"],
    documentation: "https://docs.example.com/slack",
    settings: {
      webhook: "https://hooks.slack.com/services/...",
      channel: "#risk-management",
      notifications: ["high-risk", "overdue-assessments"],
    },
  },
  {
    id: "2",
    name: "Microsoft Teams",
    category: "Communication",
    description: "Integrate with Microsoft Teams for notifications",
    status: "disconnected",
    icon: Mail,
    lastSync: "Never",
    configured: false,
    features: ["Team Notifications", "Assessment Updates", "Risk Alerts"],
    documentation: "https://docs.example.com/teams",
    settings: {},
  },
  {
    id: "3",
    name: "ServiceNow",
    category: "ITSM",
    description: "Create tickets and manage incidents in ServiceNow",
    status: "connected",
    icon: Database,
    lastSync: "2024-01-15 12:00",
    configured: true,
    features: ["Incident Creation", "Change Requests", "Approval Workflows"],
    documentation: "https://docs.example.com/servicenow",
    settings: {
      instance: "company.service-now.com",
      username: "api-user",
      table: "incident",
    },
  },
  {
    id: "4",
    name: "Jira",
    category: "Project Management",
    description: "Create and track remediation tasks in Jira",
    status: "error",
    icon: Github,
    lastSync: "2024-01-14 16:45",
    configured: true,
    features: ["Task Creation", "Issue Tracking", "Sprint Planning"],
    documentation: "https://docs.example.com/jira",
    settings: {
      server: "https://company.atlassian.net",
      project: "RISK",
      issueType: "Task",
    },
  },
  {
    id: "5",
    name: "LDAP/Active Directory",
    category: "Authentication",
    description: "Sync user accounts with LDAP/AD",
    status: "pending",
    icon: Shield,
    lastSync: "In Progress",
    configured: false,
    features: ["User Sync", "Role Mapping", "SSO Integration"],
    documentation: "https://docs.example.com/ldap",
    settings: {
      server: "ldap://company.com",
      baseDN: "DC=company,DC=com",
      syncSchedule: "daily",
    },
  },
  {
    id: "6",
    name: "Splunk",
    category: "Analytics",
    description: "Send logs and events to Splunk for analysis",
    status: "connected",
    icon: Workflow,
    lastSync: "2024-01-15 15:00",
    configured: true,
    features: ["Log Streaming", "Event Correlation", "Dashboards"],
    documentation: "https://docs.example.com/splunk",
    settings: {
      server: "https://splunk.company.com",
      index: "risk_management",
      token: "xxxx-xxxx-xxxx",
    },
  },
  {
    id: "7",
    name: "AWS Security Hub",
    category: "Cloud Security",
    description: "Integrate with AWS Security Hub for cloud security findings",
    status: "disconnected",
    icon: Cloud,
    lastSync: "Never",
    configured: false,
    features: ["Security Findings", "Compliance Checks", "Automated Responses"],
    documentation: "https://docs.example.com/aws",
    settings: {},
  },
  {
    id: "8",
    name: "PowerBI",
    category: "Analytics",
    description: "Create dashboards and reports in PowerBI",
    status: "connected",
    icon: Database,
    lastSync: "2024-01-15 10:30",
    configured: true,
    features: ["Dashboard Creation", "Report Generation", "Data Visualization"],
    documentation: "https://docs.example.com/powerbi",
    settings: {
      workspace: "Risk Management",
      dataset: "risk_data",
      refreshSchedule: "hourly",
    },
  },
];

const categories = [
  "All",
  "Communication",
  "ITSM",
  "Project Management",
  "Authentication",
  "Analytics",
  "Cloud Security",
];
const statusOptions = ["All", "Connected", "Disconnected", "Error", "Pending"];

const Integrations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showConfigModal, setShowConfigModal] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredIntegrations = mockIntegrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || integration.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      integration.status === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4" />;
      case "disconnected":
        return <XCircle className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      case "pending":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const ConfigModal = ({ integrationId }: { integrationId: string }) => {
    const integration = mockIntegrations.find((i) => i.id === integrationId);
    if (!integration) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configure {integration.name}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter API key"
                value={integration.apiKey || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter webhook URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Types
              </label>
              <div className="space-y-2">
                {[
                  "High Risk Alerts",
                  "Overdue Assessments",
                  "New Vendor Onboarding",
                  "Compliance Issues",
                ].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#01443B] focus:ring-[#01443B]"
                      defaultChecked={type === "High Risk Alerts"}
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowConfigModal(null)}
              variant="primary"
              className="flex-1"
            >
              Save Configuration
            </Button>
            <Button
              onClick={() => setShowConfigModal(null)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const AddIntegrationModal = () =>
    showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Integration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Integration Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter integration name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="">Select category</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Endpoint
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter API endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                rows={3}
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="primary"
              className="flex-1"
            >
              Add Integration
            </Button>
            <Button
              onClick={() => setShowAddModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Integrations
            </h1>
            <p className="text-gray-600">
              Configure third-party tools and services
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockIntegrations.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  mockIntegrations.filter((i) => i.status === "connected")
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {mockIntegrations.filter((i) => i.status === "error").length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(mockIntegrations.map((i) => i.category)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#01443B]/10 rounded-lg">
                    <integration.icon className="h-5 w-5 text-[#01443B]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {integration.category}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    integration.status
                  )}`}
                >
                  {getStatusIcon(integration.status)}
                  <span className="ml-1 capitalize">{integration.status}</span>
                </span>
              </div>

              {/* Integration Description */}
              <p className="text-gray-600 text-sm mb-4">
                {integration.description}
              </p>

              {/* Integration Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Features
                </h4>
                <div className="space-y-1">
                  {integration.features.slice(0, 3).map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                  {integration.features.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{integration.features.length - 3} more
                    </p>
                  )}
                </div>
              </div>

              {/* Last Sync Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Last sync: {integration.lastSync}</span>
                <a
                  href={integration.documentation}
                  className="flex items-center gap-1 text-[#01443B] hover:text-[#04ae8a]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  Docs
                </a>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                {integration.status === "connected" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => setShowConfigModal(integration.id)}
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Sync
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setShowConfigModal(integration.id)}
                  >
                    <Zap className="h-4 w-4" />
                    Connect
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No integrations found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ||
            selectedCategory !== "All" ||
            selectedStatus !== "All"
              ? "Try adjusting your search or filters"
              : "Add your first integration to connect external tools"}
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Add First Integration
          </Button>
        </div>
      )}

      {showConfigModal && <ConfigModal integrationId={showConfigModal} />}
      <AddIntegrationModal />
    </div>
  );
};

export default Integrations;
