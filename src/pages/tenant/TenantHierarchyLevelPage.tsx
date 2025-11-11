import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantHierarchyLevelPage: React.FC = () => {
  const columns = [
{
      key: "hierarchyLevelCode",
      label: "Hierarchy Level Code",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "tenantHierarchyLevelName",
      label: "Tenant Hierarchy Level Name",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "hierarchyLevelValue",
      label: "Hierarchy Level Value",
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
      name: "hierarchyLevelCode",
      label: "Hierarchy Level Code",
      type: "text",
      placeholder: "Enter Hierarchy Level Code",
      required: true,
    },{
      name: "tenantHierarchyLevelName",
      label: "Tenant Hierarchy Level Name",
      type: "text",
      placeholder: "Enter Tenant Hierarchy Level Name",
      required: true,
    },{
      name: "hierarchyLevelValue",
      label: "Hierarchy Level Value",
      type: "text",
      placeholder: "Enter Hierarchy Level Value",
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
      title="Tenant Hierarchy Level"
      endpoint="tenant_hierarchy_level"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Hierarchy Level tag by name ,description..."
    />
  );
};

export default TenantHierarchyLevelPage;
