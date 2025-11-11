import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PanelsTopLeft, Save, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type RawMenu = any;

type MenuPayload = {
  menuName: string;
  parentId: number | null;
  menuLevel: number;
  menuRoute?: string | null;
  menuLink?: string | null;
  menuIcon?: string | null;
  menuSortOrder?: number | null;
  isActive: boolean;
  mediaLink?: string | null;
};

function toMenuId(m: RawMenu): number {
  return Number(m?.menuId ?? m?.id);
}
function toMenuName(m: RawMenu): string {
  return m?.menuName ?? m?.menu_name ?? m?.name ?? `Menu #${toMenuId(m)}`;
}
function toMenuLevel(m: RawMenu): number | undefined {
  return Number(m?.menuLevel ?? m?.menu_level ?? NaN);
}
function toMenuSort(m: RawMenu): number | undefined {
  const v = Number(m?.menuSortOrder ?? m?.menu_sortorder ?? NaN);
  return Number.isFinite(v) ? v : undefined;
}

export default function AddMenuModal({
  open,
  menus,
  onClose,
  onCreate,
}: {
  open: boolean;
  menus: RawMenu[];
  onClose: () => void;
  onCreate: (payload: MenuPayload) => Promise<unknown> | unknown;
}) {
  const { showToast } = useToast();
  const [menuName, setMenuName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [menuRoute, setMenuRoute] = useState("");
  const [menuLink, setMenuLink] = useState("");
  const [menuIcon, setMenuIcon] = useState("");
  const [menuSortOrder, setMenuSortOrder] = useState<string>("");
  const [mediaLink, setMediaLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const defaultSort = useMemo(() => {
    const sorts = (menus ?? [])
      .map(toMenuSort)
      .filter((x): x is number => Number.isFinite(x));
    if (!sorts.length) return 10;
    const max = Math.max(...sorts);
    return Math.ceil((max + 1) / 10) * 10 || max + 1;
  }, [menus]);

  useEffect(() => {
    if (!open) return;
    setMenuName("");
    setParentId("");
    setMenuRoute("");
    setMenuLink("");
    setMenuIcon("");
    setMenuSortOrder(String(defaultSort));
    setMediaLink("");
    setIsActive(true);
    setSubmitting(false);
  }, [open, defaultSort]);

  const selectedParent = useMemo(
    () =>
      parentId
        ? (menus ?? []).find((m) => toMenuId(m) === Number(parentId))
        : undefined,
    [parentId, menus]
  );

  const menuLevel = useMemo(() => {
    const pLvl = selectedParent ? toMenuLevel(selectedParent) : undefined;
    return Number.isFinite(pLvl) ? Number(pLvl) + 1 : 1;
  }, [selectedParent]);

  const validate = () => {
    const miss: string[] = [];
    if (!menuName.trim()) miss.push("Menu Name");
    const so = Number(menuSortOrder);
    if (!Number.isFinite(so) || so < 0) miss.push("Valid Sort Order");
    if (miss.length) {
      showToast({ type: "error", message: `Please fill: ${miss.join(", ")}` });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    const payload: MenuPayload = {
      menuName: menuName.trim(),
      parentId: parentId ? Number(parentId) : null,
      menuLevel: menuLevel,
      menuRoute: menuRoute.trim() || null,
      menuLink: menuLink.trim() || null,
      menuIcon: menuIcon.trim() || null,
      menuSortOrder: Number(menuSortOrder),
      isActive,
      mediaLink: mediaLink.trim() || null,
    };

    try {
      setSubmitting(true);
      await Promise.resolve(onCreate(payload));
      showToast({ type: "success", message: "Menu created" });
      onClose();
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to create menu",
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
            className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <PanelsTopLeft className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Menu
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

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Menu Name *
                </label>
                <input
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="e.g., Vendor Reports"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Parent Menu
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">(No parent – top level)</option>
                  {(menus ?? []).map((m) => (
                    <option key={toMenuId(m)} value={toMenuId(m)}>
                      {toMenuName(m)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Level will be set to {menuLevel} based on parent.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Sort Order *
                </label>
                <input
                  type="number"
                  value={menuSortOrder}
                  onChange={(e) => setMenuSortOrder(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder={String(defaultSort)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Suggested: {defaultSort}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Route
                </label>
                <input
                  value={menuRoute}
                  onChange={(e) => setMenuRoute(e.target.value)}
                  placeholder="/reports/vendor"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  External Link
                </label>
                <input
                  value={menuLink}
                  onChange={(e) => setMenuLink(e.target.value)}
                  placeholder="https://docs.example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <input
                  value={menuIcon}
                  onChange={(e) => setMenuIcon(e.target.value)}
                  placeholder="HelpCircle"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
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

              <div className="md:col-span-2">
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

              <div className="md:col-span-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Tip
                </div>
                Define a hierarchy by setting a parent; the level will be
                auto-calculated.
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
                    Create Menu
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
