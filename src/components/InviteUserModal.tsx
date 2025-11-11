import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, Save, X, Loader2, Building2, UserCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";
import { getAuthData, getUserRole } from "@/utils/auth";

const TRACS_PATH = import.meta.env?.VITE_API_PATH || "/api/tyme/tracs/v1/";
const TRACS_PORT = parseInt(import.meta.env?.VITE_BASE_PORT || "8082", 10);

type Tenant = { tenantId: number; tenantName: string; isActive?: boolean };
type RoleLite = { roleId: number; roleName: string };

const safeArray = <T,>(x: any): T[] => (Array.isArray(x) ? x : x ? [x] : []);

export default function InviteUserModal({
  open,
  tenants: tenantsProp = [],
  onClose,
  onSuccess,
}: {
  open: boolean;
  tenants?: Tenant[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();

  const auth = getAuthData();
  const userRole = getUserRole(); // 'platform' | 'client' | 'vendor'

  // form state
  const [email, setEmail] = useState("");
  const [tenantId, setTenantId] = useState<string>("");
  const [roles, setRoles] = useState<RoleLite[]>([]);
  const [roleId, setRoleId] = useState<string>("");
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // tenants (prop or fetched)
  const [tenants, setTenants] = useState<Tenant[]>(tenantsProp);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    setTenants(tenantsProp || []);
  }, [tenantsProp]);

  // ---- TENANTS (same behavior as CreateCredentials) -------------------------
  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      let resp: any;

      if (userRole === "platform") {
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: 0 },
          TRACS_PORT
        );
      } else if (userRole === "client") {
        const clientId = auth?.clientId ?? 0;
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: clientId },
          TRACS_PORT
        );
      } else {
        const selfTenantId = auth?.tenantId ?? 0;
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: selfTenantId || 0 },
          TRACS_PORT
        );
      }

      const list = resp?.data?.data ?? resp?.data ?? [];
      const mapped: Tenant[] = safeArray<any>(list).map((t) => ({
        tenantId: Number(t.tenantId ?? t.id),
        tenantName: t.tenantName ?? t.name ?? "—",
        isActive: typeof t.isActive === "boolean" ? t.isActive : true,
      }));

      const finalTenants =
        userRole === "vendor" && auth?.tenantId
          ? mapped.filter((t) => t.tenantId === Number(auth.tenantId))
          : mapped;

      setTenants(finalTenants);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to load tenants",
      });
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  // Build options with "Your Organization" first
  const tenantOptions = useMemo(() => {
    const me =
      auth?.tenantName && auth?.tenantId
        ? [
          {
            label: `${auth.tenantName} (Your Organization)`,
            value: String(auth.tenantId),
          },
        ]
        : [];
    const others = tenants
      .filter((t) => String(t.tenantId) !== String(auth?.tenantId ?? ""))
      .map((t) => ({ label: t.tenantName, value: String(t.tenantId) }));
    return [...me, ...others];
  }, [tenants, auth?.tenantId, auth?.tenantName]);

  // ---- ROLES (IDENTICAL MAPPING AS CreateCredentials) -----------------------
  const fetchRolesForTenant = async (tid: number): Promise<RoleLite[]> => {
    const resp: any = await apiService.get(
      `${TRACS_PATH}get_all_roles_of_tenant`,
      { id: tid },
      TRACS_PORT
    );
    const list = resp?.data ?? resp ?? [];
    // Filter out any role containing "System Admin" or "System-Admin" (case-insensitive)
    const mapped: RoleLite[] = safeArray<any>(list)
      .map((r) => ({
        roleId: Number(r.roleId ?? r.id ?? 0),
        roleName: String(r.roleName ?? r.name ?? ""),
      }))
      .filter(
        (r) => !/system[\s\-]?admin/i.test(r.roleName)
      );
    return mapped.filter((r) => !!r.roleId && !!r.roleName);
  };

  // When modal opens: reset + fetch tenants if needed
  useEffect(() => {
    if (!open) return;

    setEmail("");
    setRoleId("");
    setRoles([]);
    setSubmitting(false);

    const needFetch = !tenantsProp?.length && !tenants.length;
    if (needFetch) {
      (async () => {
        await fetchTenants();
      })();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep tenant selection stable as options arrive/change, then load roles
  useEffect(() => {
    if (!open) return;

    let selected = tenantId;
    if (!selected) {
      if (tenantOptions.length === 1) selected = tenantOptions[0].value;
      else if (auth?.tenantId) selected = String(auth.tenantId);
    }

    if (selected && selected !== tenantId) {
      setTenantId(selected);
      setLoadingRoles(true);
      fetchRolesForTenant(Number(selected))
        .then((rs) => setRoles(rs))
        .catch(() => setRoles([]))
        .finally(() => setLoadingRoles(false));
    }
  }, [tenantOptions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTenantChange = async (tid: string) => {
    setTenantId(tid);
    setRoleId("");
    setRoles([]);
    if (!tid) return;
    setLoadingRoles(true);
    try {
      const rs = await fetchRolesForTenant(Number(tid));
      setRoles(rs);
    } catch {
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  // ---- SUBMIT ---------------------------------------------------------------
  const validate = () => {
    const misses: string[] = [];
    if (!email.trim()) misses.push("Email");
    if (!tenantId) misses.push("Tenant");
    if (!roleId) misses.push("Role");
    if (misses.length) {
      showToast({
        type: "error",
        message: `Please fill: ${misses.join(", ")}`,
      });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast({ type: "error", message: "Enter a valid email address" });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      authUserName: email.trim(),
      tenantId: Number(tenantId),
      roleId: Number(roleId),
    };

    try {
      setSubmitting(true);
      await apiService.post(
        `${TRACS_PATH}create_tenant_credentials`,
        payload,
        TRACS_PORT
      );
      showToast({ type: "success", message: "Invitation created" });
      onSuccess();
      onClose();
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to invite user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---- UI -------------------------------------------------------------------
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl rounded-xl bg-white shadow-xl"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <UserPlus className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Invite User
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tenant *
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={tenantId}
                    onChange={(e) => onTenantChange(e.target.value)}
                    disabled={loadingTenants || tenantOptions.length === 0}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingTenants
                        ? "Loading tenants…"
                        : tenantOptions.length
                          ? "Select tenant"
                          : "No tenants"}
                    </option>
                    {tenantOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role *
                </label>
                <div className="relative">
                  <UserCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    disabled={!tenantId || loadingRoles}
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 disabled:bg-gray-100"
                  >
                    {!tenantId ? (
                      <option value="">Select tenant first</option>
                    ) : loadingRoles ? (
                      <option value="">Loading roles…</option>
                    ) : roles.length ? (
                      <>
                        <option value="">Select role</option>
                        {roles.map((r) => (
                          <option key={r.roleId} value={r.roleId}>
                            {r.roleName}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">No roles found for tenant</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t p-6">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Inviting…</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Invite
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
