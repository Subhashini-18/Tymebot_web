import React, { useEffect, useMemo, useState } from "react";
import {
  Shield,
  PanelsTopLeft,
  Boxes,
  UserPlus,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  GitMerge,
  GitPullRequest,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";
import AddRoleModal from "./AddRoleModal";
import AddMenuModal from "./AddMenuModal";
import AddModuleModal from "./AddModuleModal";
import AddPermissionModal from "./AddPermissionModal";
import CreateUserModal from "./CreateUserModal";
import { getAuthData } from "@/utils/auth";

type AnyObj = Record<string, any>;

// ---- ENV / BASES -----------------------------------------------------------
const IDAM_PATH =
  (import.meta as any).env?.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const IDAM_PORT = (import.meta as any).env?.VITE_BASE_IDAM_PORT;
const TRACS_PATH =
  (import.meta as any).env?.VITE_API_PATH || "/api/tyme/tracs/v1/";
const TRACS_PORT = (import.meta as any).env?.VITE_BASE_PORT;

// ---- PARSERS (robust to shape) --------------------------------------------
function pick<T = any>(obj: any, path: string, fallback?: any): T {
  try {
    const parts = path.split(".");
    let cur: any = obj;
    for (const p of parts) cur = cur?.[p];
    return (cur ?? fallback) as T;
  } catch {
    return fallback as T;
  }
}

function unwrapArray(resp: AnyObj): any[] {
  const candidates = [
    resp?.data?.data,
    resp?.data?.Data,
    resp?.data,
    resp?.Data,
    resp,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

function parseUsers(resp: AnyObj) {
  const arr = unwrapArray(resp);
  return arr.map((u: AnyObj) => ({
    authUserId: Number(u?.authUserId ?? u?.id ?? 0),
    username: String(u?.username ?? u?.authUserName ?? ""),
    tenantId: Number(u?.tenantId ?? 0),
    tenantName: String(u?.tenantName ?? ""),
    tenantCode: String(u?.tenantCode ?? ""),
    roleId: Number(u?.roleId ?? 0),
    roleName: String(u?.roleName ?? ""),
    isActive: !!u?.isActive,
  }));
}

function parseRoles(resp: AnyObj) {
  const arr = unwrapArray(resp);
  return arr.map((r: AnyObj) => ({
    roleId: Number(r?.roleId ?? r?.id ?? 0),
    roleName: String(r?.roleName ?? r?.name ?? ""),
    tenantId: Number(r?.tenantId ?? 0),
    tenantName: String(r?.tenantName ?? ""),
    isActive: r?.isActive !== false,
    mediaLink: r?.mediaLink ?? null,
  }));
}

function parsePermissions(resp: AnyObj) {
  const arr = unwrapArray(resp);
  return arr.map((p: AnyObj) => ({
    permissionId: Number(p?.permissionId ?? p?.id ?? 0),
    permissionName: String(p?.permissionName ?? p?.name ?? ""),
    isActive: p?.isActive !== false,
    mediaLink: p?.mediaLink ?? null,
  }));
}

function parseMenus(resp: AnyObj) {
  const arr = unwrapArray(resp);
  return arr.map((m: AnyObj) => ({
    menuId: Number(m?.menuId ?? m?.id ?? 0),
    menuName: String(m?.menuName ?? m?.name ?? ""),
    menuLevel: Number(m?.menuLevel ?? 1),
    parentId: m?.parentId ? Number(m?.parentId) : null,
    parentMenuName: m?.parentMenuName ?? null,
    menuRoute: m?.menuRoute ?? null,
    menuLink: m?.menuLink ?? null,
    menuIcon: m?.menuIcon ?? null,
    menuSortOrder: m?.menuSortOrder ? Number(m?.menuSortOrder) : null,
    isActive: m?.isActive !== false,
    mediaLink: m?.mediaLink ?? null,
  }));
}

function parseModules(resp: AnyObj) {
  const arr = unwrapArray(resp);
  return arr.map((m: AnyObj) => ({
    moduleId: Number(m?.moduleId ?? m?.id ?? 0),
    moduleName: String(m?.moduleName ?? m?.name ?? ""),
    menuName: String(m?.menuName ?? ""),
    isActive: m?.isActive !== false,
    isTechModule: !!m?.isTechModule,
    mediaLink: m?.mediaLink ?? null,
  }));
}

function parseTenants(resp: AnyObj) {
  const arr = unwrapArray(resp);
  return arr.map((t: AnyObj) => ({
    tenantId: Number(t?.tenantId ?? t?.id ?? 0),
    tenantName: String(t?.tenantName ?? t?.name ?? ""),
    tenantCode: String(t?.tenantCode ?? ""),
    isActive: t?.isActive !== false,
  }));
}

// ---- DUAL LIST COMPONENT ---------------------------------------------------
function DualList({
  leftTitle,
  rightTitle,
  leftItems,
  rightItems,
  keyFn,
  labelFn,
  onMoveRight,
  onMoveLeft,
  height = "h-72",
}: {
  leftTitle: string;
  rightTitle: string;
  leftItems: any[];
  rightItems: any[];
  keyFn: (x: any) => string | number;
  labelFn: (x: any) => string;
  onMoveRight: (xs: any[]) => void;
  onMoveLeft: (xs: any[]) => void;
  height?: string;
}) {
  const [leftSel, setLeftSel] = useState<any[]>([]);
  const [rightSel, setRightSel] = useState<any[]>([]);

  useEffect(() => {
    setLeftSel([]);
    setRightSel([]);
  }, [leftItems, rightItems]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
      {/* LEFT */}
      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">
          {leftTitle}
        </div>
        <div className={`rounded-lg border bg-white ${height} overflow-auto`}>
          <ul>
            {leftItems.map((it) => {
              const k = keyFn(it);
              const checked = !!leftSel.find((s) => keyFn(s) === k);
              return (
                <li
                  key={k}
                  className="flex items-center gap-2 border-b px-3 py-2 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setLeftSel((p) => [...p, it]);
                      else setLeftSel((p) => p.filter((x) => keyFn(x) !== k));
                    }}
                  />
                  <span className="text-sm text-gray-800">{labelFn(it)}</span>
                </li>
              );
            })}
            {leftItems.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-gray-500">
                No items
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-center justify-center gap-2">
        <button
          onClick={() => onMoveRight(leftSel)}
          disabled={!leftSel.length}
          className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight className="mr-1 h-4 w-4" />
          Add
        </button>
        <button
          onClick={() => onMoveLeft(rightSel)}
          disabled={!rightSel.length}
          className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Remove
        </button>
      </div>

      {/* RIGHT */}
      <div>
        <div className="mb-2 text-sm font-medium text-gray-700">
          {rightTitle}
        </div>
        <div className={`rounded-lg border bg-white ${height} overflow-auto`}>
          <ul>
            {rightItems.map((it) => {
              const k = keyFn(it);
              const checked = !!rightSel.find((s) => keyFn(s) === k);
              return (
                <li
                  key={k}
                  className="flex items-center gap-2 border-b px-3 py-2 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setRightSel((p) => [...p, it]);
                      else setRightSel((p) => p.filter((x) => keyFn(x) !== k));
                    }}
                  />
                  <span className="text-sm text-gray-800">{labelFn(it)}</span>
                </li>
              );
            })}
            {rightItems.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-gray-500">
                No items
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---- MAIN PAGE -------------------------------------------------------------
const tabs = [
  { id: "overview", label: "Overview", icon: RefreshCw },
  { id: "users", label: "Users", icon: UserPlus },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "menus", label: "Menus", icon: PanelsTopLeft },
  { id: "modules", label: "Modules", icon: Boxes },
  // Separate mapping tabs:
  // { id: "mapModuleMenu", label: "Module ⇄ Menu", icon: GitMerge },
  { id: "mapMenuPermission", label: "Menu ⇄ Permission", icon: GitPullRequest },
  { id: "mapRolePermission", label: "Role ⇄ Permission", icon: KeyRound },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function IAMManager() {
  const { showToast } = useToast();
  const [active, setActive] = useState<any>("overview");
  const [loading, setLoading] = useState(false);
  const auth = getAuthData();
  // data
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  console.log(modules)
  // search
  const [userSearch, setUserSearch] = useState("");

  // mapping state — Module ⇄ Menu
  const [selectedModuleId, setSelectedModuleId] = useState<number | "">("");
  const [moduleMappedMenus, setModuleMappedMenus] = useState<any[]>([]);
  const [moduleUnmappedMenus, setModuleUnmappedMenus] = useState<any[]>([]);
  const [savingModuleMap, setSavingModuleMap] = useState(false);

  // mapping state — Menu ⇄ Permission
  const [selectedMenuId, setSelectedMenuId] = useState<number | "">("");
  const [menuMappedPerms, setMenuMappedPerms] = useState<any[]>([]);
  const [menuUnmappedPerms, setMenuUnmappedPerms] = useState<any[]>([]);
  const [savingMenuMap, setSavingMenuMap] = useState(false);

  // mapping state — Role ⇄ Permission (MENU-FREE)
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [roleMappedPerms, setRoleMappedPerms] = useState<
    {
      permissionId: number;
      permissionName: string;
      rolePermissionIds?: number[]; // may be multiple across menus
    }[]
  >([]);
  const [roleUnmappedPerms, setRoleUnmappedPerms] = useState<
    { permissionId: number; permissionName: string }[]
  >([]);
  const [savingRoleMap, setSavingRoleMap] = useState(false);

  // modals
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openMenuModal, setOpenMenuModal] = useState(false);
  const [openModuleModal, setOpenModuleModal] = useState(false);
  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [openCreateUserModal, setOpenCreateUserModal] = useState(false);

  // ---- LOADERS -------------------------------------------------------------
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [u, r, p, me, mo, t] = await Promise.all([
        apiService.get(`${IDAM_PATH}get_all_users_of_tenant?tenantId=${auth.tenantId}`, {}, IDAM_PORT),
        apiService.get(`${IDAM_PATH}get_all_role_of_tenant?tenantId=${auth.tenantId}`, {}, IDAM_PORT),
        apiService.get(`${IDAM_PATH}get_all_menu_permission_of_tenant?moduleId=${auth.moduleId}`, {}, IDAM_PORT),
        apiService.get(`${IDAM_PATH}get_all_module_menus_of_module?moduleId=${auth.moduleId}`, {}, IDAM_PORT),
        apiService.get(`${IDAM_PATH}get_all_modules_by_id?moduleId=${auth.moduleId}`, {}, IDAM_PORT),
        apiService.get(`${TRACS_PATH}get_all_tenant_of_client`, { id: auth?.clientId ?? 0 }, TRACS_PORT),
      ]);
      console.log(mo)
      setUsers(parseUsers(u));
      setRoles(parseRoles(r));
      setPermissions(parsePermissions(p));
      setMenus(parseMenus(me));
      setModules(parseModules(mo));
      setTenants(parseTenants(t));
      showToast({ type: "success", message: "IAM refreshed" });
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to load IAM",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- MAPPING FETCHERS ----------------------------------------------------
  const loadModuleMapping = async (moduleId: number) => {
    setSelectedModuleId(moduleId);
    setModuleMappedMenus([]);
    setModuleUnmappedMenus([]);
    try {
      const res = await apiService.get(
        `${IDAM_PATH}get_map_unmap_module_menu_by_module_id`,
        { moduleId },
        IDAM_PORT
      );
      const mapped = pick<any[]>(res, "data.mapped_permissions", []) || [];
      const unmapped = pick<any[]>(res, "data.unmapped_permissions", []) || [];

      const mappedNorm = mapped.map((x: any) => ({
        menuId: Number(x.menuId),
        menuName: String(x.menuName ?? `Menu #${x.menuId}`),
      }));
      const unmappedNorm = unmapped.map((x: any) => ({
        menuId: Number(x.menuId),
        menuName: String(x.menuName ?? `Menu #${x.menuId}`),
      }));

      setModuleMappedMenus(mappedNorm);
      setModuleUnmappedMenus(unmappedNorm);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to load module mapping",
      });
    }
  };

  const loadMenuMapping = async (menuId: number) => {
    setSelectedMenuId(menuId);
    setMenuMappedPerms([]);
    setMenuUnmappedPerms([]);
    try {
      const mp = await apiService.get(
        `${IDAM_PATH}get_all_menu_permission`,
        {},
        IDAM_PORT
      );
      const allMap = unwrapArray(mp);
      const mappedForMenu = allMap
        .filter((x: any) => Number(x?.menuId ?? x?.menu_id) === menuId)
        .map((x: any) => ({
          menuPermissionId: Number(x?.menuPermissionId ?? x?.id ?? 0),
          permissionId: Number(x?.permissionId ?? 0),
          permissionName: String(x?.permissionName ?? ""),
        }));

      const mappedIds = new Set(mappedForMenu.map((m: any) => m.permissionId));
      const allPerms = permissions;
      const unMapped = allPerms
        .filter((p) => !mappedIds.has(p.permissionId))
        .map((p) => ({
          permissionId: p.permissionId,
          permissionName: p.permissionName,
        }));

      setMenuMappedPerms(mappedForMenu);
      setMenuUnmappedPerms(unMapped);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to load menu permissions",
      });
    }
  };

  // MENU-FREE role permissions (flatten across menus)
  const loadRolePermissions = async (roleId: number) => {
    setSelectedRoleId(roleId);
    setRoleMappedPerms([]);
    setRoleUnmappedPerms([]);

    if (!roleId) return;

    try {
      const res = await apiService.get(
        `${IDAM_PATH}get_map_unmap_role_permission_by_role_id`,
        { roleId },
        IDAM_PORT
      );

      const mappedGroups =
        pick<any[]>(res, "data.mapped_permissions", []) || [];

      // Build permissionId -> {name, rolePermissionIds[]} across all menus
      const mappedMap = new Map<
        number,
        {
          permissionId: number;
          permissionName: string;
          rolePermissionIds: number[];
        }
      >();

      mappedGroups.forEach((g: any) => {
        (g?.permissions || []).forEach((p: any) => {
          const pid = Number(p.permissionId ?? 0);
          const rpid = Number(p.rolePermissionId ?? 0);
          const name = String(p.permissionName ?? "");
          if (!pid) return;
          if (!mappedMap.has(pid)) {
            mappedMap.set(pid, {
              permissionId: pid,
              permissionName: name,
              rolePermissionIds: rpid ? [rpid] : [],
            });
          } else if (rpid) {
            const cur = mappedMap.get(pid)!;
            if (!cur.rolePermissionIds.includes(rpid)) {
              cur.rolePermissionIds.push(rpid);
            }
          }
        });
      });

      const mapped = Array.from(mappedMap.values());

      const mappedIds = new Set(mapped.map((m) => m.permissionId));
      const unMapped = permissions
        .filter((p) => !mappedIds.has(p.permissionId))
        .map((p) => ({
          permissionId: p.permissionId,
          permissionName: p.permissionName,
        }));

      setRoleMappedPerms(mapped);
      setRoleUnmappedPerms(unMapped);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to load role permissions",
      });
    }
  };

  // ---- CREATE HANDLERS (passed to modals) ----------------------------------
  const createRole = async (payload: {
    roleName: string;
    tenantId: number;
    isActive: boolean;
    mediaLink?: string | null;
  }) => {
    await apiService.post(`${IDAM_PATH}create_role`, payload, IDAM_PORT);
    const r = await apiService.get(`${IDAM_PATH}get_all_role`, {}, IDAM_PORT);
    setRoles(parseRoles(r));
  };

  const createMenu = async (payload: {
    menuName: string;
    parentId: number | null;
    menuLevel: number;
    menuRoute?: string | null;
    menuLink?: string | null;
    menuIcon?: string | null;
    menuSortOrder?: number | null;
    isActive: boolean;
    mediaLink?: string | null;
  }) => {
    await apiService.post(`${IDAM_PATH}create_menu`, payload, IDAM_PORT);
    const m = await apiService.get(`${IDAM_PATH}get_all_menus`, {}, IDAM_PORT);
    setMenus(parseMenus(m));
  };

  const createModule = async (payload: {
    moduleName: string;
    isTechModule: boolean;
    isActive: boolean;
    mediaLink?: string | null;
  }) => {
    await apiService.post(`${IDAM_PATH}create_module`, payload, IDAM_PORT);
    const mo = await apiService.get(
      `${IDAM_PATH}get_all_modules`,
      {},
      IDAM_PORT
    );
    setModules(parseModules(mo));
  };

  const createPermission = async (payload: {
    permissionName: string;
    isActive: boolean;
    mediaLink?: string | null;
  }) => {
    await apiService.post(`${IDAM_PATH}create_permission`, payload, IDAM_PORT);
    const p = await apiService.get(
      `${IDAM_PATH}get_all_permissions`,
      {},
      IDAM_PORT
    );
    setPermissions(parsePermissions(p));
  };

  // ---- SAVE MAPPINGS -------------------------------------------------------
  const saveModuleMenuMapping = async (
    moduleId: number,
    nextMappedMenus: { menuId: number }[],
    prevMappedMenus: { menuId: number }[]
  ) => {
    setSavingModuleMap(true);
    try {
      const prevSet = new Set(prevMappedMenus.map((m) => m.menuId));
      const nextSet = new Set(nextMappedMenus.map((m) => m.menuId));

      const toAdd = [...nextSet].filter((id) => !prevSet.has(id));
      const toRemove = [...prevSet].filter((id) => !nextSet.has(id));

      const payload: AnyObj = {
        mappedPermissions: toAdd.map((menuId) => ({
          menuId,
          moduleId,
          isActive: true,
        })),
        unmappedPermissions: toRemove.map((menuId) => ({
          menuId,
          moduleId,
        })),
      };

      await apiService.post(
        `${IDAM_PATH}create_map_unmap_module_menu`,
        payload,
        IDAM_PORT
      );

      showToast({ type: "success", message: "Module ⇄ Menu mapping saved" });
      await loadModuleMapping(moduleId);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to save module mapping",
      });
    } finally {
      setSavingModuleMap(false);
    }
  };

  const saveMenuPermissionMapping = async (
    menuId: number,
    nextMapped: { permissionId: number }[],
    prevMapped: { permissionId: number; menuPermissionId?: number }[]
  ) => {
    setSavingMenuMap(true);
    try {
      const prevSet = new Set(prevMapped.map((p) => p.permissionId));
      const nextSet = new Set(nextMapped.map((p) => p.permissionId));

      const toAdd = [...nextSet].filter((id) => !prevSet.has(id));
      const toRemove = [...prevSet].filter((id) => !nextSet.has(id));

      await Promise.all(
        toAdd.map((permissionId) =>
          apiService.post(
            `${IDAM_PATH}create_menu_permission`,
            { menuId, permissionId, isActive: true },
            IDAM_PORT
          )
        )
      );

      await Promise.all(
        toRemove.map(async (permissionId) => {
          const mpId =
            prevMapped.find((x) => x.permissionId === permissionId)
              ?.menuPermissionId ?? null;

          try {
            await apiService.delete?.(
              `${IDAM_PATH}delete_menu_permission`,
              IDAM_PORT
            );
          } catch {
            await apiService.post(
              `${IDAM_PATH}delete_menu_permission`,
              mpId ? { menuPermissionId: mpId } : { menuId, permissionId },
              IDAM_PORT
            );
          }
        })
      );

      showToast({
        type: "success",
        message: "Menu ⇄ Permission mapping saved",
      });
      await loadMenuMapping(menuId);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to save menu mapping",
      });
    } finally {
      setSavingMenuMap(false);
    }
  };

  // MENU-FREE Role ⇄ Permission save
  const saveRolePermissionMapping = async (
    roleId: number,
    nextMapped: { permissionId: number; rolePermissionIds?: number[] }[],
    prevMapped: { permissionId: number; rolePermissionIds?: number[] }[]
  ) => {
    setSavingRoleMap(true);
    try {
      const prevSet = new Set(prevMapped.map((p) => p.permissionId));
      const nextSet = new Set(nextMapped.map((p) => p.permissionId));

      const toAdd = [...nextSet].filter((id) => !prevSet.has(id));
      const toRemove = [...prevSet].filter((id) => !nextSet.has(id));

      // ADD (no menuId sent)
      await Promise.all(
        toAdd.map((permissionId) =>
          apiService.post(
            `${IDAM_PATH}create_role_permission`,
            { roleId, permissionId, isActive: true },
            IDAM_PORT
          )
        )
      );

      // REMOVE — by known rolePermissionIds if available, else fallback by roleId+permissionId
      await Promise.all(
        toRemove.map(async (permissionId) => {
          const rps =
            prevMapped.find((x) => x.permissionId === permissionId)
              ?.rolePermissionIds || [];
          if (rps.length) {
            await Promise.all(
              rps.map(async (rolePermissionId) => {
                try {
                  await apiService.delete?.(
                    `${IDAM_PATH}delete_role_permission`,
                    IDAM_PORT
                  );
                } catch {
                  await apiService.post(
                    `${IDAM_PATH}delete_role_permission`,
                    { rolePermissionId },
                    IDAM_PORT
                  );
                }
              })
            );
          } else {
            try {
              await apiService.delete?.(
                `${IDAM_PATH}delete_role_permission`,
                IDAM_PORT
              );
            } catch {
              await apiService.post(
                `${IDAM_PATH}delete_role_permission`,
                { roleId, permissionId },
                IDAM_PORT
              );
            }
          }
        })
      );

      showToast({
        type: "success",
        message: "Role ⇄ Permission mapping saved",
      });
      await loadRolePermissions(roleId);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to save role mapping",
      });
    } finally {
      setSavingRoleMap(false);
    }
  };

  // ---- DERIVED -------------------------------------------------------------
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        String(u.tenantName).toLowerCase().includes(q) ||
        String(u.roleName).toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // ---- RENDER --------------------------------------------------------------
  return (
    <div className="mx-auto max-w-8xl p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Shield className="h-6 w-6 text-emerald-700" />
            Identity & Access Management
          </h1>
          <p className="text-gray-600">
            Roles, Menus, Modules, Permissions, and User invitations — in one
            place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </>
            )}
          </button>
          <button
            onClick={() => setOpenCreateUserModal(true)}
            className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`group inline-flex items-center border-b-2 px-1 py-2 text-sm font-medium ${active === t.id
                ? "border-emerald-700 text-emerald-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
            >
              <t.icon className="mr-2 h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT */}
      {active === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              title="Users"
              value={users.length}
              icon={<UserPlus className="h-6 w-6 text-blue-600" />}
            />
            <StatCard
              title="Roles"
              value={roles.length}
              icon={<Shield className="h-6 w-6 text-emerald-700" />}
            />
            <StatCard
              title="Menus"
              value={menus.length}
              icon={<PanelsTopLeft className="h-6 w-6 text-purple-600" />}
            />
            <StatCard
              title="Modules"
              value={modules.length}
              icon={<Boxes className="h-6 w-6 text-orange-600" />}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickActions
              onAddRole={() => setOpenRoleModal(true)}
              onAddMenu={() => setOpenMenuModal(true)}
              onAddPermission={() => setOpenPermissionModal(true)}
              onAddModule={() => setOpenModuleModal(true)}
              onInvite={() => setOpenCreateUserModal(true)}
            />
            <InfoCard />
          </div>
        </motion.div>
      )}

      {active === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by email, tenant or role"
                className="w-80 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <button
              onClick={() => setOpenCreateUserModal(true)}
              className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </button>
          </div>

          <div className="overflow-auto rounded-xl border bg-white">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr
                    key={`${u.authUserId}-${u.roleId}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {u.username}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {u.tenantName}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {u.roleName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${u.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-sm text-gray-500"
                      colSpan={4}
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {active === "roles" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Roles</h3>
            <button
              onClick={() => setOpenRoleModal(true)}
              className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {roles.map((r) => (
              <div key={r.roleId} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {r.roleName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Tenant: {r.tenantName || `#${r.tenantId}`}
                    </div>
                  </div>
                  <button
                    className="text-sm text-emerald-700 hover:underline"
                    onClick={() => {
                      setActive("mapRolePermission");
                      loadRolePermissions(r.roleId);
                    }}
                  >
                    Map permissions
                  </button>
                </div>
              </div>
            ))}
            {!roles.length && (
              <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                No roles yet. Create one.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {active === "menus" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Menus</h3>
            <button
              onClick={() => setOpenMenuModal(true)}
              className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu
            </button>
          </div>
          <div className="overflow-auto rounded-xl border bg-white">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Menu</th>
                  <th className="px-6 py-3">Parent</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Route / Link</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {menus
                  .slice()
                  .sort(
                    (a, b) => (a.menuSortOrder ?? 0) - (b.menuSortOrder ?? 0)
                  )
                  .map((m) => (
                    <tr key={m.menuId} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {m.menuName}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {m.parentMenuName ||
                          (m.parentId ? `#${m.parentId}` : "-")}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {m.menuLevel}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-600">
                        {m.menuRoute || m.menuLink || "-"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          className="text-sm text-emerald-700 hover:underline"
                          onClick={() => {
                            setActive("mapMenuPermission");
                            loadMenuMapping(m.menuId);
                          }}
                        >
                          Map permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                {!menus.length && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-sm text-gray-500"
                      colSpan={5}
                    >
                      No menus yet. Create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {active === "modules" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Modules</h3>
            <button
              onClick={() => setOpenModuleModal(true)}
              className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {modules.map((m) => (
              <div key={m.moduleId} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {m.moduleName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {m.isTechModule ? "Technical module" : "Business module"}
                    </div>
                  </div>
                  <button
                    className="text-sm text-emerald-700 hover:underline"
                    onClick={() => {
                      setActive("mapModuleMenu");
                      loadModuleMapping(m.moduleId);
                    }}
                  >
                    Map menus
                  </button>
                </div>
              </div>
            ))}
            {!modules.length && (
              <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                No modules yet. Create one.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* === SEPARATE MAPPING TABS ========================================= */}

      {/* Module ⇄ Menu */}
      {active === "mapModuleMenu" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <section className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Module ⇄ Menu</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedModuleId || ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (Number.isFinite(id)) loadModuleMapping(id);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select a module</option>
                  {modules.map((m) => (
                    <option key={m.moduleId} value={m.moduleId}>
                      {m.moduleName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    selectedModuleId &&
                    saveModuleMenuMapping(
                      selectedModuleId as number,
                      moduleMappedMenus,
                      prevModuleMapSnapshot
                    )
                  }
                  disabled={!selectedModuleId || savingModuleMap}
                  className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {savingModuleMap ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            <DualList
              leftTitle="Available Menus"
              rightTitle="Mapped Menus"
              leftItems={moduleUnmappedMenus}
              rightItems={moduleMappedMenus}
              keyFn={(x) => x.menuId}
              labelFn={(x) => `${x.menuName} (#${x.menuId})`}
              onMoveRight={(xs) => {
                const addIds = new Set(xs.map((x) => x.menuId));
                setModuleMappedMenus((p) => [
                  ...p,
                  ...xs.filter((x) => !p.find((m) => m.menuId === x.menuId)),
                ]);
                setModuleUnmappedMenus((p) =>
                  p.filter((m) => !addIds.has(m.menuId))
                );
              }}
              onMoveLeft={(xs) => {
                const remIds = new Set(xs.map((x) => x.menuId));
                setModuleUnmappedMenus((p) => [
                  ...p,
                  ...xs.filter((x) => !p.find((m) => m.menuId === x.menuId)),
                ]);
                setModuleMappedMenus((p) =>
                  p.filter((m) => !remIds.has(m.menuId))
                );
              }}
            />
          </section>
        </motion.div>
      )}

      {/* Menu ⇄ Permission */}
      {active === "mapMenuPermission" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <section className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Menu ⇄ Permission</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMenuId || ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (Number.isFinite(id)) loadMenuMapping(id);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select a menu</option>
                  {menus.map((m) => (
                    <option key={m.menuId} value={m.menuId}>
                      {m.menuName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    selectedMenuId &&
                    saveMenuPermissionMapping(
                      selectedMenuId as number,
                      menuMappedPerms.map((x) => ({
                        permissionId: x.permissionId,
                      })),
                      prevMenuMapSnapshot
                    )
                  }
                  disabled={!selectedMenuId || savingMenuMap}
                  className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {savingMenuMap ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            <DualList
              leftTitle="Available Permissions"
              rightTitle="Mapped Permissions"
              leftItems={menuUnmappedPerms}
              rightItems={menuMappedPerms}
              keyFn={(x) => x.permissionId}
              labelFn={(x) => `${x.permissionName} (#${x.permissionId})`}
              onMoveRight={(xs) => {
                const addIds = new Set(xs.map((x) => x.permissionId));
                setMenuMappedPerms((p) => [
                  ...p,
                  ...xs
                    .filter(
                      (x) => !p.find((m) => m.permissionId === x.permissionId)
                    )
                    .map((x) => ({
                      permissionId: x.permissionId,
                      permissionName: x.permissionName,
                    })),
                ]);
                setMenuUnmappedPerms((p) =>
                  p.filter((m) => !addIds.has(m.permissionId))
                );
              }}
              onMoveLeft={(xs) => {
                const remIds = new Set(xs.map((x) => x.permissionId));
                setMenuUnmappedPerms((p) => [
                  ...p,
                  ...xs
                    .filter(
                      (x) => !p.find((m) => m.permissionId === x.permissionId)
                    )
                    .map((x) => ({
                      permissionId: x.permissionId,
                      permissionName: x.permissionName,
                    })),
                ]);
                setMenuMappedPerms((p) =>
                  p.filter((m) => !remIds.has(m.permissionId))
                );
              }}
            />
          </section>
        </motion.div>
      )}

      {/* Role ⇄ Permission (MENU-FREE) */}
      {active === "mapRolePermission" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <section className="rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Role ⇄ Permission</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedRoleId || ""}
                  onChange={(e) => {
                    const rid = Number(e.target.value);
                    if (Number.isFinite(rid)) loadRolePermissions(rid);
                    else {
                      setSelectedRoleId("");
                      setRoleMappedPerms([]);
                      setRoleUnmappedPerms([]);
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select a role</option>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.roleName} (tenant {r.tenantName || `#${r.tenantId}`})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    if (!selectedRoleId) return;
                    saveRolePermissionMapping(
                      selectedRoleId as number,
                      roleMappedPerms,
                      prevRolePermSnapshot
                    );
                  }}
                  disabled={!selectedRoleId || savingRoleMap}
                  className="inline-flex items-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {savingRoleMap ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            {!selectedRoleId ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
                Select a role to manage permissions (menu is derived
                server-side).
              </div>
            ) : (
              <DualList
                leftTitle="Available Permissions"
                rightTitle="Mapped to Role"
                leftItems={roleUnmappedPerms}
                rightItems={roleMappedPerms}
                keyFn={(x) => x.permissionId}
                labelFn={(x) => `${x.permissionName} (#${x.permissionId})`}
                onMoveRight={(xs) => {
                  const add = xs.map((x) => ({
                    permissionId: x.permissionId,
                    permissionName: x.permissionName,
                  }));
                  setRoleMappedPerms((p) => [
                    ...p,
                    ...add.filter(
                      (a) => !p.find((i) => i.permissionId === a.permissionId)
                    ),
                  ]);
                  setRoleUnmappedPerms((p) =>
                    p.filter(
                      (i) => !add.find((a) => a.permissionId === i.permissionId)
                    )
                  );
                }}
                onMoveLeft={(xs) => {
                  const remIds = new Set(xs.map((x) => x.permissionId));
                  setRoleUnmappedPerms((p) => [
                    ...p,
                    ...xs
                      .filter(
                        (x) => !p.find((i) => i.permissionId === x.permissionId)
                      )
                      .map((x) => ({
                        permissionId: x.permissionId,
                        permissionName: x.permissionName,
                      })),
                  ]);
                  setRoleMappedPerms((p) =>
                    p.filter((i) => !remIds.has(i.permissionId))
                  );
                }}
              />
            )}
          </section>
        </motion.div>
      )}

      {/* SNAPSHOTS for diffing */}
      <SnapshotSync
        mapped={moduleMappedMenus}
        onSnapshot={(snap) => (prevModuleMapSnapshot = snap)}
        deps={[selectedModuleId]}
      />
      <SnapshotSync
        mapped={menuMappedPerms}
        onSnapshot={(snap) => (prevMenuMapSnapshot = snap)}
        deps={[selectedMenuId]}
      />
      <SnapshotSync
        mapped={roleMappedPerms}
        onSnapshot={(snap) => (prevRolePermSnapshot = snap)}
        deps={[selectedRoleId]}
      />

      {/* MODALS */}
      <CreateUserModal
        open={openCreateUserModal}
        tenants={tenants}
        onClose={() => setOpenCreateUserModal(false)}
        onSuccess={async () => {
          setOpenCreateUserModal(false);
          try {
            const u = await apiService.get(
              `${IDAM_PATH}get_all_users`,
              {},
              IDAM_PORT
            );
            setUsers(parseUsers(u));
          } catch { }
        }}
      />

      <AddRoleModal
        open={openRoleModal}
        tenants={tenants}
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

      <AddPermissionModal
        open={openPermissionModal}
        onClose={() => setOpenPermissionModal(false)}
        onCreate={createPermission}
      />
    </div>
  );
}

// ---- SMALLS ----------------------------------------------------------------
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">{icon}</div>
      </div>
    </div>
  );
}

function QuickActions({
  onAddRole,
  onAddMenu,
  onAddPermission,
  onAddModule,
  onInvite,
}: {
  onAddRole: () => void;
  onAddMenu: () => void;
  onAddPermission: () => void;
  onAddModule: () => void;
  onInvite: () => void;
}) {
  const Action = ({
    title,
    desc,
    onClick,
  }: {
    title: string;
    desc: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left hover:bg-gray-50"
    >
      <div className="rounded-lg bg-emerald-100 p-2">
        <Plus className="h-5 w-5 text-emerald-700" />
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-3">
      <Action
        title="Add Role"
        desc="Create a new role in a tenant"
        onClick={onAddRole}
      />
      <Action
        title="Add Menu"
        desc="Create a new navigation menu"
        onClick={onAddMenu}
      />
      <Action
        title="Add Permission"
        desc="Create a permission entity"
        onClick={onAddPermission}
      />
      <Action
        title="Add Module"
        desc="Create a product module"
        onClick={onAddModule}
      />
      <Action
        title="Create User"
        desc="Create a user with role and preferences"
        onClick={onInvite}
      />
    </div>
  );
}

function InfoCard() {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-lg bg-blue-100 p-2">
          <AlertCircle className="h-5 w-5 text-blue-700" />
        </div>
        <div className="text-xl font-semibold text-gray-900">How it works</div>
      </div>
      <ul className="list-disc pl-6 text-2xl text-gray-600">
        <li>Modules group features. Map Menus to Modules.</li>
        <li>Menus expose screens/actions. Map Permissions to Menus.</li>
        <li>Roles grant access. Map Permissions to Roles (menu is derived).</li>
        <li>Invite users to a Tenant and assign a Role.</li>
      </ul>
    </div>
  );
}

// Snapshots for diffs
let prevModuleMapSnapshot: { menuId: number }[] = [];
let prevMenuMapSnapshot: { permissionId: number; menuPermissionId?: number }[] =
  [];
let prevRolePermSnapshot: {
  permissionId: number;
  rolePermissionIds?: number[];
}[] = [];

function SnapshotSync({
  mapped,
  onSnapshot,
  deps,
}: {
  mapped: any;
  onSnapshot: (snap: any) => void;
  deps: any[];
}) {
  useEffect(() => {
    onSnapshot(JSON.parse(JSON.stringify(mapped)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}
