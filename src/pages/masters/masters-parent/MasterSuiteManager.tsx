import React, { Suspense, lazy, useMemo, useState } from "react";
import { motion } from "framer-motion";

// -------- Lazy Imports (adjust paths to match your repo) --------
const AnnualVolumePage = lazy(() => import("@/pages/masters/AnnualVolumePage"));
const ComplianceFrameworkPage = lazy(
  () => import("@/pages/masters/ComplianceFrameworkPage")
);
const ContractDurationPage = lazy(
  () => import("@/pages/masters/ContractDurationPage")
);
const ContractTypePage = lazy(() => import("@/pages/masters/ContractTypePage"));
const CountryMasterPage = lazy(() => import("@/pages/masters/CountryPage"));
const IndustrySectorPage = lazy(() => import("@/pages/masters/IndustrySectorPage"));
const GeographyOfOperationPage = lazy(() => import("@/pages/masters/GeographyOfOperationPage"));
const CurrencyPage = lazy(() => import("@/pages/masters/CurrencyPage"));
const DataAccessTypePage = lazy(
  () => import("@/pages/masters/DataAccessTypePage")
);
const DataClassificationPage = lazy(
  () => import("@/pages/masters/DataClassificationPage")
);
const DataHostingArrangementPage = lazy(
  () => import("@/pages/masters/DataHostingArrangementPage")
);
const DataVolumePage = lazy(() => import("@/pages/masters/DataVolumePage"));
const VendorVolumePage = lazy(() => import("@/pages/masters/VendorVolumePage"));
const OrgCertificationPage = lazy(() => import("@/pages/masters/OrgCertificationPage"));
const OperationalRegionPage = lazy(() => import("@/pages/masters/OperationalRegionPage"));
const RegulatoryFrameworkPage = lazy(() => import("@/pages/masters/RegulatoryFrameworkPage"));
const IntegrationExpectationPage = lazy(() => import("@/pages/masters/IntegrationExpectationPage"));
const ThirdPartyTypePage = lazy(() => import("@/pages/masters/ThirdPartyTypePage"));
const NatureOfThirdPartyPage = lazy(() => import("@/pages/masters/NatureOfThirdPartyPage"));
const PersonalDataTypePage = lazy(() => import("@/pages/masters/PersonalDataTypePage"));
const ServiceReplaceabilityPage = lazy(() => import("@/pages/masters/ServiceReplaceabilityPage"));
const DesiredModulePage = lazy(
  () => import("@/pages/masters/DesiredModulePage")
);
// Keep adding other MasterScreen pages from master_ui.txt as you build them...

// ---------- Small UI bits ----------
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
          ? "bg-indigo-600 text-white"
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

// ---------- Main Manager ----------
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
    key: "contract",
    title: "Contracts",
    description: "Contract duration, types and related master data.",
    subTabs: [
      {
        key: "duration",
        label: "Contract Duration",
        Component: ContractDurationPage,
      },
      { key: "type", label: "Contract Type", Component: ContractTypePage },
    ],
  },
  {
    key: "geo",
    title: "Geography",
    description: "Countries, currencies and related master data.",
    subTabs: [
      { key: "country", label: "Country Master", Component: CountryMasterPage },
      { key: "industry sector", label: "Industry Sector", Component: IndustrySectorPage },
      { key: "geography of operation", label: "Geography of Operation", Component: GeographyOfOperationPage },
      { key: "operational region", label: "Operational Region", Component: OperationalRegionPage },
      { key: "currency", label: "Currency", Component: CurrencyPage },
    ],
  },
  {
    key: "data",
    title: "Data",
    description: "Data access, classification, hosting and volumes.",
    subTabs: [
      { key: "access", label: "Access Type", Component: DataAccessTypePage },
      {
        key: "classification",
        label: "Classification",
        Component: DataClassificationPage,
      },
      {
        key: "hosting",
        label: "Hosting Arrangement",
        Component: DataHostingArrangementPage,
      },
      { key: "volume", label: "Data Volume", Component: DataVolumePage },
      { key: "vendor volume", label: "Vendor Volume", Component: VendorVolumePage },
      { key: "type of third party", label: "Type of Third Party", Component: ThirdPartyTypePage },
      { key: "nature of third party", label: "Nature of Third Party", Component: NatureOfThirdPartyPage },
      { key: "personal data type", label: "Personal Data Type", Component: PersonalDataTypePage },
    ],
  },
  {
    key: "compliance",
    title: "Compliance",
    description: "Frameworks and related master references.",
    subTabs: [
      {
        key: "framework",
        label: "Compliance Framework",
        Component: ComplianceFrameworkPage,
      },
      {
        key: "regulatory framework",
        label: "Regulatory Framework",
        Component: RegulatoryFrameworkPage,
      },


      {
        key: "org certification",
        label: "Org Certification",
        Component: OrgCertificationPage,
      },
      {
        key: "integration expectation",
        label: "Integration Expectation",
        Component: IntegrationExpectationPage,
      },
    ],
  },
  {
    key: "misc",
    title: "Miscellaneous",
    description: "Other master references like modules or volumes.",
    subTabs: [
      {
        key: "annual-volume",
        label: "Annual Volume",
        Component: AnnualVolumePage,
      },
      {
        key: "desired-module",
        label: "Desired Module",
        Component: DesiredModulePage,
      },
      {
        key: "service-replaceability",
        label: "Service Replaceability",
        Component: ServiceReplaceabilityPage,
      },
    ],
  },
];

const Shimmer = () => (
  <div className="animate-pulse h-[360px] w-full rounded-xl bg-gray-100" />
);

const MasterSuiteManager: React.FC = () => {
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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-50 to-white">
      <div className="mx-auto max-w-8xl px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Master Suite Manager
            </h1>
            <p className="text-sm text-gray-600">
              All Master Screens in one place.
            </p>
          </div>
        </motion.div>

        {/* Primary tabs (Group level) */}
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

        {/* Sub tabs & content */}
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

export default MasterSuiteManager;
