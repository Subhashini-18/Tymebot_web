import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Plus, Trash2, User } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import FormField from "./ui/form/FormField";
import Checkbox from "./ui/Checkbox";

// Types
interface ChildCompany {
    childId: string; // auto-generated external id
    entityName: string;
    operatingLocation: string;
}

interface ClientProfileForm {
    legalName: string;
    clientId: string;
    status: "Active" | "Inactive" | "Suspended";
    baseLocation: string;
    subscriptionType: "Basic" | "Pro" | "Enterprise";
    isParentChildType: boolean;
    children: ChildCompany[];
}

const generateClientId = () => `CLNT-${Date.now().toString().slice(-8)}`;
const generateChildId = () => `CH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Load initial data from localStorage authData if present
    const authData = useMemo(() => {
        try {
            const raw = localStorage.getItem("authData");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);
    console.log(authData)
    const [logoUrl, setLogoUrl] = useState<string | null>(authData?.clientLogoUrl || null);

    const methods = useForm<ClientProfileForm>({
        defaultValues: {
            legalName: authData?.clientName || authData?.name || "",
            clientId: authData?.clientId || generateClientId(),
            status: "Active",
            baseLocation: "",
            subscriptionType: "Basic",
            isParentChildType: false,
            children: [],
        },
        mode: "onBlur",
    });

    const { control, watch, handleSubmit } = methods;
    const { fields, append, remove } = useFieldArray({ control, name: "children" });

    const isParentChildType = watch("isParentChildType");

    const onSave = (data: ClientProfileForm) => {
        // Minimal persistence: update authData with legalName and clientId
        try {
            const raw = localStorage.getItem("authData");
            const existing = raw ? JSON.parse(raw) : {};
            const updated = {
                ...existing,
                clientName: data.legalName || existing.clientName,
                clientId: data.clientId || existing.clientId,
            };
            localStorage.setItem("authData", JSON.stringify(updated));
            showToast({ message: "Profile saved", type: "success" });
            navigate("/dashboard");
        } catch (e: any) {
            showToast({ message: e?.message || "Failed to save profile", type: "error" });
        }
    };

    const addChild = () => {
        append({ childId: generateChildId(), entityName: "", operatingLocation: "" });
    };

    return (
        <div className="min-h-screen w-full mx-auto bg-gradient-to-br from-gray-50 to-white">
            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 sm:px-6 py-3 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 gap-2"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSubmit(onSave)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#01443B] text-white px-4 py-2 hover:bg-[#013a33] shadow"
                    >
                        <Check className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            <FormProvider {...methods}>
                <form className="px-4 sm:px-6 py-6" onSubmit={handleSubmit(onSave)}>
                    <div className="mx-auto max-w-6xl">
                        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-[#01443B] to-[#09B591] p-6 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-2 ring-white/30">
                                        {logoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={logoUrl}
                                                alt="Logo"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                                    setLogoUrl(null);
                                                }}
                                            />
                                        ) : (
                                            <User className="h-7 w-7" />
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex justify-between">
                                            <h1 className="text-xl sm:text-2xl font-semibold">{authData?.roleName?.toUpperCase()}</h1>
                                            <span className="text-md font-bold">{authData?.name}</span>
                                        </div>
                                        <p className="text-white/80 text-sm">Manage your organization details and hierarchy</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form body */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                    label="Legal Name"
                                    name="legalName"
                                    placeholder="Acme Corp Pvt Ltd"
                                    required
                                />

                                <FormField
                                    label="Client ID"
                                    name="clientId"
                                    inputProps={{ disabled: true }}
                                />
                                {/* <p className="text-xs text-gray-500 -mt-3">Auto-generated and unique</p> */}

                                <FormField
                                    label="Status"
                                    name="status"
                                    type="select"
                                    options={[
                                        { label: "Active", value: "Active" },
                                        { label: "Inactive", value: "Inactive" },
                                        { label: "Suspended", value: "Suspended" },
                                    ]}
                                />

                                <FormField
                                    label="Base Location"
                                    name="baseLocation"
                                    placeholder="Bengaluru, IN"
                                />

                                <FormField
                                    label="Subscription Type"
                                    name="subscriptionType"
                                    type="select"
                                    options={[
                                        { label: "Basic", value: "Basic" },
                                        { label: "Pro", value: "Pro" },
                                        { label: "Enterprise", value: "Enterprise" },
                                    ]}
                                />

                                <div>
                                    <Checkbox name="isParentChildType" label="Is Parent/Child Type?" />
                                </div>
                            </div>

                            {/* Child Companies Section */}
                            {isParentChildType && (
                                <div className="px-6 pb-6">
                                    <div className="rounded-xl border bg-white">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900">Child Companies</h3>
                                                <p className="text-sm text-gray-500">Add one or more subsidiaries</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addChild}
                                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700"
                                            >
                                                <Plus className="h-4 w-4" /> Add Child Company
                                            </button>
                                        </div>

                                        {fields.length === 0 ? (
                                            <div className="p-6 text-sm text-gray-500">No child companies added yet.</div>
                                        ) : (
                                            <div className="divide-y">
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                                        <div className="md:col-span-3">
                                                            <FormField
                                                                label="Child ID"
                                                                name={`children.${index}.childId`}
                                                                inputProps={{ disabled: true }}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-4">
                                                            <FormField
                                                                label="Entity Name"
                                                                name={`children.${index}.entityName`}
                                                                placeholder="Subsidiary Pvt Ltd"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-4">
                                                            <FormField
                                                                label="Operating Location"
                                                                name={`children.${index}.operatingLocation`}
                                                                placeholder="Singapore"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-1 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="inline-flex items-center justify-center rounded-lg border px-2 py-2 text-red-600 hover:bg-red-50"
                                                                aria-label="Remove child company"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default ProfileScreen;