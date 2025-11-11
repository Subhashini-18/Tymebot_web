import React from "react";
import { MasterScreen } from "@/components/common/MasterScreen";
import { div, filter } from "framer-motion/client";

const TenantBrandingPage: React.FC = () => {
  const columns = [
    {
      key: "tenantId",
      label: "Tenant Id",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row: any) => row.tenantName || "N/A",
    }, {
      key: "logoUrl",
      label: "Logo Url",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (row) => (
        <div>
          <img src={row.logoUrl} alt="" className="rounded-full h-10 w-10"  />
        </div>
      )
    }, {
      key: "colorScheme",
      label: "Color Scheme",
      sortable: true,
      filterable: true,
      filterType: "text",
    }, {
      key: "tagline",
      label: "Tagline",
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
      name: "tenantId",
      label: "Tenant Id",
      type: "select",
      placeholder: "Select Tenant Id ",
      required: true,
      optionsApi: "get_all_tenant",
      labelName: "tenantName",
    }, {
      name: "logoUrl",
      label: "Logo Url",
      type: "text",
      placeholder: "Enter Logo Url",
      required: false,
    }, {
      name: "colorScheme",
      label: "Color Scheme",
      type: "text",
      placeholder: "Enter Color Scheme",
      required: false,
    }, {
      name: "tagline",
      label: "Tagline",
      type: "text",
      placeholder: "Enter Tagline",
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
      title="Tenant Branding"
      endpoint="tenant_branding"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search Tenant Branding tag by name ,description..."
    />
  );
};

export default TenantBrandingPage;
