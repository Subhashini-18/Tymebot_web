// src/components/AddRoleModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Save, X, Loader2, AlertCircle, Building2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";
import { getAuthData, getUserRole } from "@/utils/auth";

type Tenant = { tenantId: number; tenantName: string; isActive?: boolean };
type RolePayload = {
  roleName: string;
  tenantId: number;
  isActive: boolean;
  mediaLink?: string | null;
};

const TRACS_PATH = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
const TRACS_PORT = parseInt(import.meta.env.VITE_BASE_PORT || "8082", 10);

const safeArray = <T,>(x: any): T[] => (Array.isArray(x) ? x : x ? [x] : []);

export default function AddRoleModal({
  open,
  tenants: tenantsProp = [],
  onClose,
  onCreate,
}: {
  open: boolean;
  tenants?: Tenant[];
  onClose: () => void;
  onCreate: (payload: RolePayload) => Promise<unknown> | unknown;
}) {
  const { showToast } = useToast();
  const auth = getAuthData();
  const userRole = getUserRole(); // "platform" | "client" | "vendor"

  // form
  const [roleName, setRoleName] = useState("");
  const [tenantId, setTenantId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [mediaLink, setMediaLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // tenants (either from prop or fetched locally)
  const [tenants, setTenants] = useState<Tenant[]>(tenantsProp || []);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // keep internal tenants in sync with prop if it changes
  useEffect(() => {
    setTenants(tenantsProp || []);
  }, [tenantsProp]);

  // fetch tenants the same way as CreateCredentials
  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      let resp: any;
      if (userRole === "platform") {
        // list all
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: 0 },
          TRACS_PORT
        );
      } else if (userRole === "client") {
        // list vendors under this client (uses clientId)
        const clientId = auth?.clientId ?? 0;
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: clientId },
          TRACS_PORT
        );
      } else {
        // vendor: just self (but API supports 0 too; we’ll filter/format)
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

      // vendor can only create roles for their own org; clamp to self
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

  // “Your Organization” first, then the rest
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

  // reset form when opened; fetch tenants if we don’t have any yet
  useEffect(() => {
    if (!open) return;
    setRoleName("");
    setIsActive(true);
    setMediaLink("");
    setSubmitting(false);

    // if no tenants provided/loaded yet, fetch
    const needFetch = !tenantsProp?.length && !tenants.length;
    if (needFetch) fetchTenants();

    // initial selection: if exactly one option, auto-select; else prefer auth tenant
    if (tenantOptions.length === 1) {
      setTenantId(tenantOptions[0].value);
    } else if (auth?.tenantId) {
      setTenantId(String(auth.tenantId));
    } else {
      setTenantId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // keep selection stable when tenantOptions change
  useEffect(() => {
    if (!open) return;
    if (!tenantId) {
      if (tenantOptions.length === 1) setTenantId(tenantOptions[0].value);
      else if (auth?.tenantId) setTenantId(String(auth.tenantId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantOptions.length]);

  const validate = () => {
    const miss: string[] = [];
    if (!roleName.trim()) miss.push("Role Name");
    if (!tenantId) miss.push("Tenant");
    if (miss.length) {
      showToast({ type: "error", message: `Please fill: ${miss.join(", ")}` });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    const payload: RolePayload = {
      roleName: roleName.trim(),
      tenantId: Number(tenantId),
      isActive,
      mediaLink: mediaLink.trim() || null,
    };

    try {
      setSubmitting(true);
      await Promise.resolve(onCreate(payload));
      showToast({ type: "success", message: "Role created" });
      onClose();
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to create role",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
                  <Shield className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Role
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role Name *
                </label>
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Vendor IT Team"
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
                    onChange={(e) => setTenantId(e.target.value)}
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
                  Media Link (optional)
                </label>
                <input
                  value={mediaLink}
                  onChange={(e) => setMediaLink(e.target.value)}
                  placeholder="https://asset.example/icon"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
                />
                Active
              </label>

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Tip
                </div>
                Use a clear name (e.g., <b>QBOX – Vendor IT Team</b>).
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
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Role
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
