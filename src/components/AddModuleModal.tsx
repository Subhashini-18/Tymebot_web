import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Boxes, Save, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type ModulePayload = {
  moduleName: string;
  isTechModule: boolean;
  isActive: boolean;
  mediaLink?: string | null;
};

export default function AddModuleModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: ModulePayload) => Promise<unknown> | unknown;
}) {
  const { showToast } = useToast();

  const [moduleName, setModuleName] = useState("");
  const [isTechModule, setIsTechModule] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [mediaLink, setMediaLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setModuleName("");
    setIsTechModule(false);
    setIsActive(true);
    setMediaLink("");
    setSubmitting(false);
  }, [open]);

  const validate = () => {
    if (!moduleName.trim()) {
      showToast({ type: "error", message: "Module Name is required" });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload: ModulePayload = {
      moduleName: moduleName.trim(),
      isTechModule,
      isActive,
      mediaLink: mediaLink.trim() || null,
    };
    try {
      setSubmitting(true);
      await Promise.resolve(onCreate(payload));
      showToast({ type: "success", message: "Module created" });
      onClose();
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to create module",
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
                  <Boxes className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Module
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
                  Module Name *
                </label>
                <input
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g., Third-Party Risk"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isTechModule}
                    onChange={(e) => setIsTechModule(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
                  />
                  Technical Module
                </label>

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

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Tip
                </div>
                Modules are logical groupings (e.g., <b>Risk</b>,{" "}
                <b>Compliance</b>). Map Menus later in the Mapping tab.
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
                    Create Module
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
