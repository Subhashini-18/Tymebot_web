// src/pages/admin/CreateCredentials.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Building,
  RefreshCw,
  UserCheck,
  Plus,
  X,
  Save,
  Loader2 as Loader,
  UserPlus2,
  Briefcase,
  Calendar,
  Clock,
} from "lucide-react";
import { apiService } from "@/services/api/apiservice";
import { Dropdown } from "./ui/Dropdown";
import { MultiSelect } from "./ui/form/MultiSelect";
import { useToast } from "@/context/ToastContext";
import { getAuthData, getUserRole } from "@/utils/auth";

/** ENV */
const TRACS_PATH = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
const TRACS_PORT = parseInt(import.meta.env.VITE_BASE_PORT || "8082", 10);
const IDAM_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const IDAM_PORT = parseInt(import.meta.env.VITE_BASE_IDAM_PORT || "8080", 10);

/** TYPES */
type Client = {
  id: string;
  name: string;
  organizationName: string;
  email: string;
  status: "active" | "inactive";
};
type Vendor = Client;
type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  userType: "platform" | "client" | "vendor";
  isActive: boolean;
};

type CredentialData = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "platform" | "client" | "vendor";
  permissions: string[];
  organizationName: string;
  department: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  status: "active" | "pending" | "suspended";
  clientId?: string;
  vendorId?: string;
  roleId?: string;
};

type RoleModalData = { name: string; tenantId: string };

const safeArray = <T,>(x: any): T[] => (Array.isArray(x) ? x : x ? [x] : []);
const nameFromEmail = (email: string) =>
  (email?.split("@")[0] || "")
    .split(/[.\-_]/g)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
    .join(" ") || email;

const getStatusBadge = (s: CredentialData["status"]) =>
  s === "active"
    ? "bg-green-100 text-green-800"
    : s === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";
const getRoleBadge = (r: CredentialData["role"]) =>
  r === "platform"
    ? "bg-blue-100 text-blue-800"
    : r === "client"
      ? "bg-green-100 text-green-800"
      : "bg-purple-100 text-purple-800";

const CreateCredentials: React.FC = () => {
  const { showToast } = useToast();
  const userRole = getUserRole(); // 'platform' | 'client' | 'vendor'
  const auth = getAuthData();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    department: "",
    phone: "",
    role: (userRole || "vendor") as "platform" | "client" | "vendor",
    permissions: [] as string[],
    sendEmail: true,
    customMessage: "",
    clientId: "",
    tenantId: "",
    roleIds: [] as string[], // <-- change from roleId to roleIds (array)
  });

  const [createdCredentials, setCreatedCredentials] = useState<
    CredentialData[]
  >([]);
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalData, setRoleModalData] = useState<RoleModalData>({
    name: "",
    tenantId: "",
  });

  /** Fetchers */
  const fetchClients = async () => {
    try {
      const resp: any = await apiService.get(
        `${TRACS_PATH}get_all_tenant_of_client`,
        { id: 0 },
        TRACS_PORT
      );
      const list = resp?.data?.data ?? resp?.data ?? [];
      const mapped: Client[] = safeArray<any>(list).map((c) => ({
        id: String(c.tenantId ?? c.id),
        name: c.tenantName ?? c.name,
        organizationName: c.organizationName ?? c.tenantName ?? c.name ?? "—",
        email: c.primaryContactEmail ?? c.email ?? "",
        status: c.status ?? "active",
      }));
      setClients(mapped);
    } catch (e: any) {
      showToast({
        message: e?.message || "Failed to fetch tenants",
        type: "error",
      });
    }
  };

  const fetchVendors = async () => {
    try {
      let resp: any;
      if (auth?.clientId) {
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: auth.clientId },
          TRACS_PORT
        );
      } else {
        resp = await apiService.get(
          `${TRACS_PATH}get_all_tenant_of_client`,
          { id: 0 },
          TRACS_PORT
        );
      }
      const list = resp?.data?.data ?? resp?.data ?? [];
      const mapped: Vendor[] = safeArray<any>(list).map((v) => ({
        id: String(v.tenantId ?? v.id),
        name: v.tenantName ?? v.name,
        organizationName: v.organizationName ?? v.tenantName ?? v.name ?? "—",
        email: v.email ?? "",
        status: v.status ?? "active",
      }));
      setVendors(mapped);
      setFilteredVendors(mapped);
    } catch (e: any) {
      showToast({
        message: e?.message || "Failed to fetch vendors",
        type: "error",
      });
    }
  };

  const fetchRolesForTenant = async (tenantId: string) => {
    if (!tenantId) return;
    setIsLoadingRoles(true);
    try {
      const resp: any = await apiService.get(
        `${TRACS_PATH}get_all_roles_of_tenant`,
        { id: tenantId },
        TRACS_PORT
      );
      const list = resp?.data ?? resp ?? [];
      // Filter out any role containing "System Admin" or "System-Admin" (case-insensitive)
      const mapped: Role[] = safeArray<any>(list)
        .map((r) => ({
          id: String(r.roleId ?? r.id ?? ""),
          name: r.roleName ?? r.name ?? "",
          description: r.description ?? "",
          permissions: r.permissions ?? [],
          userType: r.userType ?? "vendor",
          isActive: typeof r.isActive === "boolean" ? r.isActive : true,
        }))
        .filter(
          (r) =>
            !/system[\s\-]?admin/i.test(r.name)
        );
      setRoles(mapped);
      setFormData((prev) => ({ ...prev, roleIds: [] })); // <-- clear selected roles
    } catch (e: any) {
      showToast({
        message: e?.message || "Failed to fetch roles",
        type: "error",
      });
      setRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoadingData(true);
      try {
        if (userRole === "platform") {
          await fetchClients();
          await fetchVendors();
        } else if (userRole === "client") {
          await fetchVendors();
        }
        if (
          (userRole === "client" || userRole === "vendor") &&
          auth?.tenantId
        ) {
          setFormData((prev) => ({
            ...prev,
            tenantId: String(auth?.tenantId),
          }));
          await fetchRolesForTenant(String(auth?.tenantId));
        }
      } finally {
        setIsLoadingData(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, auth?.tenantId, auth?.clientId]);

  /** Options */
  const tenantOptions = useMemo(() => {
    const base =
      auth?.tenantName && auth?.tenantId
        ? [
          {
            label: `${auth?.tenantName} (Your Organization)`,
            value: String(auth?.tenantId),
          },
        ]
        : [];
    const others = clients
      .filter((t) => t.id !== String(auth?.tenantId ?? ""))
      .map((t) => ({ label: t.name, value: t.id }));
    return [...base, ...others];
  }, [clients, auth?.tenantId, auth?.tenantName]);

  const vendorOptions = useMemo(() => {
    const base =
      auth?.tenantName && auth?.tenantId
        ? [
          {
            label: `${auth.tenantName} (Your Organization)`,
            value: String(auth.tenantId),
          },
        ]
        : [];
    const others = filteredVendors
      .filter((v) => v.id !== String(auth?.tenantId ?? ""))
      .map((v) => ({ label: v.name, value: v.id }));
    return [...base, ...others];
  }, [filteredVendors, auth?.tenantId, auth?.tenantName]);

  const roleOptions = roles.map((r) => ({ label: r.name, value: r.id }));

  /** Actions */
  const createRole = async (data: RoleModalData) => {
    if (!data.name || !data.tenantId) {
      showToast({ message: "Role name & tenant are required", type: "error" });
      return;
    }
    try {
      setIsLoadingRoles(true);
      const payload = {
        roleName: data.name,
        isActive: true,
        tenantId: parseInt(data.tenantId, 10),
      };
      const resp: any = await apiService.post(
        `${IDAM_PATH}create_role`,
        payload,
        IDAM_PORT
      );
      if (resp?.isSuccess || resp?.status === "success") {
        showToast({ message: "Role created", type: "success" });
        await fetchRolesForTenant(formData?.tenantId || data?.tenantId);
        setRoleModalOpen(false);
        setRoleModalData({ name: "", tenantId: formData?.tenantId || "" });
      } else {
        throw new Error(resp?.message || "Failed to create role");
      }
    } catch (e: any) {
      showToast({
        message: e?.message || "Failed to create role",
        type: "error",
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!formData.email) errs.push("Email");
    if (!formData.roleIds || formData.roleIds.length === 0) errs.push("Role"); // <-- require at least one role
    if (userRole !== "vendor" && !formData.tenantId) errs.push("Tenant");

    if (errs.length) {
      showToast({
        message: `Please fill all required fields: ${errs.join(", ")}`,
        type: "error",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    setIsCreating(true);
    try {
      const tenantIdToUse =
        userRole === "vendor"
          ? String(auth?.tenantId || formData.tenantId)
          : formData.tenantId;
      const payload = {
        authUserName: formData.email,
        tenantId: parseInt(tenantIdToUse, 10),
        roleIds: formData.roleIds.map((id) => parseInt(id, 10)), // <-- send array of roleIds
      };

      const resp: any = await apiService.post(
        `${TRACS_PATH}create_tenant_credentials`,
        payload,
        TRACS_PORT
      );
      if (resp?.success || resp?.isSuccess) {
        showToast({
          message: "Credentials created successfully!",
          type: "success",
        });
        const newRow: CredentialData = {
          id: Math.random().toString(36).slice(2),
          name: nameFromEmail(formData?.email),
          email: formData?.email,
          password: "",
          role: formData?.role,
          permissions: [],
          organizationName: formData?.organizationName,
          department: formData?.department,
          phone: formData?.phone,
          createdAt: new Date().toISOString(),
          lastLogin: "Never",
          status: "pending",
          clientId: formData?.clientId,
          vendorId: tenantIdToUse,
          roleId: formData?.roleIds.join(","), // store as comma-separated for display
        };
        setCreatedCredentials((prev) => [newRow, ...prev]);
        setFormData((prev) => ({
          ...prev,
          name: "",
          email: "",
          organizationName: "",
          department: "",
          phone: "",
          permissions: [],
          customMessage: "",
          roleIds: [], // <-- clear selected roles
        }));
      } else {
        throw new Error(resp?.message || "Failed to create credentials");
      }
    } catch (e: any) {
      showToast({
        message: e?.message || "Failed to create credentials",
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  /** UI */
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Credentials
        </h1>
        <p className="text-gray-600">
          Generate secure credentials for{" "}
          {userRole === "platform" ? "clients and vendors" : "vendors"}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "create", label: "Create New", icon: Plus },
            { id: "manage", label: "Manage Users", icon: UserCheck },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === t.id
                ? "border-emerald-900 text-emerald-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <t.icon className="w-4 h-4 mr-2" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "create" && (
        <div className="grid grid-cols-1 gap-8">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border p-6"
            >
              <div className="flex items-center mb-6">
                <div className="p-2 bg-emerald-900 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Information
                  </h2>
                  <p className="text-gray-600">
                    Enter details to create credentials
                  </p>
                </div>
              </div>

              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900" />
                  <span className="ml-3 text-gray-600">Loading data…</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    {/* Tenant pickers */}
                    {userRole === "platform" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tenant Name
                        </label>
                        <Dropdown
                          items={tenantOptions}
                          value={formData.tenantId}
                          onChange={(value) => {
                            const selected =
                              clients.find((t) => t.id === value) ||
                              vendors.find((t) => t.id === value);
                            setFormData((prev) => ({
                              ...prev,
                              tenantId: value,
                              organizationName:
                                selected?.organizationName ||
                                selected?.name ||
                                "",
                            }));
                            if (value) fetchRolesForTenant(value);
                          }}
                          placeholder="Select Tenant"
                          Icon={Briefcase}
                          className="w-full"
                          disabled={false}
                        />
                      </div>
                    )}

                    {userRole === "client" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tenant Name *
                        </label>
                        <Dropdown
                          items={vendorOptions}
                          value={formData.tenantId}
                          onChange={(value) => {
                            const selected = vendors.find(
                              (t) => t.id === value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              tenantId: value,
                              organizationName:
                                selected?.organizationName ||
                                selected?.name ||
                                "",
                            }));
                            if (value) fetchRolesForTenant(value);
                          }}
                          placeholder="Select Tenant"
                          Icon={Briefcase}
                          className="w-full"
                          disabled={false}
                        />
                      </div>
                    )}

                    {userRole === "vendor" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={auth?.tenantName || ""}
                            disabled
                            className="pl-10 w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
                            placeholder="Your Organization"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          You can only create credentials for your own
                          organization.
                        </p>
                      </div>
                    )}

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <MultiSelect
                            name="roleIds"
                            options={roleOptions}
                            value={formData.roleIds}
                            onChange={(selected) =>
                              setFormData((prev) => ({
                                ...prev,
                                roleIds: selected,
                              }))
                            }
                            placeholder={
                              isLoadingRoles
                                ? "Loading roles..."
                                : !formData.tenantId && userRole !== "vendor"
                                  ? "Select tenant first"
                                  : "Select Role(s)"
                            }
                            singleSelect={false}
                            disabled={
                              isLoadingRoles ||
                              (!formData.tenantId && userRole !== "vendor")
                            }
                          />
                          {isLoadingRoles && (
                            <Loader className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleModalData((prev) => ({
                              ...prev,
                              tenantId:
                                formData.tenantId ||
                                (auth?.tenantId ? String(auth.tenantId) : ""),
                            }));
                            setRoleModalOpen(true);
                          }}
                          className="px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-900/90"
                          title="Add New Role"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                              name: nameFromEmail(e.target.value),
                            }))
                          }
                          className="pl-10 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-900/70"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-900 text-white px-6 py-2 rounded-lg hover:bg-emerald-900/90 flex items-center disabled:opacity-50"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Create Credentials
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === "manage" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Created Users
            </h2>
            <p className="text-gray-600 mt-1">View accounts you just created</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    User
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Last Login
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {createdCredentials.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center text-white font-semibold">
                          {c.name?.charAt(0) || "U"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {c.name}
                          </div>
                          <div className="text-sm text-gray-500">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {/* Show all selected roles */}
                      {c.roleId
                        ? c.roleId
                          .split(",")
                          .map((roleId) => {
                            const roleObj = roles.find((r) => r.id === roleId);
                            return (
                              <span
                                key={roleId}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-1 ${getRoleBadge(
                                  c.role
                                )}`}
                              >
                                {roleObj?.name || "Role"}
                              </span>
                            );
                          })
                        : (
                          <span className="text-gray-400">—</span>
                        )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {c.lastLogin}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {/* hook up your delete API if/when exposed */}
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete user"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {createdCredentials.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users created yet
                </h3>
                <p className="text-gray-600">
                  Create your first user credentials to get started
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Role Modal */}
      <AnimatePresence>
        {roleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setRoleModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-900 rounded-lg">
                      <UserPlus2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Create New Role
                      </h2>
                      <p className="text-gray-600">
                        Define a new role for the selected tenant
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRoleModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const tId =
                      roleModalData.tenantId ||
                      formData.tenantId ||
                      (auth?.tenantId ? String(auth.tenantId) : "");
                    createRole({ name: roleModalData.name, tenantId: tId });
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={roleModalData.name}
                        onChange={(e) =>
                          setRoleModalData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-900/70"
                        placeholder="e.g., Vendor IT Team"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tenant *
                      </label>
                      <select
                        value={
                          roleModalData.tenantId ||
                          formData.tenantId ||
                          (auth?.tenantId ? String(auth.tenantId) : "")
                        }
                        onChange={(e) =>
                          setRoleModalData((p) => ({
                            ...p,
                            tenantId: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {tenantOptions.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setRoleModalOpen(false)}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoadingRoles}
                      className="px-6 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-900/90 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoadingRoles ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Create Role
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCredentials;
