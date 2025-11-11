import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, Save, X, Loader2, Building2, UserCheck, Globe, CalendarClock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";
import { getAuthData, getUserRole } from "@/utils/auth";

const TRACS_PATH = import.meta.env?.VITE_API_PATH || "/api/tyme/tracs/v1/";
const TRACS_PORT = parseInt(import.meta.env?.VITE_BASE_PORT || "8082", 10);

// Types
type Tenant = { tenantId: number; tenantName: string; isActive?: boolean };
type RoleLite = { roleId: number; roleName: string };
type EntityLite = { id: number; name: string };
type LocationLite = { id: number; name: string };

type Props = {
    open: boolean;
    tenants?: Tenant[];
    onClose: () => void;
    onSuccess: () => void; // called after successful creation
};

const safeArray = <T,>(x: any): T[] => (Array.isArray(x) ? x : x ? [x] : []);

const TIMEZONES = [
    "UTC",
    "Asia/Kolkata",
    "America/New_York",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Singapore",
    "Asia/Dubai",
    "America/Los_Angeles",
];
const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"];
const TIME_FORMATS = ["24h", "12h"];

export default function CreateUserModal({ open, tenants: tenantsProp = [], onClose, onSuccess }: Props) {
    const { showToast } = useToast();
    const auth = getAuthData();
    const userRole = getUserRole(); // 'platform' | 'client' | 'vendor'

    // form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [tenantId, setTenantId] = useState<string>("");
    const [roles, setRoles] = useState<RoleLite[]>([]);
    const [roleId, setRoleId] = useState<string>("");
    const [scopeType, setScopeType] = useState<"entity" | "location" | "">("");
    const [entityId, setEntityId] = useState<string>("");
    const [locationId, setLocationId] = useState<string>("");

    // preferences
    const [timeZone, setTimeZone] = useState<string>("UTC");
    const [dateFormat, setDateFormat] = useState<string>("YYYY-MM-DD");
    const [timeFormat, setTimeFormat] = useState<string>("24h");
    const [basicPreferences, setBasicPreferences] = useState<string[]>([]);

    // lists
    const [tenants, setTenants] = useState<Tenant[]>(tenantsProp);
    const [entities, setEntities] = useState<EntityLite[]>([]);
    const [locations, setLocations] = useState<LocationLite[]>([]);

    // loading flags
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingEntities, setLoadingEntities] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setTenants(tenantsProp || []);
    }, [tenantsProp]);

    // fetch helpers
    const fetchTenants = async () => {
        try {
            setLoadingTenants(true);
            let resp: any;
            if (userRole === "platform") {
                resp = await apiService.get(`${TRACS_PATH}get_all_tenant_of_client`, { id: 0 }, TRACS_PORT);
            } else if (userRole === "client") {
                const clientId = auth?.clientId ?? 0;
                resp = await apiService.get(`${TRACS_PATH}get_all_tenant_of_client`, { id: clientId }, TRACS_PORT);
            } else {
                const selfTenantId = auth?.tenantId ?? 0;
                resp = await apiService.get(`${TRACS_PATH}get_all_tenant_of_client`, { id: selfTenantId || 0 }, TRACS_PORT);
            }
            const list = resp?.data?.data ?? resp?.data ?? [];
            const mapped: Tenant[] = safeArray<any>(list).map((t) => ({
                tenantId: Number(t.tenantId ?? t.id),
                tenantName: t.tenantName ?? t.name ?? "—",
                isActive: typeof t.isActive === "boolean" ? t.isActive : true,
            }));
            const finalTenants = userRole === "vendor" && auth?.tenantId
                ? mapped.filter((t) => t.tenantId === Number(auth.tenantId))
                : mapped;
            setTenants(finalTenants);
        } catch (e: any) {
            showToast({ type: "error", message: e?.message || "Failed to load tenants" });
            setTenants([]);
        } finally {
            setLoadingTenants(false);
        }
    };

    const fetchRolesForTenant = async (tid: number): Promise<RoleLite[]> => {
        const resp: any = await apiService.get(`${TRACS_PATH}get_all_roles_of_tenant`, { id: tid }, TRACS_PORT);
        const list = resp?.data ?? resp ?? [];
        const mapped: RoleLite[] = safeArray<any>(list)
            .map((r) => ({ roleId: Number(r.roleId ?? r.id ?? 0), roleName: String(r.roleName ?? r.name ?? "") }))
            .filter((r) => !/system[\s\-]?admin/i.test(r.roleName));
        return mapped.filter((r) => !!r.roleId && !!r.roleName);
    };

    // NOTE: Endpoints for entity/location are assumptions; adjust if different
    const fetchEntitiesForTenant = async (tid: number): Promise<EntityLite[]> => {
        try {
            setLoadingEntities(true);
            const resp: any = await apiService.get(`${TRACS_PATH}get_all_entities_of_tenant`, { id: tid }, TRACS_PORT);
            const list = resp?.data?.data ?? resp?.data ?? [];
            return safeArray<any>(list)
                .map((e) => ({ id: Number(e.id ?? e.entityId ?? 0), name: String(e.name ?? e.entityName ?? "") }))
                .filter((e) => !!e.id && !!e.name);
        } catch {
            return [];
        } finally {
            setLoadingEntities(false);
        }
    };

    const fetchLocationsForTenant = async (tid: number): Promise<LocationLite[]> => {
        try {
            setLoadingLocations(true);
            const resp: any = await apiService.get(`${TRACS_PATH}get_all_locations_of_tenant`, { id: tid }, TRACS_PORT);
            const list = resp?.data?.data ?? resp?.data ?? [];
            return safeArray<any>(list)
                .map((l) => ({ id: Number(l.id ?? l.locationId ?? 0), name: String(l.name ?? l.locationName ?? "") }))
                .filter((l) => !!l.id && !!l.name);
        } catch {
            return [];
        } finally {
            setLoadingLocations(false);
        }
    };

    // modal open init
    useEffect(() => {
        if (!open) return;
        // reset
        setFirstName("");
        setLastName("");
        setEmail("");
        setTenantId("");
        setRoleId("");
        setScopeType("");
        setEntityId("");
        setLocationId("");
        setTimeZone("UTC");
        setDateFormat("YYYY-MM-DD");
        setTimeFormat("24h");
        setBasicPreferences([]);

        const needFetchTenants = !tenantsProp?.length && !tenants.length;
        if (needFetchTenants) fetchTenants();
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // default tenant when options ready
    const tenantOptions = useMemo(() => {
        const me = auth?.tenantName && auth?.tenantId
            ? [{ label: `${auth.tenantName} (Your Organization)`, value: String(auth.tenantId) }]
            : [];
        const others = tenants
            .filter((t) => String(t.tenantId) !== String(auth?.tenantId ?? ""))
            .map((t) => ({ label: t.tenantName, value: String(t.tenantId) }));
        return [...me, ...others];
    }, [tenants, auth?.tenantId, auth?.tenantName]);

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
            // preload entity/location
            (async () => {
                const [es, ls] = await Promise.all([
                    fetchEntitiesForTenant(Number(selected)),
                    fetchLocationsForTenant(Number(selected)),
                ]);
                setEntities(es);
                setLocations(ls);
            })();
        }
    }, [tenantOptions.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const onTenantChange = async (tid: string) => {
        setTenantId(tid);
        setRoleId("");
        setRoles([]);
        setEntities([]);
        setLocations([]);
        if (!tid) return;
        setLoadingRoles(true);
        try {
            const [rs, es, ls] = await Promise.all([
                fetchRolesForTenant(Number(tid)),
                fetchEntitiesForTenant(Number(tid)),
                fetchLocationsForTenant(Number(tid)),
            ]);
            setRoles(rs);
            setEntities(es);
            setLocations(ls);
        } catch {
            setRoles([]);
            setEntities([]);
            setLocations([]);
        } finally {
            setLoadingRoles(false);
        }
    };

    // preferences helpers
    const toggleBasicPref = (key: string) => {
        setBasicPreferences((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    // validation + submit
    const validate = () => {
        const misses: string[] = [];
        if (!firstName.trim()) misses.push("First name");
        if (!lastName.trim()) misses.push("Last name");
        if (!email.trim()) misses.push("Email");
        if (!tenantId) misses.push("Tenant");
        if (!roleId) misses.push("Role");
        if (!scopeType) misses.push("Scope type");
        if (scopeType === "entity" && !entityId) misses.push("Entity");
        if (scopeType === "location" && !locationId) misses.push("Location");
        if (misses.length) {
            showToast({ type: "error", message: `Please fill: ${misses.join(", ")}` });
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

        const payload: any = {
            authUserName: email.trim(),
            tenantId: Number(tenantId),
            roleId: Number(roleId),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            scopeType,
            entityId: entityId ? Number(entityId) : undefined,
            locationId: locationId ? Number(locationId) : undefined,
            preferences: {
                timeZone,
                dateFormat,
                timeFormat,
                basicPreferences,
            },
        };

        try {
            setSubmitting(true);
            await apiService.post(`${TRACS_PATH}create_tenant_credentials`, payload, TRACS_PORT);
            showToast({ type: "success", message: "User created" });
            onSuccess();
            onClose();
        } catch (e: any) {
            showToast({ type: "error", message: e?.message || "Failed to create user" });
        } finally {
            setSubmitting(false);
        }
    };

    // UI
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
                        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
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
                                <h3 className="text-lg font-semibold text-gray-900">Create User</h3>
                            </div>
                            <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" type="button">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">First name *</label>
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Will"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Last name *</label>
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Smith"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@company.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tenant *</label>
                                <div className="relative">
                                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={tenantId}
                                        onChange={(e) => onTenantChange(e.target.value)}
                                        disabled={loadingTenants || tenantOptions.length === 0}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-100"
                                    >
                                        <option value="">{loadingTenants ? "Loading tenants…" : tenantOptions.length ? "Select tenant" : "No tenants"}</option>
                                        {tenantOptions.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Role *</label>
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

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Scope type *</label>
                                <select
                                    value={scopeType}
                                    onChange={(e) => {
                                        setScopeType(e.target.value as any);
                                        setEntityId("");
                                        setLocationId("");
                                    }}
                                    className="w-full rounded-lg border border-gray-300 py-2 px-3"
                                >
                                    <option value="">Select scope</option>
                                    <option value="entity">Entity</option>
                                    <option value="location">Location</option>
                                </select>
                            </div>

                            {scopeType === "entity" && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Entity *</label>
                                    <div className="relative">
                                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <select
                                            disabled={!tenantId || loadingEntities}
                                            value={entityId}
                                            onChange={(e) => setEntityId(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 disabled:bg-gray-100"
                                        >
                                            {!tenantId ? (
                                                <option value="">Select tenant first</option>
                                            ) : loadingEntities ? (
                                                <option value="">Loading entities…</option>
                                            ) : entities.length ? (
                                                <>
                                                    <option value="">Select entity</option>
                                                    {entities.map((en) => (
                                                        <option key={en.id} value={en.id}>
                                                            {en.name}
                                                        </option>
                                                    ))}
                                                </>
                                            ) : (
                                                <option value="">No entities found</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {scopeType === "location" && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
                                    <div className="relative">
                                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <select
                                            disabled={!tenantId || loadingLocations}
                                            value={locationId}
                                            onChange={(e) => setLocationId(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 disabled:bg-gray-100"
                                        >
                                            {!tenantId ? (
                                                <option value="">Select tenant first</option>
                                            ) : loadingLocations ? (
                                                <option value="">Loading locations…</option>
                                            ) : locations.length ? (
                                                <>
                                                    <option value="">Select location</option>
                                                    {locations.map((l) => (
                                                        <option key={l.id} value={l.id}>
                                                            {l.name}
                                                        </option>
                                                    ))}
                                                </>
                                            ) : (
                                                <option value="">No locations found</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Time zone</label>
                                    <div className="relative">
                                        <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={timeZone}
                                            onChange={(e) => setTimeZone(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3"
                                        >
                                            {TIMEZONES.map((tz) => (
                                                <option key={tz} value={tz}>
                                                    {tz}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Date format</label>
                                    <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 px-3">
                                        {DATE_FORMATS.map((f) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Time format</label>
                                    <select value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 px-3">
                                        {TIME_FORMATS.map((f) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Basic preferences</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: "email_notifications", label: "Email notifications" },
                                        { key: "dark_mode", label: "Dark mode" },
                                        { key: "weekly_summary", label: "Weekly summary" },
                                    ].map((opt) => (
                                        <label key={opt.key} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={basicPreferences.includes(opt.key)}
                                                onChange={() => toggleBasicPref(opt.key)}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t p-6">
                            <button onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50">
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
                                        <span className="ml-2">Creating…</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create
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