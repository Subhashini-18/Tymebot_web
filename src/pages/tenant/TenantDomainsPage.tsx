import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { filter } from "framer-motion/client";

const TenantDomainsPage: React.FC = () => {
  const columns = [
{
      key: "tenantId",
      label: "Tenant Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantName || "N/A",
    },{
      key: "domainMasterId",
      label: "Domain Master Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.domainsName || "N/A",
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
      name: "domainMasterId",
      label: "Domain Master Id",
      type: "select",
      placeholder: "Select Domain Master Id ",
      required: true,
      optionsApi: "get_all_domains",
      labelName: "domainsName",
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
      title="Tenant Domains"
      endpoint="tenant_domains"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Domains tag by name ,description..."
    />
  );
};

export default TenantDomainsPage;
