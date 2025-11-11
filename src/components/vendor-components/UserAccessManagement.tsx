// src/pages/UserAccessManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Shield,
  UserPlus,
  Layers,
  MenuSquare,
  Search,
  Filter,
  ChevronDown,
  X,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Link2,
  Unlink,
  KeyRound,
  FileKey,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";
import { getAuthData } from "@/utils/auth";

/** =========================
 * Types
 * ==========================*/
type YesNo = 0 | 1;

interface Tenant {
  tenantId: number | string;
  tenantName: string;
  tenantCode?: string;
  isActive?: boolean;
}

interface Role {
  roleId: number;
  roleName: string;
  tenantId: number;
  tenantName?: string;
  isActive: boolean;
}

interface Permission {
  permissionId: number;
  permissionName: string;
  isActive: boolean;
}

interface MenuItem {
  menuId: number;
  menuName: string;
  parentId?: number | null;
  parentMenuName?: string | null;
  menuLevel?: number | null;
  menuRoute?: string | null;
  menuLink?: string | null;
  menuIcon?: string | null;
  menuSortOrder?: number | null;
  isActive: boolean;
}

interface ModuleItem {
  moduleId: number;
  moduleName: string;
  isActive: boolean;
  isTechModule?: boolean;
}

interface MenuPermission {
  menuPermissionId: number;
  menuId: number;
  permissionId: number;
  menuName: string;
  permissionName: string;
  isActive: boolean;
}

type TabKey = "roles" | "menus" | "modules" | "permissions" | "mappings";

/** =========================
 * API base config
 * ==========================*/
const BASE_API_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const BASE_PORT = parseInt(import.meta.env.VITE_BASE_IDAM_PORT || "8080", 10);
const tenanId = getAuthData().tenantId;
// API PATHS (adjust if your gateway differs)
const PATHS = {
  GET_ROLES: `${BASE_API_PATH}get_all_role_of_tenant?id=${tenanId}`,
  GET_PERMISSIONS: `${BASE_API_PATH}get_all_permissions`,
  GET_MENUS: `${BASE_API_PATH}get_all_menus`,
  GET_MODULES: `${BASE_API_PATH}get_all_modules`,
  GET_TENANTS: `${BASE_API_PATH}get_all_tenants`,

  CREATE_ROLE: `${BASE_API_PATH}create_role`,
  CREATE_MENU: `${BASE_API_PATH}create_menu`,
  CREATE_MODULE: `${BASE_API_PATH}create_module`,

  // Mapping endpoints (unchanged)
  CREATE_ROLE_PERMISSION: `${BASE_API_PATH}create_role_permission`,
  MAP_UNMAP_MODULE_MENU: `${BASE_API_PATH}create_map_unmap_module_menu`,

  // Optional: read helpers for mappings (unchanged)
  GET_MAP_UNMAP_MODULE_MENU_BY_MODULE_ID: `${BASE_API_PATH}get_map_unmap_module_menu_by_module_id`,
};

/** =========================
 * Helpers
 * ==========================*/
const unwrapArray = <T,>(raw: any, fallback: T[] = []): T[] => {
  // Accepts shapes:
  // { data: { data: [...], db_status: 'success' } }
  // { data: [...], db_status: 'success' }
  // just [...]
  if (!raw) return fallback;
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
  return fallback;
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={`w-4 h-4 animate-spin ${className || ""}`} />
);

/** =========================
 * Modals
 * ==========================*/
interface BaseModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  children: React.ReactNode;
}

const ModalShell: React.FC<BaseModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = "Create",
  submitting,
  children,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b p-6">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
          <div className="flex items-center justify-end gap-3 border-t p-6">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              type="button"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-[#01443B] px-5 py-2 font-medium text-white hover:bg-[#01443B]/90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Role Modal */
interface RoleModalProps {
  open: boolean;
  tenants: Tenant[];
  defaultTenantId?: number | string;
  onClose: () => void;
  onCreate: (payload: {
    roleName: string;
    tenantId: number;
    isActive: boolean;
  }) => Promise<void>;
}
const AddRoleModal: React.FC<RoleModalProps> = ({
  open,
  tenants,
  defaultTenantId,
  onClose,
  onCreate,
}) => {
  const { showToast } = useToast();
  const [roleName, setRoleName] = useState("");
  const [tenantId, setTenantId] = useState<string>(
    defaultTenantId ? String(defaultTenantId) : ""
  );
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setRoleName("");
      setTenantId(defaultTenantId ? String(defaultTenantId) : "");
      setIsActive(true);
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async () => {
    if (!roleName.trim()) {
      showToast({ type: "error", message: "Role name is required" });
      return;
    }
    if (!tenantId) {
      showToast({ type: "error", message: "Tenant is required" });
      return;
    }
    try {
      setBusy(true);
      await onCreate({
        roleName: roleName.trim(),
        tenantId: parseInt(tenantId, 10),
        isActive,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={open}
      title="Add Role"
      onClose={onClose}
      onSubmit={submit}
      submitting={busy}
      submitLabel="Create Role"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Role Name *
          </label>
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            placeholder="e.g., Vendor Compliance Lead"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tenant *
          </label>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
          >
            <option value="">Select a tenant</option>
            {tenants.map((t) => (
              <option key={String(t.tenantId)} value={String(t.tenantId)}>
                {t.tenantName} {t.tenantId ? `(#${t.tenantId})` : ""}
              </option>
            ))}
          </select>
        </div>
        <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#01443B] focus:ring-[#01443B]"
          />
          Active
        </label>
      </div>
    </ModalShell>
  );
};

/** Menu Modal */
interface MenuModalProps {
  open: boolean;
  menus: MenuItem[];
  onClose: () => void;
  onCreate: (payload: {
    menuName: string;
    parentId?: number | null;
    menuLevel?: number | null;
    menuRoute?: string | null;
    menuLink?: string | null;
    menuIcon?: string | null;
    menuSortOrder?: number | null;
    isActive: boolean;
  }) => Promise<void>;
}
const AddMenuModal: React.FC<MenuModalProps> = ({
  open,
  menus,
  onClose,
  onCreate,
}) => {
  const { showToast } = useToast();
  const [menuName, setMenuName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [menuLevel, setMenuLevel] = useState<string>("");
  const [menuRoute, setMenuRoute] = useState("");
  const [menuLink, setMenuLink] = useState("");
  const [menuIcon, setMenuIcon] = useState("");
  const [menuSortOrder, setMenuSortOrder] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setMenuName("");
      setParentId("");
      setMenuLevel("");
      setMenuRoute("");
      setMenuLink("");
      setMenuIcon("");
      setMenuSortOrder("");
      setIsActive(true);
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    if (!menuName.trim()) {
      showToast({ type: "error", message: "Menu name is required" });
      return;
    }
    try {
      setBusy(true);
      await onCreate({
        menuName: menuName.trim(),
        parentId: parentId ? parseInt(parentId, 10) : null,
        menuLevel: menuLevel ? parseInt(menuLevel, 10) : null,
        menuRoute: menuRoute || null,
        menuLink: menuLink || null,
        menuIcon: menuIcon || null,
        menuSortOrder: menuSortOrder ? parseInt(menuSortOrder, 10) : null,
        isActive,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={open}
      title="Add Menu"
      onClose={onClose}
      onSubmit={submit}
      submitting={busy}
      submitLabel="Create Menu"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Menu Name *
          </label>
          <input
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            placeholder="e.g., Risk Reports"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Parent Menu
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            >
              <option value="">(None)</option>
              {menus
                .filter((m) => !m.parentId) // top-level parents
                .sort((a, b) => (a.menuSortOrder ?? 0) - (b.menuSortOrder ?? 0))
                .map((m) => (
                  <option key={m.menuId} value={m.menuId}>
                    {m.menuName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Menu Level
            </label>
            <input
              type="number"
              value={menuLevel}
              onChange={(e) => setMenuLevel(e.target.value)}
              placeholder="e.g., 1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Route
            </label>
            <input
              value={menuRoute}
              onChange={(e) => setMenuRoute(e.target.value)}
              placeholder="/risk-reports"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Link
            </label>
            <input
              value={menuLink}
              onChange={(e) => setMenuLink(e.target.value)}
              placeholder="https://example.com/..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Icon
            </label>
            <input
              value={menuIcon}
              onChange={(e) => setMenuIcon(e.target.value)}
              placeholder="HelpCircle, FileText, Home..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sort Order
            </label>
            <input
              type="number"
              value={menuSortOrder}
              onChange={(e) => setMenuSortOrder(e.target.value)}
              placeholder="e.g., 10"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>

        <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#01443B] focus:ring-[#01443B]"
          />
          Active
        </label>
      </div>
    </ModalShell>
  );
};

/** Module Modal */
interface ModuleModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    moduleName: string;
    isTechModule?: boolean;
    isActive: boolean;
  }) => Promise<void>;
}
const AddModuleModal: React.FC<ModuleModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const { showToast } = useToast();
  const [moduleName, setModuleName] = useState("");
  const [isTechModule, setIsTechModule] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setModuleName("");
      setIsTechModule(false);
      setIsActive(true);
      setBusy(false);
    }
  }, [open]);

  const submit = async () => {
    if (!moduleName.trim()) {
      showToast({ type: "error", message: "Module name is required" });
      return;
    }
    try {
      setBusy(true);
      await onCreate({ moduleName: moduleName.trim(), isTechModule, isActive });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={open}
      title="Add Module"
      onClose={onClose}
      onSubmit={submit}
      submitting={busy}
      submitLabel="Create Module"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Module Name *
          </label>
          <input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            placeholder="e.g., Vendor Risk"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isTechModule}
            onChange={(e) => setIsTechModule(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#01443B] focus:ring-[#01443B]"
          />
          Is Technical Module
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#01443B] focus:ring-[#01443B]"
          />
          Active
        </label>
      </div>
    </ModalShell>
  );
};

/** =========================
 * Main Component
 * ==========================*/
const UserAccessManagement: React.FC = () => {
  const { showToast } = useToast();
  const auth = getAuthData();

  const [tab, setTab] = useState<TabKey>("roles");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);

  // Loading flags
  const [loading, setLoading] = useState({
    tenants: false,
    roles: false,
    permissions: false,
    menus: false,
    modules: false,
  });

  // Create modals
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openMenuModal, setOpenMenuModal] = useState(false);

  const [openModuleModal, setOpenModuleModal] = useState(false);

  // Mapping states (kept simple; existing mapping endpoints are unchanged)
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [selectedModuleId, setSelectedModuleId] = useState<number | "">("");

  // For quick search/filter in each tab
  const [search, setSearch] = useState("");

  /** ============ Fetchers ============ */
  const safeGet = async (path: string, params?: any) => {
    const res: any = await apiService.get(path, params || {}, BASE_PORT);
    return res;
  };
  const safePost = async (path: string, payload: any) => {
    const res: any = await apiService.post(path, payload, BASE_PORT);
    return res;
  };

  const fetchTenants = async () => {
    try {
      setLoading((s) => ({ ...s, tenants: true }));
      const res = await safeGet(PATHS.GET_TENANTS);
      const list = unwrapArray<Tenant>(res?.data);
      const normalized = list.map((t: any) => ({
        tenantId: t.tenantId ?? t.id,
        tenantName: t.tenantName ?? t.name ?? "",
        tenantCode: t.tenantCode,
        isActive: !!t.isActive,
      }));
      setTenants(normalized);
    } catch (e: any) {
      showToast({ type: "error", message: "Failed to load tenants" });
    } finally {
      setLoading((s) => ({ ...s, tenants: false }));
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading((s) => ({ ...s, roles: true }));
      const res = await safeGet(PATHS.GET_ROLES);
      const list = unwrapArray<Role>(res?.data);
      const normalized = list.map((r: any) => ({
        roleId: Number(r.roleId ?? r.id),
        roleName: r.roleName ?? r.name,
        tenantId: Number(r.tenantId),
        tenantName: r.tenantName,
        isActive: !!r.isActive,
      }));
      setRoles(normalized);
    } catch {
      showToast({ type: "error", message: "Failed to load roles" });
    } finally {
      setLoading((s) => ({ ...s, roles: false }));
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading((s) => ({ ...s, permissions: true }));
      const res = await safeGet(PATHS.GET_PERMISSIONS);
      const list = unwrapArray<Permission>(res?.data);
      const normalized = list.map((p: any) => ({
        permissionId: Number(p.permissionId ?? p.id),
        permissionName: p.permissionName ?? p.name,
        isActive: !!p.isActive,
      }));
      setPermissions(normalized);
    } catch {
      showToast({ type: "error", message: "Failed to load permissions" });
    } finally {
      setLoading((s) => ({ ...s, permissions: false }));
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading((s) => ({ ...s, menus: true }));
      const res = await safeGet(PATHS.GET_MENUS);
      const list = unwrapArray<MenuItem>(res?.data);
      const normalized = list.map((m: any) => ({
        menuId: Number(m.menuId ?? m.id),
        menuName: m.menuName ?? m.name,
        parentId: m.parentId ?? null,
        parentMenuName: m.parentMenuName ?? null,
        menuLevel: m.menuLevel ?? null,
        menuRoute: m.menuRoute ?? null,
        menuLink: m.menuLink ?? null,
        menuIcon: m.menuIcon ?? null,
        menuSortOrder: m.menuSortOrder ?? null,
        isActive: !!m.isActive,
      }));
      setMenus(normalized);
    } catch {
      showToast({ type: "error", message: "Failed to load menus" });
    } finally {
      setLoading((s) => ({ ...s, menus: false }));
    }
  };

  const fetchModules = async () => {
    try {
      setLoading((s) => ({ ...s, modules: true }));
      const res = await safeGet(PATHS.GET_MODULES);
      const list = unwrapArray<ModuleItem>(res?.data);
      const normalized = list.map((m: any) => ({
        moduleId: Number(m.moduleId ?? m.id ?? m.module_id),
        moduleName: m.moduleName ?? m.module_name ?? m.name,
        isActive: !!m.isActive,
        isTechModule: !!(m.isTechModule ?? m.is_tech_module),
      }));
      setModules(normalized);
    } catch {
      showToast({ type: "error", message: "Failed to load modules" });
    } finally {
      setLoading((s) => ({ ...s, modules: false }));
    }
  };

  useEffect(() => {
    // initial load
    fetchTenants();
    fetchRoles();
    fetchPermissions();
    fetchMenus();
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ============ Creates ============ */
  const createRole = async (payload: {
    roleName: string;
    tenantId: number;
    isActive: boolean;
  }) => {
    const res = await safePost(PATHS.CREATE_ROLE, payload);
    if (res?.isSuccess || res?.success) {
      showToast({ type: "success", message: "Role created" });
      await fetchRoles();
    } else {
      throw new Error(res?.message || "Failed to create role");
    }
  };

  const createMenu = async (payload: {
    menuName: string;
    parentId?: number | null;
    menuLevel?: number | null;
    menuRoute?: string | null;
    menuLink?: string | null;
    menuIcon?: string | null;
    menuSortOrder?: number | null;
    isActive: boolean;
  }) => {
    const res = await safePost(PATHS.CREATE_MENU, payload);
    if (res?.isSuccess || res?.success) {
      showToast({ type: "success", message: "Menu created" });
      await fetchMenus();
    } else {
      throw new Error(res?.message || "Failed to create menu");
    }
  };

  const createModule = async (payload: {
    moduleName: string;
    isTechModule?: boolean;
    isActive: boolean;
  }) => {
    const res = await safePost(PATHS.CREATE_MODULE, payload);
    if (res?.isSuccess || res?.success) {
      showToast({ type: "success", message: "Module created" });
      await fetchModules();
    } else {
      throw new Error(res?.message || "Failed to create module");
    }
  };

  /** ============ Filtering ============ */
  const filteredRoles = useMemo(() => {
    const needle = search.toLowerCase();
    return roles.filter(
      (r) =>
        !needle ||
        r.roleName.toLowerCase().includes(needle) ||
        String(r.roleId).includes(needle) ||
        (r.tenantName || "").toLowerCase().includes(needle)
    );
  }, [roles, search]);

  const filteredMenus = useMemo(() => {
    const needle = search.toLowerCase();
    return menus
      .slice()
      .sort((a, b) => (a.menuSortOrder ?? 0) - (b.menuSortOrder ?? 0))
      .filter(
        (m) =>
          !needle ||
          m.menuName.toLowerCase().includes(needle) ||
          String(m.menuId).includes(needle) ||
          (m.parentMenuName || "").toLowerCase().includes(needle)
      );
  }, [menus, search]);

  const filteredModules = useMemo(() => {
    const needle = search.toLowerCase();
    return modules.filter(
      (m) =>
        !needle ||
        m.moduleName.toLowerCase().includes(needle) ||
        String(m.moduleId).includes(needle)
    );
  }, [modules, search]);

  const filteredPermissions = useMemo(() => {
    const needle = search.toLowerCase();
    return permissions.filter(
      (p) =>
        !needle ||
        p.permissionName.toLowerCase().includes(needle) ||
        String(p.permissionId).includes(needle)
    );
  }, [permissions, search]);

  /** ============ UI ============ */
  const TabButton: React.FC<{ id: TabKey; label: string; Icon: any }> = ({
    id,
    label,
    Icon,
  }) => (
    <button
      onClick={() => setTab(id)}
      className={`group inline-flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${tab === id
          ? "border-[#01443B] text-[#01443B]"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-8xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Shield className="h-6 w-6 text-emerald-700" />
            </div>
            Identity & Access Management
          </h1>
          <p className="text-gray-600">
            Manage roles, menus, modules, permissions and mappings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchTenants();
              fetchRoles();
              fetchMenus();
              fetchModules();
              fetchPermissions();
            }}
            className="inline-flex items-center rounded-lg bg-[#01443B] px-4 py-2 text-white hover:bg-[#01443B]/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
          {/* Quick create buttons */}
          <button
            onClick={() => setOpenRoleModal(true)}
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Role
          </button>
          <button
            onClick={() => setOpenMenuModal(true)}
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            <MenuSquare className="mr-2 h-4 w-4" />
            Add Menu
          </button>
          <button
            onClick={() => setOpenModuleModal(true)}
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Layers className="mr-2 h-4 w-4" />
            Add Module
          </button>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in the current tab..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <TabButton id="roles" label="Roles" Icon={UserPlus} />
          <TabButton id="menus" label="Menus" Icon={MenuSquare} />
          <TabButton id="modules" label="Modules" Icon={Layers} />
          <TabButton id="permissions" label="Permissions" Icon={KeyRound} />
          <TabButton id="mappings" label="Mappings" Icon={FileKey} />
        </nav>
      </div>

      {/* Roles */}
      {tab === "roles" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
            </div>
            {loading.roles && <Spinner />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRoles.map((r) => (
                  <tr key={r.roleId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                      {r.roleName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-700">
                      {r.tenantName || r.tenantId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Menus */}
      {tab === "menus" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <MenuSquare className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">Menus</h2>
            </div>
            {loading.menus && <Spinner />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Menu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredMenus.map((m) => (
                  <tr key={m.menuId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                      {m.menuName}
                      <div className="text-xs text-gray-500">
                        {m.menuRoute || m.menuLink
                          ? m.menuRoute || m.menuLink
                          : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-700">
                      {m.parentMenuName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-700">
                      {m.menuSortOrder ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredMenus.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No menus found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules */}
      {tab === "modules" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">Modules</h2>
            </div>
            {loading.modules && <Spinner />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredModules.map((m) => (
                  <tr key={m.moduleId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                      {m.moduleName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-700">
                      {m.isTechModule ? "Technical" : "Business"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredModules.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No modules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions */}
      {tab === "permissions" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Permissions
              </h2>
            </div>
            {loading.permissions && <Spinner />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPermissions.map((p) => (
                  <tr key={p.permissionId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-900">
                      {p.permissionName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPermissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No permissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mappings (kept simple; uses your existing mapping endpoints) */}
      {tab === "mappings" && (
        <div className="space-y-6">
          {/* Role → Menu → Permission (one-by-one add) */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <FileKey className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Map Role ↔ Menu ↔ Permission
                </h2>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) =>
                    setSelectedRoleId(
                      e.target.value ? parseInt(e.target.value, 10) : ""
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Menu
                </label>
                <select
                  id="map_menu"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select menu</option>
                  {menus.map((m) => (
                    <option key={m.menuId} value={m.menuId}>
                      {m.menuName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Permission
                </label>
                <select
                  id="map_permission"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select permission</option>
                  {permissions.map((p) => (
                    <option key={p.permissionId} value={p.permissionId}>
                      {p.permissionName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={async () => {
                    const roleId = selectedRoleId ? Number(selectedRoleId) : 0;
                    const menuId = Number(
                      (document.getElementById("map_menu") as HTMLSelectElement)
                        ?.value || 0
                    );
                    const permissionId = Number(
                      (
                        document.getElementById(
                          "map_permission"
                        ) as HTMLSelectElement
                      )?.value || 0
                    );
                    if (!roleId || !menuId || !permissionId) {
                      showToast({
                        type: "error",
                        message: "Select Role, Menu and Permission",
                      });
                      return;
                    }
                    try {
                      const res = await safePost(PATHS.CREATE_ROLE_PERMISSION, {
                        roleId,
                        menuId,
                        permissionId,
                        isActive: true,
                      });
                      if (
                        res?.success ||
                        res?.isSuccess ||
                        res?.data?.status === "success"
                      ) {
                        showToast({
                          type: "success",
                          message: "Mapped successfully",
                        });
                      } else {
                        showToast({
                          type: "error",
                          message: res?.message || "Failed to map",
                        });
                      }
                    } catch (e: any) {
                      showToast({
                        type: "error",
                        message: e?.message || "Failed to map",
                      });
                    }
                  }}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#01443B] px-4 py-2 font-medium text-white hover:bg-[#01443B]/90"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Map
                </button>
              </div>
            </div>
            <div className="border-t p-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertCircle className="h-3 w-3" />
                Current Mappings can be viewed in your existing approval or
                audit views.
              </div>
            </div>
          </div>

          {/* Module ↔ Menus (bulk map/unmap via arrays) */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Map Module ↔ Menus (Bulk)
                </h2>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) =>
                    setSelectedModuleId(
                      e.target.value ? parseInt(e.target.value, 10) : ""
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select module</option>
                  {modules.map((m) => (
                    <option key={m.moduleId} value={m.moduleId}>
                      {m.moduleName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Pick Menus
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {menus.slice(0, 12).map((m) => (
                    <label
                      key={m.menuId}
                      className="inline-flex items-center gap-2 rounded-lg border p-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        value={m.menuId}
                        className="h-4 w-4 rounded border-gray-300 text-[#01443B]"
                      />
                      {m.menuName}
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Showing first 12 for brevity.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t p-4">
              <button
                onClick={async () => {
                  const moduleId = selectedModuleId
                    ? Number(selectedModuleId)
                    : 0;
                  if (!moduleId) {
                    showToast({ type: "error", message: "Select a module" });
                    return;
                  }
                  const checked = Array.from(
                    document.querySelectorAll<HTMLInputElement>(
                      'input[type="checkbox"][value]'
                    )
                  )
                    .filter((c) => c.checked)
                    .map((c) => Number(c.value));

                  // Prepare payload according to your function
                  const payload = {
                    mappedPermissions: checked.map((menuId) => ({
                      menuId,
                      moduleId,
                      isActive: true,
                    })),
                    unmappedPermissions: [], // none in this button
                  };
                  try {
                    const res = await safePost(
                      PATHS.MAP_UNMAP_MODULE_MENU,
                      payload
                    );
                    if (
                      res?.data?.status === "success" ||
                      res?.success ||
                      res?.isSuccess
                    ) {
                      showToast({ type: "success", message: "Mapped success" });
                    } else {
                      showToast({
                        type: "error",
                        message: res?.message || "Failed to map",
                      });
                    }
                  } catch (e: any) {
                    showToast({
                      type: "error",
                      message: e?.message || "Failed to map",
                    });
                  }
                }}
                className="inline-flex items-center rounded-lg bg-[#01443B] px-4 py-2 text-white hover:bg-[#01443B]/90"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Map
              </button>
              <button
                onClick={async () => {
                  const moduleId = selectedModuleId
                    ? Number(selectedModuleId)
                    : 0;
                  if (!moduleId) {
                    showToast({ type: "error", message: "Select a module" });
                    return;
                  }
                  const checked = Array.from(
                    document.querySelectorAll<HTMLInputElement>(
                      'input[type="checkbox"][value]'
                    )
                  )
                    .filter((c) => c.checked)
                    .map((c) => Number(c.value));

                  const payload = {
                    mappedPermissions: [], // none in this button
                    unmappedPermissions: checked.map((menuId) => ({
                      menuId,
                      moduleId,
                    })),
                  };
                  try {
                    const res = await safePost(
                      PATHS.MAP_UNMAP_MODULE_MENU,
                      payload
                    );
                    if (
                      res?.data?.status === "success" ||
                      res?.success ||
                      res?.isSuccess
                    ) {
                      showToast({
                        type: "success",
                        message: "Unmapped success",
                      });
                    } else {
                      showToast({
                        type: "error",
                        message: res?.message || "Failed to unmap",
                      });
                    }
                  } catch (e: any) {
                    showToast({
                      type: "error",
                      message: e?.message || "Failed to unmap",
                    });
                  }
                }}
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Unmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AddRoleModal
        open={openRoleModal}
        tenants={tenants}
        defaultTenantId={auth?.tenantId}
        onClose={() => setOpenRoleModal(false)}
        onCreate={createRole}
      />

      <AddMenuModal
        open={openMenuModal}
        menus={menus}
        onClose={() => setOpenMenuModal(false)}
        onCreate={createMenu}
      />

      <AddModuleModal
        open={openModuleModal}
        onClose={() => setOpenModuleModal(false)}
        onCreate={createModule}
      />
    </div>
  );
};

export default UserAccessManagement;
