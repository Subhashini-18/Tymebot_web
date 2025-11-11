import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  HelpCircle,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Tag,
  FileText,
  Phone,
  Mail,
  Zap,
  Book,
  Video,
  ExternalLink,
} from "lucide-react";
import Button from "../ui/Button";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdDate: string;
  updatedDate: string;
  assignedTo?: string;
  submittedBy: string;
  attachments: string[];
  responses: number;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
  author: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  lastUpdated: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: "1",
    title: "Unable to access vendor assessment form",
    description:
      "Getting error when trying to open vendor assessment form for TechCorp",
    category: "Technical",
    priority: "high",
    status: "open",
    createdDate: "2024-01-15 10:30",
    updatedDate: "2024-01-15 10:30",
    submittedBy: "John Doe",
    attachments: ["error_screenshot.png"],
    responses: 0,
  },
  {
    id: "2",
    title: "Request for new vendor onboarding process",
    description:
      "Need help setting up onboarding process for new cloud service provider",
    category: "Process",
    priority: "medium",
    status: "in_progress",
    createdDate: "2024-01-14 14:20",
    updatedDate: "2024-01-15 09:15",
    assignedTo: "Support Team",
    submittedBy: "Jane Smith",
    attachments: [],
    responses: 3,
  },
  {
    id: "3",
    title: "System performance issues",
    description:
      "Dashboard loading slowly and risk assessments taking longer than usual",
    category: "Technical",
    priority: "urgent",
    status: "resolved",
    createdDate: "2024-01-13 16:45",
    updatedDate: "2024-01-14 11:30",
    assignedTo: "Tech Support",
    submittedBy: "Bob Wilson",
    attachments: ["performance_report.pdf"],
    responses: 5,
  },
  {
    id: "4",
    title: "Training request for new team member",
    description:
      "Need training session for new compliance officer on using the platform",
    category: "Training",
    priority: "low",
    status: "closed",
    createdDate: "2024-01-12 11:15",
    updatedDate: "2024-01-13 14:30",
    assignedTo: "Training Team",
    submittedBy: "Alice Johnson",
    attachments: [],
    responses: 2,
  },
];

const mockKnowledgeBase: KnowledgeArticle[] = [
  {
    id: "1",
    title: "How to conduct a vendor risk assessment",
    category: "User Guide",
    content:
      "Step-by-step guide on conducting comprehensive vendor risk assessments...",
    tags: ["assessment", "vendor", "risk", "guide"],
    views: 245,
    helpful: 23,
    lastUpdated: "2024-01-10",
    author: "Support Team",
  },
  {
    id: "2",
    title: "Troubleshooting common login issues",
    category: "Technical",
    content: "Solutions for common login problems and authentication errors...",
    tags: ["login", "authentication", "troubleshooting"],
    views: 189,
    helpful: 31,
    lastUpdated: "2024-01-08",
    author: "Tech Support",
  },
  {
    id: "3",
    title: "Setting up automated risk monitoring",
    category: "Configuration",
    content:
      "Guide to configure automated monitoring and alerts for vendor risks...",
    tags: ["automation", "monitoring", "alerts", "configuration"],
    views: 167,
    helpful: 19,
    lastUpdated: "2024-01-05",
    author: "Product Team",
  },
  {
    id: "4",
    title: "Understanding compliance frameworks",
    category: "Compliance",
    content:
      "Overview of supported compliance frameworks and how to implement them...",
    tags: ["compliance", "frameworks", "regulation"],
    views: 298,
    helpful: 42,
    lastUpdated: "2024-01-03",
    author: "Compliance Team",
  },
];

const mockFAQs: FAQItem[] = [
  {
    id: "1",
    question: "How do I invite a vendor to complete an assessment?",
    answer:
      'Navigate to the Vendor Management section, select the vendor, and click "Send Assessment". You can customize the assessment questionnaire before sending.',
    category: "Vendor Management",
    helpful: 45,
    lastUpdated: "2024-01-12",
  },
  {
    id: "2",
    question: "What are the different risk levels and what do they mean?",
    answer:
      "Our platform uses four risk levels: Low (minimal risk), Medium (moderate risk requiring monitoring), High (significant risk requiring action), and Critical (immediate attention required).",
    category: "Risk Management",
    helpful: 38,
    lastUpdated: "2024-01-10",
  },
  {
    id: "3",
    question: "How can I export assessment results?",
    answer:
      "Assessment results can be exported from the Reports section. Choose your preferred format (PDF, Excel, CSV) and customize the report contents.",
    category: "Reports",
    helpful: 29,
    lastUpdated: "2024-01-08",
  },
  {
    id: "4",
    question: "Can I customize the assessment questionnaires?",
    answer:
      "Yes, you can customize questionnaires in the Questionnaire Library. Add, modify, or remove questions based on your specific requirements.",
    category: "Customization",
    helpful: 33,
    lastUpdated: "2024-01-05",
  },
];

const ticketCategories = [
  "All",
  "Technical",
  "Process",
  "Training",
  "Account",
  "Billing",
];
const priorityOptions = ["All", "Low", "Medium", "High", "Urgent"];
const statusOptions = ["All", "Open", "In Progress", "Resolved", "Closed"];
const knowledgeCategories = [
  "All",
  "User Guide",
  "Technical",
  "Configuration",
  "Compliance",
];

const HelpDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tickets" | "knowledge" | "faq">(
    "tickets"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || ticket.category === selectedCategory;
    const matchesPriority =
      selectedPriority === "All" ||
      ticket.priority === selectedPriority.toLowerCase();
    const matchesStatus =
      selectedStatus === "All" ||
      ticket.status === selectedStatus.toLowerCase().replace(" ", "_");

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const filteredKnowledge = mockKnowledgeBase.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = mockFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const CreateTicketModal = () =>
    showCreateTicket && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create Support Ticket
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                placeholder="Enter ticket subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="">Select category</option>
                {ticketCategories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]">
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                rows={4}
                placeholder="Describe your issue in detail"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <input
                type="file"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => setShowCreateTicket(false)}
              variant="primary"
              className="flex-1"
            >
              Submit Ticket
            </Button>
            <Button
              onClick={() => setShowCreateTicket(false)}
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Help Desk</h1>
            <p className="text-gray-600">
              Get support and access self-service resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call Support
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
            <Button
              onClick={() => setShowCreateTicket(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Live Chat
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Get instant help from our support team
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Start Chat
              </Button>
            </div>
            <MessageCircle className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Video Training
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                Watch tutorials and training videos
              </p>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Watch Videos
              </Button>
            </div>
            <Video className="h-12 w-12 text-purple-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Schedule Demo
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Book a personalized demo session
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Book Demo
              </Button>
            </div>
            <Calendar className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockTickets.filter((t) => t.status === "open").length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mockTickets.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Knowledge Articles</p>
              <p className="text-2xl font-bold text-green-600">
                {mockKnowledgeBase.length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Book className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">FAQs</p>
              <p className="text-2xl font-bold text-purple-600">
                {mockFAQs.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tickets"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "knowledge"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "faq"
                ? "border-[#01443B] text-[#01443B]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            FAQ
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                >
                  {(activeTab === "tickets"
                    ? ticketCategories
                    : knowledgeCategories
                  ).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {activeTab === "tickets" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === "tickets" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.category} • {ticket.submittedBy}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">
                          {ticket.status.replace("_", " ")}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.createdDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {ticket.responses}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredKnowledge.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.category}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Read
                </Button>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.content}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {article.views}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    {article.helpful}
                  </div>
                </div>
                <span>Updated {article.lastUpdated}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "faq" && (
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <button
                onClick={() =>
                  setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                }
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-[#01443B]" />
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                </div>
                {expandedFAQ === faq.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedFAQ === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4"
                >
                  <div className="pl-8 border-l-2 border-gray-200">
                    <p className="text-gray-600 mb-4">{faq.answer}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {faq.category}
                        </span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          {faq.helpful} helpful
                        </div>
                      </div>
                      <span>Updated {faq.lastUpdated}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {filteredTickets.length === 0 && activeTab === "tickets" && (
        <div className="text-center py-12">
          <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ||
            selectedCategory !== "All" ||
            selectedPriority !== "All" ||
            selectedStatus !== "All"
              ? "Try adjusting your search or filters"
              : "Create your first support ticket to get help"}
          </p>
          <Button onClick={() => setShowCreateTicket(true)}>
            Create Ticket
          </Button>
        </div>
      )}

      <CreateTicketModal />
    </div>
  );
};

export default HelpDesk;
