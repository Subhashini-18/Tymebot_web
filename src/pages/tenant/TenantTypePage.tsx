import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantTypePage: React.FC = () => {
  const columns = [
{
      key: "tenantTypeCode",
      label: "Tenant Type Code",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "tenantTypeName",
      label: "Tenant Type Name",
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
      name: "tenantTypeCode",
      label: "Tenant Type Code",
      type: "text",
      placeholder: "Enter Tenant Type Code",
      required: true,
    },{
      name: "tenantTypeName",
      label: "Tenant Type Name",
      type: "text",
      placeholder: "Enter Tenant Type Name",
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
      title="Tenant Type"
      endpoint="tenant_type"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Type tag by name ,description..."
    />
  );
};

export default TenantTypePage;
