import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantAssociationPage: React.FC = () => {
  const columns = [
    {
      key: "sourceTenantId",
      label: "Source Tenant Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.sourceTenantId || "N/A",
    }, {
      key: "sourceTenantId",
      label: "Target Tenant Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.sourceTenantId || "N/A",
    }, {
      key: "tenantAssociationTypeId",
      label: "Tenant Association Type Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantAssociationTypeName || "N/A",
    }, {
      key: "tenantAssociationStatusId",
      label: "Tenant Association Status Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantAssociationStatusName || "N/A",
    }, {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      filterable: true,
      filterType: "text",
    }, {
      key: "endDate",
      label: "End Date",
      sortable: true,
      filterable: true,
      filterType: "text",
    }, {
      key: "description",
      label: "Description",
      sortable: true,
      filterable: true,
      filterType: "text",
    }, {
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
      name: "sourceTenantId",
      label: "Source Tenant Id",
      type: "select",
      placeholder: "Select Source Tenant Id ",
      required: true,
      optionsApi: "get_all_tenant",
      labelName: "tenantName",
    }, {
      name: "targetTenantId",
      label: "Target Tenant Id",
      type: "select",
      placeholder: "Select Target Tenant Id ",
      required: true,
      optionsApi: "get_all_tenant",
      labelName: "tenantName",
    }, {
      name: "tenantAssociationTypeId",
      label: "Tenant Association Type Id",
      type: "select",
      placeholder: "Select Tenant Association Type Id ",
      required: true,
      optionsApi: "get_all_tenant_association_type",
      labelName: "tenantAssociationTypeName",
    }, {
      name: "tenantAssociationStatusId",
      label: "Tenant Association Status Id",
      type: "select",
      placeholder: "Select Tenant Association Status Id ",
      required: true,
      optionsApi: "get_all_tenant_association_status",
      labelName: "tenantAssociationStatusName",
    }, {
      name: "startDate",
      label: "Start Date",
      type: "text",
      placeholder: "Enter Start Date",
      required: false,
    }, {
      name: "endDate",
      label: "End Date",
      type: "text",
      placeholder: "Enter End Date",
      required: false,
    }, {
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
      title="Tenant Association"
      endpoint="tenant_association"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Association tag by name ,description..."
    />
  );
};

export default TenantAssociationPage;
