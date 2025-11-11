import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantSettingPage: React.FC = () => {
  const columns = [
{
      key: "tenantId",
      label: "Tenant Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantName || "N/A",
    },{
      key: "settingKeyId",
      label: "Setting Key Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantSettingKeyName || "N/A",
    },{
      key: "settingValue",
      label: "Setting Value",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "isActive",
      label: "Status",
      render: (row: any) =>
        row.isActive ? (
          <span className="text-green-600 font-sm">Active</span>
        ) : (
          <span className="text-red-600 font-sm">Inactive</span>
        ),
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "All Status", value: "" },
        { label: "Active", value: 'true' },
        { label: "Inactive", value: 'false' },
      ],
    },

  ];

  const formFields = [
{
      name: "tenantId",
      label: "Tenant Id",
      type: "select",
      placeholder: "Select Tenant Id ",
      required: true,
      optionsApi: "get_all_tenant",
      labelName: "tenantName",
    },{
      name: "settingKeyId",
      label: "Setting Key Id",
      type: "select",
      placeholder: "Select Setting Key Id ",
      required: true,
      optionsApi: "get_all_tenant_setting_key",
      labelName: "tenantSettingKeyName",
    },{
      name: "settingValue",
      label: "Setting Value",
      type: "text",
      placeholder: "Enter Setting Value",
      required: false,
    },
    {
      name: "isActive",
      label: "Active Status",
      type: "checkbox",
      required: false,
    },
  ];

  return (
    <MasterScreen
      title="Tenant Setting"
      endpoint="tenant_setting"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Setting tag by name ,description..."
    />
  );
};

export default TenantSettingPage;
