import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantStatusPage: React.FC = () => {
  const columns = [
{
      key: "statusCode",
      label: "Status Code",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "tenantStatusName",
      label: "Tenant Status Name",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "description",
      label: "Description",
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
      name: "statusCode",
      label: "Status Code",
      type: "text",
      placeholder: "Enter Status Code",
      required: true,
    },{
      name: "tenantStatusName",
      label: "Tenant Status Name",
      type: "text",
      placeholder: "Enter Tenant Status Name",
      required: true,
    },{
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter Description",
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
      title="Tenant Status"
      endpoint="tenant_status"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Status tag by name ,description..."
    />
  );
};

export default TenantStatusPage;
