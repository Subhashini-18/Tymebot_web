import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, Edit2Icon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommonDataByEndpoint,
  fetchCommonDataById,
} from "@/store/slice/commonSlice";
import { AppDispatch, RootState } from "@/store";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";
import Button from "../ui/Button";
import DataTable from "../ui/DataTable";
import MasterModal from "./MasterModal";
import { form } from "framer-motion/client";
// import { AppDispatch, RootState } from '@/store/store';
// import DataTable from '@/components/ui/form/DataTable';
// import { Card } from '@/components/ui/layout/Card';
// import Button from '@/components/ui/form/Button';
// import MasterModal from './MasterModal';
// import { useToast } from '@/context/ToastContext';
// import { apiService } from '@/service/apiservice';
// import { MockDataService } from '@/service/mockDataService';

interface MasterScreenProps {
  title: string;
  endpoint: string;
  columns: any[];
  formFields: any[];
  searchPlaceholder?: string;
}

export const MasterScreen: React.FC<MasterScreenProps> = ({
  title,
  endpoint,
  columns,
  formFields,
  searchPlaceholder = "Search...",
}) => {
  console.log(endpoint);
  const { currentTheme }: any = useTheme();
  console.log(currentTheme)
  // const currentTheme: any = themes[theme];

  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  console.log(selectedItem + 'SelectedItem for Update')
  const [modalKey, setModalKey] = useState(0); // <-- Add this line
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_PATH_COMMON = import.meta.env.VITE_API_PATH || "";
  const API_BASE_PATH_IDAM = import.meta.env.VITE_IAM_API_PATH || "";
  const API_BASE_PATH_QUESTIONNAIRE = import.meta.env.VITE_API_PATH || "";
  const API_BASE_QUESTIONNAIRE_PORT = import.meta.env.VITE_BASE_PORT;
  const API_BASE_PATH_TENANT = import.meta.env.VITE_TENANT_API_PATH || "";
  const API_BASE_PATH_EMAIL = import.meta.env.VITE_EMAIL_API_PATH || "";
  const API_BASE_EMAIL_PORT = import.meta.env.VITE_EMAIL_PORT;
  const API_BASE_MAS_PORT = import.meta.env.VITE_BASE_PORT;
  const API_BASE_IDAM_PORT = import.meta.env.VITE_BASE_IDAM_PORT;
  const API_BASE_TENANT_PORT = import.meta.env.VITE_BASE_TENANT_PORT;

  const allowedEndpointsForEmail = [
    "email_action_token",
    "email_layout",
    "email_rate_limit_policy",
    "email_send_attachment",
    "email_send_audit_log",
    "email_send_queue",
    "email_template_binding_mode",
    "email_template",
    "email_template_placeholder",
    "email_template_rules",
    "email_template_tags",
    "email_template_translation",
    "email_template_version_history",
    "email_template_test_log",
    "tenant_email_additional_properties",
    "tenant_email_config",
    "tenant_email_provider",
    "user_email_preferences",
    "email_send_audit_log",
    "email_test_log",
    "binding_rule_key",
    "config_data_type_master",
    "email_campaign",
    "email_campaign_recipient",
    "email_provider",
    "email_send_queue_placeholder",
    "email_send_recipient",
    "email_template_binding_mode_rule",
    "provider_config_key",
    "recipient_type_master",
    "tenant_email_layout",
    "tenant_email_provider_config",
    "tenant_email_sender_profile_config",
    "tenant_email_sender_profile",
    "tenant_email_template",
    "user_email_preference_value",
    "user_preference_key",
  ]

  const allowedEndpointsForIdam = [
    "auth_user",
    "auth_user_role",
    "auth_statuses",
    "auth_role",
    "auth_password",
    "permission",
    "role_permission",
    "menus"
  ];

  const allowedEndpointsForTenant = [
    "domains",
    "tenant",
    "tenant_association",
    "tenant_association_status",
    "tenant_association_type",
    "tenant_branding",
    "tenant_contact",
    "tenant_contact_type",
    "tenant_domains",
    "tenant_hierarchy_level",
    "tenant_setting",
    "tenant_setting_key",
    "tenant_status",
    "tenant_type",

  ];

  const allwoedForQuestoinnaire = [
    "question",
    "question_tag",
    "question_type",
    "questionnaire_group",
    "risk_level",
  ];

  // Determine which API path and port to use based on endpoint
  const isIdamMaster = allowedEndpointsForIdam.some(substring => endpoint.includes(substring));

  const isTenantMaster = allowedEndpointsForTenant.some(substring => endpoint.includes(substring));
  console.log(isTenantMaster)
  const isTenantEmailMaster = allowedEndpointsForEmail.some(substring => endpoint.includes(substring));
  const isQuestionnaireMaster = allwoedForQuestoinnaire.some(substring => endpoint.includes(substring));

  let API_BASE_PATH;
  let API_BASE_PORT;

  // Check email endpoints first (more specific) before tenant endpoints
  if (isTenantEmailMaster) {
    API_BASE_PATH = API_BASE_PATH_EMAIL;
    API_BASE_PORT = API_BASE_EMAIL_PORT || 8083;
  } else if (isTenantMaster) {
    API_BASE_PATH = API_BASE_PATH_TENANT;
    API_BASE_PORT = API_BASE_TENANT_PORT || 8081;
  } else if (isIdamMaster) {
    API_BASE_PATH = API_BASE_PATH_IDAM;
    API_BASE_PORT = API_BASE_IDAM_PORT;
  } else if (isQuestionnaireMaster) {
    API_BASE_PATH = API_BASE_PATH_QUESTIONNAIRE;
    API_BASE_PORT = API_BASE_QUESTIONNAIRE_PORT || 443;
  } else {
    API_BASE_PATH = API_BASE_PATH_COMMON;
    API_BASE_PORT = API_BASE_MAS_PORT || 443;
  }
  const endpointKey = `get_all_${endpoint}`;
  const endpointData = useSelector(
    (state: RootState) => state.common[endpointKey]
  );
  console.log(endpointKey + 'EndpointData')
  console.log(API_BASE_PATH, API_BASE_PORT);
  // Ensure data is always an array for rendering/filtering
  const data = Array.isArray(endpointData?.data) ? endpointData.data : [];
  const status = endpointData?.status || "idle";

  useEffect(() => {
    loadData();
  }, [endpoint]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(
        fetchCommonDataByEndpoint({
          endpoint: `get_all_${endpoint}`,
          port: API_BASE_PORT || 443,
        })
      ).unwrap();
      console.log("Data loaded successfully:", result);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      showToast({
        message: `Failed to load ${title} data: ${error.message || "Server may be unavailable"
          }`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    // Set default values for new records, including isActive: true
    const defaultValues = {
      isActive: true, // Default checkbox to checked
      // Add other default values if needed
    };
    setSelectedItem(defaultValues);
    setModalKey((prev) => prev + 1); // <-- Add this line to force modal remount
    setIsModalOpen(true);
  };

  const handleEdit = async (item: any) => {
    console.log("Editing item:", item);
    try {
      setIsLoading(true);

      // Dispatch the action and unwrap the result
      const response: any = await dispatch(
        fetchCommonDataById({
          endpoint: `get_by_id_${endpoint}`,
          id: item.id.toString(),
          port: API_BASE_PORT,
        })
      ).unwrap();

      console.log("Fetched item details:", response);

      // Fix: Set selectedItem to response.data if present, else response
      setSelectedItem(response.data ? response.data[0] : response);
      setModalKey((prev) => prev + 1); // <-- Add this line to force modal remount
      setIsModalOpen(true);
    } catch (error: any) {
      console.error("Error fetching item details:", error);
      showToast({
        message: `Failed to load ${title.toLowerCase()} details: ${error.message || "Unknown error"
          }`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${title.toLowerCase()}?`
      )
    ) {
      try {
        setIsLoading(true);

        // Try real API first, fallback to mock data
        try {
          await apiService.delete(
            `${API_BASE_PATH}/delete_${endpoint}/${item.id}`,
            API_BASE_PORT
          );
        } catch (apiError) {
          console.warn("API not available, using mock data service");
          // await MockDataService.delete(`delete_${endpoint}`, item.id);
        }

        showToast({
          message: `${title} deleted successfully`,
          type: "success",
        });
        loadData();
      } catch (error: any) {
        showToast({
          message: `Failed to delete ${title.toLowerCase()}: ${error.message}`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (formData: any) => {
    const isEditing = selectedItem?.id; // Check if we have an ID to determine if it's editing
    const updatedData = {
      ...formData,
      id: selectedItem?.id,
      auditTrailId: selectedItem?.auditTrailId ?? 0,
    };
    try {
      setIsLoading(true);

      // Try real API first, fallback to mock data
      try {
        if (isEditing) {
          // Update existing item
          await apiService.put(
            `${API_BASE_PATH}update_${endpoint}?id=${selectedItem.id}`,
            updatedData,
            API_BASE_PORT
          );
        } else {
          console.log(API_BASE_PATH,'get')
          // Create new item
          await apiService.post(
            `${API_BASE_PATH}create_${endpoint}`,
            formData,
            API_BASE_PORT
          );
        }
      } catch (apiError) {
        console.warn("API not available, using mock data service");
        // if (isEditing) {
        //   await MockDataService.update(`update_${endpoint}`, selectedItem.id, formData);
        // } else {
        //   await MockDataService.create(`create_${endpoint}`, formData);
        // }
      }

      showToast({
        message: `${title} ${isEditing ? "updated" : "created"} successfully`,
        type: "success",
      });
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      showToast({
        message: `Failed to ${isEditing ? "update" : "create"
          } ${title.toLowerCase()}: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log(data)
  const filteredData = data.filter((item: any) => {
    if (!searchTerm) return true;
    return Object.values(item).some((value: any) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderActions = (item: any) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleEdit(item)}
        className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-110 group"
        title="Edit"
      >
        <Edit2Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={() => handleDelete(item)}
        className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110 group"
        title="Delete"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                {title} Management
              </h1>
              <p
                className="text-sm sm:text-base opacity-75 font-medium flex items-center gap-2"
                style={{ color: currentTheme?.colors?.text }}
              >
                <span>
                  Manage and organize your {title.toLowerCase()} records
                  efficiently
                </span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <div className={`w-2 h-2 ${data.length === 0 ? 'bg-red-500' : 'bg-green-500'}  rounded-full animate-pulse`}></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {data?.length} records
                  </span>
                </div>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAdd}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Add {title}</span>
              </Button>
            </div>
          </div>
        </div>
        {/* Enhanced Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title} Records
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {status === "loading" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Loading...
                  </span>
                </div>
              )}
            </div>

            {filteredData.length === 0 && status !== "loading" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No {title.toLowerCase()} found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? `No records match "${searchTerm}"`
                    : `Get started by adding your first ${title.toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  actions={renderActions}
                  emptyMessage={`No ${title.toLowerCase()} found`}
                  itemsPerPage={10}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modal */}
        <MasterModal
          key={modalKey} // <-- Add this line to force remount/reset
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedItem?.id ? `Edit ${title}` : `Add ${title}`}
          formFields={formFields}
          initialData={selectedItem}
          onSave={handleSave}
          isLoading={isLoading}
        // port={API_BASE_PORT}
        />
      </div>
    </div>
  );
};
