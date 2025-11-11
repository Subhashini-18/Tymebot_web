import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantSettingKeyPage: React.FC = () => {
  const columns = [
{
      key: "tenantSettingKeyName",
      label: "Tenant Setting Key Name",
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
      name: "tenantSettingKeyName",
      label: "Tenant Setting Key Name",
      type: "text",
      placeholder: "Enter Tenant Setting Key Name",
      required: true,
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
      title="Tenant Setting Key"
      endpoint="tenant_setting_key"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Setting Key tag by name ,description..."
    />
  );
};

export default TenantSettingKeyPage;
