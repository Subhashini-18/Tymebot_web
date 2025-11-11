import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantPage: React.FC = () => {
  const columns = [
{
      key: "tenantCode",
      label: "Tenant Code",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "tenantName",
      label: "Tenant Name",
      sortable: true,
      filterable: true,
      filterType: "text",
    },{
      key: "parentTenantId",
      label: "Parent Tenant Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantName || "N/A",
    },{
      key: "tenantHierarchyLevelId",
      label: "Tenant Hierarchy Level Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantHierarchyLevelName || "N/A",
    },{
      key: "tenantTypeId",
      label: "Tenant Type Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantTypeName || "N/A",
    },{
      key: "tenantStatusId",
      label: "Tenant Status Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantStatusName || "N/A",
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
{
      key: "tenantReferenceName",
      label: "Tenant Reference Name",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
  ];

  const formFields = [
{
      name: "tenantCode",
      label: "Tenant Code",
      type: "text",
      placeholder: "Enter Tenant Code",
      required: true,
    },{
      name: "tenantName",
      label: "Tenant Name",
      type: "text",
      placeholder: "Enter Tenant Name",
      required: true,
    },{
      name: "parentTenantId",
      label: "Parent Tenant Id",
      type: "select",
      placeholder: "Select Parent Tenant Id ",
      required: true,
      optionsApi: "get_all_tenant",
      labelName: "tenantName",
    },{
      name: "tenantHierarchyLevelId",
      label: "Tenant Hierarchy Level Id",
      type: "select",
      placeholder: "Select Tenant Hierarchy Level Id ",
      required: true,
      optionsApi: "get_all_tenant_hierarchy_level",
      labelName: "tenantHierarchyLevelName",
    },{
      name: "tenantTypeId",
      label: "Tenant Type Id",
      type: "select",
      placeholder: "Select Tenant Type Id ",
      required: true,
      optionsApi: "get_all_tenant_type",
      labelName: "tenantTypeName",
    },{
      name: "tenantStatusId",
      label: "Tenant Status Id",
      type: "select",
      placeholder: "Select Tenant Status Id ",
      required: true,
      optionsApi: "get_all_tenant_status",
      labelName: "tenantStatusName",
    },{
      name: "tenantReferenceName",
      label: "Tenant Reference Name",
      type: "text",
      placeholder: "Enter Tenant Reference Name",
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
      title="Tenant"
      endpoint="tenant"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant tag by name ,description..."
    />
  );
};

export default TenantPage;
