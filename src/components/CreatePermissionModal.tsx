import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Save, X, Loader2 as Loader } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { apiService } from "@/services/api/apiservice";

const IDAM_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const IDAM_PORT = parseInt(import.meta.env.VITE_BASE_IDAM_PORT || "8080", 10);

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePermissionModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [permissionName, setPermissionName] = useState("");
  const [mediaLink, setMediaLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPermissionName("");
    setMediaLink("");
    setIsActive(true);
  }, [open]);

  const createPermission = async () => {
    if (!permissionName.trim()) {
      showToast({ message: "Permission name is required", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      // This expects your backend route to call tyme_iam.create_permission(jsonb)
      const payload: any = {
        permissionName: permissionName.trim(),
        mediaLink: mediaLink.trim() || null,
        isActive: !!isActive,
      };
      const resp: any = await apiService.post(
        `${IDAM_PATH}create_permission`,
        payload,
        IDAM_PORT
      );
      if (resp?.status === "success" || resp?.isSuccess) {
        showToast({ message: "Permission created", type: "success" });
        onSuccess();
      } else {
        // If route isn't wired yet, surface a helpful message
        throw new Error(
          resp?.message ||
          "Route /create_permission not available. Please expose tyme_iam.create_permission(jsonb)."
        );
      }
    } catch (e: any) {
      showToast({
        message: e?.message || "Failed to create permission",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-900" />
                Add Permission
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Name *
                </label>
                <input
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value)}
                  placeholder="e.g., Risk Analysis"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-900/70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Link (optional)
                </label>
                <input
                  value={mediaLink}
                  onChange={(e) => setMediaLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-900/70"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-900 focus:ring-emerald-900"
                />
                Active
              </label>
            </div>

            <div className="p-5 border-t flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPermission}
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-emerald-900 text-white hover:bg-emerald-900/90 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePermissionModal;
