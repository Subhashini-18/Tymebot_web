import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  ReactFlowProvider,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { Settings, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { getAuthData } from "@/utils/auth";
import { apiService } from "@/services/api/apiservice";

/** Env + endpoints */
const TRACS_API = import.meta.env.VITE_API_PATH || "/api/tyme/tracs/v1/";
const TRACS_PORT = import.meta.env.VITE_BASE_PORT || 8082;
const EP_BLUEPRINT = `${TRACS_API}get_client_workflow_blueprint`;
const EP_SAVE = `${TRACS_API}save_client_workflow`;
const EP_RESET = `${TRACS_API}reset_client_workflow_to_default`;

/** Types */
type StatusDTO = {
  workflow_status_id: number;
  status_code: string;
  status_name: string;
  custom_status_name: string | null;
  default_order: number;
  is_terminal: boolean;
  is_enabled: boolean;
  target_sla_minutes: number | null;
};

type StageDTO = {
  workflow_stage_id: number;
  stage_code: string;
  stage_name: string;
  custom_stage_name: string | null;
  default_order: number;
  execution_order: number;
  is_enabled: boolean;
  statuses: StatusDTO[];
};

type BlueprintDTO = {
  client_org_info_id: number;
  stages: StageDTO[];
};

const style = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
`;

/** Node renderer */
function StageCard({ data }: any) {
  const { stage, onToggle, onName, onOpenStatuses } = data as {
    stage: StageDTO;
    onToggle: (id: number, enabled: boolean) => void;
    onName: (id: number, name: string) => void;
    onOpenStatuses: (stage: StageDTO) => void;
  };

  return (
    <div
      className={`rounded-2xl border border-white/30 shadow-xl bg-white/90 backdrop-blur p-4 w-[260px] ${stage.is_enabled ? "" : "opacity-60"
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
          {stage.stage_code.toUpperCase()}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-gray-600">Enabled</span>
          <input
            type="checkbox"
            checked={stage.is_enabled}
            onChange={(e) =>
              onToggle(stage.workflow_stage_id, e.target.checked)
            }
            className="w-4 h-4 accent-[#01443B]"
          />
        </label>
      </div>

      <input
        className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
        placeholder={stage.stage_name}
        value={stage.custom_stage_name || ""}
        onChange={(e) => onName(stage.workflow_stage_id, e.target.value)}
      />

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onOpenStatuses(stage)}
          className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
          title="Edit statuses"
        >
          <Settings size={14} /> Statuses (
          {stage.statuses?.filter((s) => s.is_enabled).length ?? 0})
        </button>
        <div className="text-[10px] text-gray-500">
          Order: <span className="font-semibold">{stage.execution_order}</span>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { stageCard: StageCard };

export default function ClientWorkflowEditor() {
  const authData = getAuthData();
  const clientId = authData.clientId;
  const { showToast } = useToast();

  const [bp, setBp] = React.useState<BlueprintDTO | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [statusPanelOpen, setStatusPanelOpen] = React.useState(false);
  const [activeStage, setActiveStage] = React.useState<StageDTO | null>(null);

  const [rf, setRf] = React.useState<ReactFlowInstance | null>(null);

  /** Build edges based on enabled & order */
  const rebuildEdges = React.useCallback(
    (stages: StageDTO[]) => {
      const enabled = [...stages]
        .filter((s) => s.is_enabled)
        .sort((a, b) => a.execution_order - b.execution_order);
      const newEdges: Edge[] = [];
      for (let i = 0; i < enabled.length - 1; i++) {
        const a = enabled[i],
          b = enabled[i + 1];
        newEdges.push({
          id: `e-${a.workflow_stage_id}-${b.workflow_stage_id}`,
          source: `s-${a.workflow_stage_id}`,
          target: `s-${b.workflow_stage_id}`,
          type: "smoothstep",
          animated: true,
        });
      }
      setEdges(newEdges);
    },
    [setEdges]
  );

  /** Build nodes from stages; horizontal layout based on execution_order */
  const stagesToNodes = React.useCallback(
    (stages: StageDTO[]) => {
      const spacingX = 320;
      const y = 120;
      const newNodes: Node[] = stages.map((s) => ({
        id: `s-${s.workflow_stage_id}`,
        type: "stageCard",
        position: { x: (s.execution_order - 1) * spacingX, y },
        data: {
          stage: s,
          onToggle: (id: number, enabled: boolean) => {
            setBp((prev) => {
              if (!prev) return prev;
              const ns = prev.stages.map((st) =>
                st.workflow_stage_id === id
                  ? { ...st, is_enabled: enabled }
                  : st
              );
              const bp2 = { ...prev, stages: ns };
              rebuildEdges(ns);
              return bp2;
            });
          },
          onName: (id: number, name: string) => {
            setBp((prev) => {
              if (!prev) return prev;
              const ns = prev.stages.map((st) =>
                st.workflow_stage_id === id
                  ? { ...st, custom_stage_name: name }
                  : st
              );
              return { ...prev, stages: ns };
            });
          },
          onOpenStatuses: (stage: StageDTO) => {
            setActiveStage(stage);
            setStatusPanelOpen(true);
          },
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.25)" },
      }));
      setNodes(newNodes);
      rebuildEdges(stages);
    },
    [setNodes, rebuildEdges]
  );

  /** Fetch blueprint */
  const load = React.useCallback(async () => {
    try {
      setLoading(true);

      const payload = { client_org_info_id: clientId }; // must match SQL functions
      const resp: any = await apiService.post(
        EP_BLUEPRINT,
        payload,
        TRACS_PORT
      );
      const data: BlueprintDTO = resp?.data?.data || resp?.data || resp;
      setBp(data);
      stagesToNodes(data.stages);
    } catch (e: any) {
      showToast({
        type: "error",
        message: e?.message || "Failed to load workflow",
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, showToast, stagesToNodes]);

  React.useEffect(() => {
    load();
  }, [load]);

  /** After nodes render, fit view WITHOUT animation (prevents d3 .interrupt() issue) */
  React.useEffect(() => {
    if (rf && nodes.length > 0) {
      requestAnimationFrame(() => {
        rf.fitView({ padding: 0.2, duration: 0 });
      });
    }
  }, [rf, nodes.length]);

  /** When nodes are dragged, update execution_order by x-position */
  const onNodeDragStop = React.useCallback(() => {
    setBp((prev) => {
      if (!prev) return prev;
      const orderMap: Record<number, number> = {};
      const sorted = [...nodes].sort((a, b) => a.position.x - b.position.x);
      sorted.forEach((n, idx) => {
        const id = Number(n.id.replace("s-", ""));
        orderMap[id] = idx + 1;
      });
      const updatedStages = prev.stages.map((s) => ({
        ...s,
        execution_order: orderMap[s.workflow_stage_id] ?? s.execution_order,
      }));
      rebuildEdges(updatedStages);
      return { ...prev, stages: updatedStages };
    });
  }, [nodes, rebuildEdges]);

  /** Save */
  const onSave = async () => {
    if (!bp) return;
    try {
      setLoading(true);
      const payload = {
        client_org_info_id: clientId,
        stages: bp.stages.map((s) => ({
          workflow_stage_id: s.workflow_stage_id,
          is_enabled: s.is_enabled,
          execution_order: s.execution_order,
          custom_stage_name: s.custom_stage_name || null,
          statuses:
            s.statuses?.map((st) => ({
              workflow_status_id: st.workflow_status_id,
              is_enabled: st.is_enabled,
              custom_status_name: st.custom_status_name || null,
              target_sla_minutes: st.target_sla_minutes,
            })) || [],
        })),
      };
      const resp: any = await apiService.post(EP_SAVE, payload, TRACS_PORT);
      const ok = resp?.data?.status === "success" || resp?.status === "success";
      if (!ok) throw new Error(resp?.data?.message || "Save failed");
      showToast({ type: "success", message: "Workflow saved" });
      const fresh = resp?.data?.data || resp?.data;
      setBp(fresh);
      stagesToNodes(fresh.stages);
    } catch (e: any) {
      showToast({ type: "error", message: e?.message || "Save failed" });
    } finally {
      setLoading(false);
    }
  };

  /** Reset to defaults */
  const onReset = async () => {
    try {
      setLoading(true);
      const resp: any = await apiService.post(
        EP_RESET,
        { clientOrgInfoId: Number(clientId) },
        TRACS_PORT
      );
      const ok = resp?.data?.status === "success" || resp?.status === "success";
      if (!ok) throw new Error(resp?.data?.message || "Reset failed");
      const fresh = resp?.data?.data || resp?.data;
      setBp(fresh);
      stagesToNodes(fresh.stages);
      showToast({ type: "success", message: "Reset to defaults" });
    } catch (e: any) {
      showToast({ type: "error", message: e?.message || "Reset failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{style}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591] flex overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-white text-2xl font-semibold tracking-tight">
              Client Workflow Editor
            </h1>
            <div className="flex gap-2">
              <button
                onClick={onReset}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
                title="Reset to platform defaults"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#01443B] hover:bg-gray-50"
                title="Save changes"
              >
                <Save size={16} /> {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Canvas Card */}
          <div className="mx-6 mb-6 rounded-2xl bg-white/90 backdrop-blur shadow-2xl border border-white/30 overflow-hidden">
            <div style={{ height: "520px" }}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  onNodeDragStop={onNodeDragStop}
                  onInit={setRf} // capture instance
                  fitView
                  fitViewOptions={{ padding: 0.2, duration: 0 }} // disable animated zoom on mount
                >
                  <Background />
                  <MiniMap />
                  <Controls />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        {statusPanelOpen && activeStage && (
          <div className="absolute right-6 top-24 z-20 w-[380px] rounded-2xl bg-white/95 backdrop-blur border border-white/30 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500">Edit Statuses</div>
                <div className="text-base font-semibold">
                  {activeStage.custom_stage_name || activeStage.stage_name}
                </div>
              </div>
              <button
                onClick={() => setStatusPanelOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {activeStage.statuses?.map((st) => (
                <div
                  key={st.workflow_status_id}
                  className="border rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {st.status_code}
                    </div>
                    <label className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Enabled</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#01443B]"
                        checked={st.is_enabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          // update panel
                          setActiveStage((prev) =>
                            prev
                              ? {
                                ...prev,
                                statuses: prev.statuses.map((s) =>
                                  s.workflow_status_id ===
                                    st.workflow_status_id
                                    ? { ...s, is_enabled: enabled }
                                    : s
                                ),
                              }
                              : prev
                          );
                          // update blueprint
                          setBp((prev) => {
                            if (!prev) return prev;
                            const stageId = activeStage.workflow_stage_id;
                            const ns = prev.stages.map((s) =>
                              s.workflow_stage_id === stageId
                                ? {
                                  ...s,
                                  statuses: s.statuses.map((ss) =>
                                    ss.workflow_status_id ===
                                      st.workflow_status_id
                                      ? { ...ss, is_enabled: enabled }
                                      : ss
                                  ),
                                }
                                : s
                            );
                            return { ...prev, stages: ns };
                          });
                        }}
                      />
                    </label>
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Display Name
                    </label>
                    <input
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                      placeholder={st.status_name}
                      value={st.custom_status_name || ""}
                      onChange={(e) => {
                        const name = e.target.value;
                        setActiveStage((prev) =>
                          prev
                            ? {
                              ...prev,
                              statuses: prev.statuses.map((s) =>
                                s.workflow_status_id === st.workflow_status_id
                                  ? { ...s, custom_status_name: name }
                                  : s
                              ),
                            }
                            : prev
                        );
                        setBp((prev) => {
                          if (!prev) return prev;
                          const stageId = activeStage.workflow_stage_id;
                          const ns = prev.stages.map((s) =>
                            s.workflow_stage_id === stageId
                              ? {
                                ...s,
                                statuses: s.statuses.map((ss) =>
                                  ss.workflow_status_id ===
                                    st.workflow_status_id
                                    ? { ...ss, custom_status_name: name }
                                    : ss
                                ),
                              }
                              : s
                          );
                          return { ...prev, stages: ns };
                        });
                      }}
                    />
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] text-gray-600 mb-1">
                      Target SLA (minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01443B]"
                      value={st.target_sla_minutes ?? ""}
                      onChange={(e) => {
                        const v =
                          e.target.value === "" ? null : Number(e.target.value);
                        setActiveStage((prev) =>
                          prev
                            ? {
                              ...prev,
                              statuses: prev.statuses.map((s) =>
                                s.workflow_status_id === st.workflow_status_id
                                  ? { ...s, target_sla_minutes: v }
                                  : s
                              ),
                            }
                            : prev
                        );
                        setBp((prev) => {
                          if (!prev) return prev;
                          const stageId = activeStage.workflow_stage_id;
                          const ns = prev.stages.map((s) =>
                            s.workflow_stage_id === stageId
                              ? {
                                ...s,
                                statuses: s.statuses.map((ss) =>
                                  ss.workflow_status_id ===
                                    st.workflow_status_id
                                    ? { ...ss, target_sla_minutes: v }
                                    : ss
                                ),
                              }
                              : s
                          );
                          return { ...prev, stages: ns };
                        });
                      }}
                    />
                  </div>

                  {st.is_terminal && (
                    <div className="mt-2 text-[11px] text-rose-600">
                      Terminal status
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
