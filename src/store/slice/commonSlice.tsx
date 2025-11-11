// import ApiService from '@/services/api/apiService';

import { apiService } from "../../services/api/apiservice";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { apiService } from '../../service/apiservice';

export interface FetchCommonDataById {
  endpoint: string;

  id: string;

  port: number;
}
const API_BASE_PATH_COMMON = import.meta.env.VITE_API_PATH || "";
const API_BASE_PATH_IDAM = import.meta.env.VITE_IAM_API_PATH || "";
const API_BASE_PATH_TENANT = import.meta.env.VITE_TENANT_API_PATH || "";
const API_BASE_PATH_EMAIL = import.meta.env.VITE_EMAIL_API_PATH || "";
// List of all endpoints

const allowedEndpointsForEmail = [
  "get_all_email_action_token",
  "get_by_id_email_action_token",
  "get_all_email_layout",
  "get_by_id_email_layout",
  "get_all_email_rate_limit_policy",
  "get_by_id_email_rate_limit_policy",
  "get_all_email_send_attachment",
  "get_all_email_send_audit_log",
  "get_all_email_send_queue",
  "get_all_email_template_binding_mode",
  "get_by_id_email_template_binding_mode",
  "get_all_email_template",
  "get_all_email_template_placeholder",
  "get_all_email_template_rules",
  "get_all_email_template_tags",
  "get_all_email_template_translation",
  "get_all_email_template_version_history",
  "get_all_email_template_test_log",
  "get_all_tenant_email_additional_properties",
  "get_by_id_tenant_email_additional_properties",
  "get_all_tenant_email_config",
  "get_all_tenant_email_provider",
  "get_by_id_tenant_email_provider",
  "get_all_user_email_preferences",
  "get_all_email_test_log",
  "get_all_binding_rule_key",
  "get_by_id_binding_rule_key",
  "get_all_config_data_type_master",
  "get_by_id_config_data_type_master",
  "get_all_email_campaign",
  "get_by_id_email_campaign",
  "get_all_email_campaign_recipient",
  "get_by_id_email_campaign_recipient",
  "get_all_email_provider",
  "get_by_id_email_provider",
  "get_all_email_send_queue_placeholder",
  "get_by_id_email_send_queue_placeholder",
  "get_all_email_send_recipient",
  "get_by_id_email_send_recipient",
  "get_all_email_template_binding_mode_rule",
  "get_by_id_email_template_binding_mode_rule",
  "get_all_provider_config_key",
  "get_by_id_provider_config_key",
  "get_all_recipient_type_master",
  "get_by_id_recipient_type_master",
  "get_all_tenant_email_layout",
  "get_by_id_tenant_email_layout",
  "get_all_tenant_email_provider_config",
  "get_by_id_tenant_email_provider_config",
  "get_all_tenant_email_sender_profile_config",
  "get_by_id_tenant_email_sender_profile_config",
  "get_all_tenant_email_sender_profile",
  "get_by_id_tenant_email_sender_profile",
  "get_all_tenant_email_template",
  "get_by_id_tenant_email_template",
  "get_all_user_email_preference_value",
  "get_by_id_user_email_preference_value",
  "get_all_user_preference_key",
  "get_by_id_user_preference_key",
];

const allowedEndpointsForIdam = [
  "get_all_auth_user",
  "get_all_auth_user_role",
  "get_all_auth_statuses",
  "get_all_auth_role",
  "get_all_auth_password",
  "get_all_permission",
  "get_all_role_permission",
  "get_all_menus",
];

const allowedEndpointsForTenant = [
  "get_all_domains",
  "get_all_tenant",
  "get_all_tenant_association",
  "get_all_tenant_association_status",
  "get_all_tenant_association_type",
  "get_all_tenant_branding",
  "get_all_tenant_contact",
  "get_all_tenant_contact_type",
  "get_all_tenant_domains",
  "get_all_tenant_hierarchy_level",
  "get_all_tenant_setting",
  "get_all_tenant_setting_key",
  "get_all_tenant_status",
  "get_all_tenant_type",
  "get_by_id_domains",
  "get_by_id_tenant",
  "get_by_id_tenant_association",
  "get_by_id_tenant_association_status",
  "get_by_id_tenant_association_type",
  "get_by_id_tenant_branding",
  "get_by_id_tenant_contact",
  "get_by_id_tenant_contact_type",
  "get_by_id_tenant_domains",
  "get_by_id_tenant_hierarchy_level",
  "get_by_id_tenant_setting",
  "get_by_id_tenant_setting_key",
  "get_by_id_tenant_status",
  "get_by_id_tenant_type",
];

const endpoints = [
  // Actor endpoints
  "get_all_actor",
  "get_by_id_actor",

  // Master data endpoints
  "get_all_annual_volume",
  "get_by_id_annual_volume",

  "get_all_compliance_framework",
  "get_by_id_compliance_framework",

  "get_all_contract_duration",
  "get_by_id_contract_duration",

  "get_all_contract_type",
  "get_by_id_contract_type",

  "get_all_currency",
  "get_by_id_currency",

  "get_all_data_access_type",
  "get_by_id_data_access_type",

  "get_all_data_classification",
  "get_by_id_data_classification",

  "get_all_data_hosting_arrangement",
  "get_by_id_data_hosting_arrangement",

  "get_all_data_volume",
  "get_by_id_data_volume",

  "get_all_desired_module",
  "get_by_id_desired_module",

  "get_all_geography_of_operation",
  "get_by_id_geography_of_operation",

  "get_all_industry_sector",
  "get_by_id_industry_sector",

  "get_all_integration_expectation",
  "get_by_id_integration_expectation",

  "get_all_nature_of_third_party",
  "get_by_id_nature_of_third_party",

  "get_all_operational_region",
  "get_by_id_operational_region",

  "get_all_personal_data_type",
  "get_by_id_personal_data_type",

  "get_all_regulatory_framework",
  "get_by_id_regulatory_framework",

  "get_all_service_replaceability",
  "get_by_id_service_replaceability",

  "get_all_third_party_type",
  "get_by_id_third_party_type",

  "get_all_question",
  "get_by_id_question",

  "get_all_country",
  "get_by_id_country",

  "get_all_question_tag",
  "get_by_id_question_tag",

  "get_all_questionnaire_group",
  "get_by_id_questionnaire_group",

  "get_all_question_type",
  "get_by_id_question_type",

  "get_all_org_certification",
  "get_by_id_org_certification",

  "get_all_risk_level",
  "get_by_id_risk_level",

  "get_all_vendor_volume",
  "get_by_id_vendor_volume",

  "get_all_domains",
  "get_all_tenant",
  "get_all_tenant_association",
  "get_all_tenant_association_status",
  "get_all_tenant_association_type",
  "get_all_tenant_branding",
  "get_all_tenant_contact",
  "get_all_tenant_contact_type",
  "get_all_tenant_domains",
  "get_all_tenant_hierarchy_level",
  "get_all_tenant_setting",
  "get_all_tenant_setting_key",
  "get_all_tenant_status",
  "get_all_tenant_type",

  "get_by_id_domains",
  "get_by_id_tenant",
  "get_by_id_tenant_association",
  "get_by_id_tenant_association_status",
  "get_by_id_tenant_association_type",
  "get_by_id_tenant_branding",
  "get_by_id_tenant_contact",
  "get_by_id_tenant_contact_type",
  "get_by_id_tenant_domains",
  "get_by_id_tenant_hierarchy_level",
  "get_by_id_tenant_setting",
  "get_by_id_tenant_setting_key",
  "get_by_id_tenant_status",
  "get_by_id_tenant_type",

  // Email endpoints
  "get_all_email_action_token",
  "get_by_id_email_action_token",

  "get_all_email_template_binding_mode",
  "get_by_id_email_template_binding_mode",

  "get_all_email_layout",
  "get_all_email_rate_limit_policy",
  "get_by_id_email_rate_limit_policy",
  "get_all_email_send_attachment",
  "get_all_email_send_audit_log",
  "get_all_email_send_queue",
  "get_all_email_template",
  "get_all_email_template_placeholder",
  "get_all_email_template_rules",
  "get_all_email_template_tags",
  "get_all_email_template_translation",
  "get_all_email_template_version_history",
  "get_all_email_template_test_log",

  "get_all_tenant_email_additional_properties",
  "get_by_id_tenant_email_additional_properties",

  "get_all_tenant_email_config",
  "get_all_tenant_email_provider",
  "get_all_user_email_preferences",
  "get_all_email_test_log",

  // Additional Email endpoints
  "get_all_binding_rule_key",
  "get_by_id_binding_rule_key",

  "get_all_config_data_type_master",
  "get_by_id_config_data_type_master",

  "get_all_email_campaign",
  "get_by_id_email_campaign",

  "get_all_email_campaign_recipient",
  "get_by_id_email_campaign_recipient",

  "get_all_email_provider",
  "get_by_id_email_provider",

  "get_all_email_send_queue_placeholder",
  "get_by_id_email_send_queue_placeholder",

  "get_all_email_send_recipient",
  "get_by_id_email_send_recipient",

  "get_all_email_template_binding_mode_rule",
  "get_by_id_email_template_binding_mode_rule",

  "get_all_provider_config_key",
  "get_by_id_provider_config_key",

  "get_all_recipient_type_master",
  "get_by_id_recipient_type_master",

  "get_all_tenant_email_layout",
  "get_by_id_tenant_email_layout",

  "get_all_tenant_email_provider_config",
  "get_by_id_tenant_email_provider_config",

  "get_all_tenant_email_sender_profile_config",
  "get_by_id_tenant_email_sender_profile_config",

  "get_all_tenant_email_sender_profile",
  "get_by_id_tenant_email_sender_profile",

  "get_all_tenant_email_template",
  "get_by_id_tenant_email_template",

  "get_all_user_email_preference_value",
  "get_by_id_user_email_preference_value",

  "get_all_user_preference_key",
  "get_by_id_user_preference_key",

  "get_all_notification_channel_master",
  "get_by_id_notification_channel_master",
  "get_all_notification_device",
  "get_by_id_notification_device",
  "get_all_notification_instance",
  "get_by_id_notification_instance",
  "get_all_notification_send_audit_log",
  "get_by_id_notification_send_audit_log",
  "get_all_notification_send_queue",
  "get_by_id_notification_send_queue",
  "get_all_notification_send_queue_placeholder",
  "get_by_id_notification_send_queue_placeholder",
  "get_all_notification_send_recipient",
  "get_by_id_notification_send_recipient",
  "get_all_notification_template",
  "get_by_id_notification_template",
  "get_all_notification_template_placeholder",
  "get_by_id_notification_template_placeholder",
  "get_all_provider_config_key",
  "get_by_id_provider_config_key",
  "get_all_tenant_notification_template",
  "get_by_id_tenant_notification_template",
  "get_all_tenant_push_provider",
  "get_by_id_tenant_push_provider",
  "get_all_tenant_push_provider_config",
  "get_by_id_tenant_push_provider_config",
  "get_all_user_notification_pref_value",
  "get_by_id_user_notification_pref_value",
  "get_all_user_notification_preferences",
  "get_by_id_user_notification_preferences",
];

// Async thunk for fetching data for a specific endpoint

export const fetchCommonDataById = createAsyncThunk(
  "common/fetchCommonDataById",
  async ({ endpoint, id, port }: FetchCommonDataById, { rejectWithValue }) => {
    try {
      // Determine which API path and port to use
      const isIdamMaster = allowedEndpointsForIdam.some((substring) =>
        endpoint.includes(substring)
      );
      const isTenantMaster = allowedEndpointsForTenant.some((substring) =>
        endpoint.includes(substring)
      );
      const isTenantEmailMaster = allowedEndpointsForEmail.some((substring) =>
        endpoint.includes(substring)
      );

      console.log(
        "isIdamMaster:",
        isIdamMaster,
        "isTenantMaster:",
        isTenantMaster,
        "isTenantEmailMaster:",
        isTenantEmailMaster
      );

      let API_BASE_PATH;
      let targetPort = port;

      // Check email endpoints first (more specific) before tenant endpoints
      if (isTenantEmailMaster) {
        API_BASE_PATH = API_BASE_PATH_EMAIL;
        targetPort = parseInt(import.meta.env.VITE_EMAIL_PORT) || 8083;
      } else if (isTenantMaster) {
        API_BASE_PATH = API_BASE_PATH_TENANT;
        targetPort = parseInt(import.meta.env.VITE_BASE_TENANT_PORT) || 8081;
      } else if (isIdamMaster) {
        API_BASE_PATH = API_BASE_PATH_IDAM;
      } else {
        API_BASE_PATH = API_BASE_PATH_COMMON;
      }

      const url = `${API_BASE_PATH}${endpoint}?id=${id}`;
      console.log("Fetching data from URL:", url, "on port:", targetPort);

      // Try real API first, fallback to mock data
      try {
        const response: any = await apiService.get(url, {}, targetPort);
        console.log("API Response:", response);
        return { endpoint, data: response.data || response };
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError);
        // const mockData = await MockDataService.getById(endpoint, id);
        // return { endpoint, data: mockData };
      }
    } catch (error: any) {
      console.error("Error in fetchCommonDataById:", error);
      return rejectWithValue({
        endpoint,
        error: error.response?.data || error.message || "Something went wrong",
      });
    }
  }
);

export const fetchCommonDataByEndpoint = createAsyncThunk(
  "common/fetchCommonDataByEndpoint",
  async (
    { endpoint, port }: { endpoint: string; port: number },
    { rejectWithValue }
  ) => {
    try {
      // Determine which API path and port to use
      const isIdamMaster = allowedEndpointsForIdam.some((substring) =>
        endpoint.includes(substring)
      );
      const isTenantMaster = allowedEndpointsForTenant.some((substring) =>
        endpoint.includes(substring)
      );
      const isTenantEmailMaster = allowedEndpointsForEmail.some((substring) =>
        endpoint.includes(substring)
      );

      console.log(
        "isIdamMaster:",
        isIdamMaster,
        "isTenantMaster:",
        isTenantMaster,
        "isTenantEmailMaster:",
        isTenantEmailMaster
      );

      let API_BASE_PATH;
      let targetPort = port;

      // Check email endpoints first (more specific) before tenant endpoints
      if (isTenantEmailMaster) {
        API_BASE_PATH = API_BASE_PATH_EMAIL;
        targetPort = parseInt(import.meta.env.VITE_EMAIL_PORT) || 8083;
      } else if (isTenantMaster) {
        API_BASE_PATH = API_BASE_PATH_TENANT;
        targetPort = parseInt(import.meta.env.VITE_BASE_TENANT_PORT) || 8081;
      } else if (isIdamMaster) {
        API_BASE_PATH = API_BASE_PATH_IDAM;
      } else {
        API_BASE_PATH = API_BASE_PATH_COMMON;
      }

      const url = `${API_BASE_PATH}${endpoint}`;
      console.log("Fetching data from URL:", url, "on port:", targetPort);

      // Try real API first, fallback to mock data
      try {
        const response: any = await apiService.get(url, {}, targetPort);
        console.log("API Response:", response);
        return { endpoint, data: response.data };
      } catch (apiError) {
        console.warn("API not available, using mock data:", apiError);
        // const mockData = await MockDataService.getAll(endpoint);
        // return { endpoint, data: mockData };
      }
    } catch (error: any) {
      console.error("Error in fetchCommonDataByEndpoint:", error);
      return rejectWithValue({
        endpoint,
        error: error.response?.data || error.message || "Something went wrong",
      });
    }
  }
);

// Dynamically create the initial state

const initialState = endpoints.reduce(
  (acc, endpoint) => {
    acc[endpoint] = { data: null, status: "idle", error: null };

    return acc;
  },

  {} as Record<string, { data: any; status: string; error: any }>
);

const commonSlice = createSlice({
  name: "common",

  initialState,

  reducers: {
    // Clear data for a specific endpoint

    clearCommonData: (state, action) => {
      const { endpoint } = action.payload;

      if (state[endpoint]) {
        state[endpoint] = { data: null, status: "idle", error: null };
      }
    },

    // Clear all master data

    clearAllCommonData: (state) => {
      Object.keys(state).forEach((key) => {
        state[key] = { data: null, status: "idle", error: null };
      });
    },
  },

  extraReducers: (builder) => {
    // Handle fetchMasterDataById

    builder

      .addCase(fetchCommonDataById.pending, (state: any, action) => {
        const { endpoint } = action.meta.arg;

        if (state[endpoint]) {
          state[endpoint].status = "loading";

          state[endpoint].error = null;
        }
      })

      .addCase(fetchCommonDataById.fulfilled, (state: any, action) => {
        const { endpoint, data }: any = action.payload;

        if (state[endpoint]) {
          state[endpoint].status = "succeeded";

          state[endpoint].data = data;
        }
      })

      .addCase(fetchCommonDataById.rejected, (state: any, action) => {
        const { endpoint, error }: any = action.payload;

        if (state[endpoint]) {
          state[endpoint].status = "failed";

          state[endpoint].error = error;
        }
      });

    // Handle fetchAllMasterData

    builder

      .addCase(fetchCommonDataByEndpoint.pending, (state: any, action) => {
        const { endpoint } = action.meta.arg;

        if (state[endpoint]) {
          state[endpoint].status = "loading";

          state[endpoint].error = null;
        }
      })

      .addCase(fetchCommonDataByEndpoint.fulfilled, (state: any, action) => {
        const { endpoint, data }: any = action.payload;

        if (state[endpoint]) {
          state[endpoint].status = "succeeded";

          state[endpoint].data = data;
        }
      })

      .addCase(fetchCommonDataByEndpoint.rejected, (state: any, action) => {
        const { endpoint, error }: any = action.payload;

        if (state[endpoint]) {
          state[endpoint].status = "failed";

          state[endpoint].error = error;
        }
      });
  },
});

// Export actions

export const { clearCommonData, clearAllCommonData } = commonSlice.actions;

// Export reducer

export default commonSlice.reducer;
