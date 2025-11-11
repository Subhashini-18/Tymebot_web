import React, { Suspense, lazy, useMemo, useState } from "react";
import { motion } from "framer-motion";

/** Adjust these import paths to your repo structure */
const TenantPage = lazy(() => import("@/pages/tenant/TenantPage"));
const TenantStatusPage = lazy(() => import("@/pages/tenant/TenantStatusPage"));
const TenantTypePage = lazy(() => import("@/pages/tenant/TenantTypePage"));
const TenantHierarchyLevelPage = lazy(
  () => import("@/pages/tenant/TenantHierarchyLevelPage")
);
const TenantAssociationPage = lazy(
  () => import("@/pages/tenant/TenantAssociationPage")
);
const TenantDomainsPage = lazy(
  () => import("@/pages/tenant/TenantDomainsPage")
);
const TenantSettingKeyPage = lazy(
  () => import("@/pages/tenant/TenantSettingKeyPage")
);
const TenantSettingPage = lazy(
  () => import("@/pages/tenant/TenantSettingPage")
);
const TenantBrandingPage = lazy(
  () => import("@/pages/tenant/TenantBrandingPage")
);

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm transition-colors",
        active
          ? "bg-violet-600 text-white"
          : "bg-white/60 hover:bg-white text-gray-700 border border-gray-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="rounded-xl border bg-white/90 shadow-sm p-4">
        {children}
      </div>
    </div>
  );
}

type SubTab = {
  key: string;
  label: string;
  Component: React.LazyExoticComponent<React.FC<any>>;
};

type Group = {
  key: string;
  title: string;
  description: string;
  subTabs: SubTab[];
};

const GROUPS: Group[] = [
  {
    key: "core",
    title: "Core Tenant",
    description:
      "Base tenant constructs: tenant record, type, status, and hierarchy.",
    subTabs: [
      { key: "tenant", label: "Tenant", Component: TenantPage },
      { key: "status", label: "Tenant Status", Component: TenantStatusPage },
      { key: "type", label: "Tenant Type", Component: TenantTypePage },
      { key: "brand", label: "Tenant Branding", Component: TenantBrandingPage },
      {
        key: "hierarchy",
        label: "Hierarchy Level",
        Component: TenantHierarchyLevelPage,
      },
    ],
  },
  {
    key: "relationships",
    title: "Associations",
    description: "How tenants relate to each other and what domains they own.",
    subTabs: [
      {
        key: "association",
        label: "Tenant Association",
        Component: TenantAssociationPage,
      },
      { key: "domains", label: "Tenant Domains", Component: TenantDomainsPage },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    description: "Keys and values that shape tenant-specific behavior.",
    subTabs: [
      {
        key: "setting-keys",
        label: "Setting Keys",
        Component: TenantSettingKeyPage,
      },
      {
        key: "settings",
        label: "Tenant Settings",
        Component: TenantSettingPage,
      },
    ],
  },
];

const Shimmer = () => (
  <div className="animate-pulse h-[360px] w-full rounded-xl bg-gray-100" />
);

const TenantSuiteManager: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].key);
  const currentGroup = useMemo(
    () => GROUPS.find((g) => g.key === activeGroup) ?? GROUPS[0],
    [activeGroup]
  );

  const [activeSub, setActiveSub] = useState(currentGroup.subTabs[0].key);

  React.useEffect(() => {
    if (!currentGroup.subTabs.find((s) => s.key === activeSub)) {
      setActiveSub(currentGroup.subTabs[0].key);
    }
  }, [currentGroup, activeSub]);

  const ActiveComponent =
    currentGroup.subTabs.find((s) => s.key === activeSub)?.Component ??
    currentGroup.subTabs[0].Component;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-violet-50 to-white">
      <div className="mx-auto max-w-8xl px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tenant Suite Manager
            </h1>
            <p className="text-sm text-gray-600">
              All Tenant Masters & Ops in one screen.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <TabPill
              key={g.key}
              active={g.key === activeGroup}
              onClick={() => setActiveGroup(g.key)}
            >
              {g.title}
            </TabPill>
          ))}
        </div>

        <Section
          title={currentGroup.title}
          description={currentGroup.description}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {currentGroup.subTabs.map((s) => (
              <TabPill
                key={s.key}
                active={s.key === activeSub}
                onClick={() => setActiveSub(s.key)}
              >
                {s.label}
              </TabPill>
            ))}
          </div>

          <Suspense fallback={<Shimmer />}>
            <ActiveComponent />
          </Suspense>
        </Section>
      </div>
    </div>
  );
};

export default TenantSuiteManager;
