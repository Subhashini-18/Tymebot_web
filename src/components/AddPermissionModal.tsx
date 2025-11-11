import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type PermissionPayload = {
  permissionName: string;
  isActive: boolean;
  mediaLink?: string | null;
};

export default function AddPermissionModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: PermissionPayload) => Promise<unknown> | unknown;
}) {
  const { showToast } = useToast();
  const [permissionName, setPermissionName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mediaLink, setMediaLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPermissionName("");
    setIsActive(true);
    setMediaLink("");
    setSubmitting(false);
  }, [open]);

  const validate = () => {
    if (!permissionName.trim()) {
      showToast({ type: "error", message: "Permission Name is required" });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    const payload: PermissionPayload = {
      permissionName: permissionName.trim(),
      isActive,
      mediaLink: mediaLink.trim() || null,
    };

    try {
      setSubmitting(true);
      await Promise.resolve(onCreate(payload));
      showToast({ type: "success", message: "Permission created" });
      onClose();
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to create permission",
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
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <KeyRound className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Permission
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
                  Permission Name *
                </label>
                <input
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value)}
                  placeholder="e.g., Risk Reports"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
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

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
                />
                Active
              </label>
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
                    Create Permission
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
