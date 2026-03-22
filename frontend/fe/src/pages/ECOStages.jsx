import { useState, useMemo } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

const PIPELINE_OPTIONS = [
  { value: "NONE", label: "Custom (no auto count)" },
  { value: "DRAFT_SET", label: "Draft & rejected (DRAFT + REJECTED)" },
  { value: "NEW", label: "In progress (NEW)" },
  { value: "PENDING", label: "Awaiting approval (PENDING)" },
  { value: "TERMINAL", label: "Completed (APPROVED)" },
];

export default function ECOStages() {
  const { stages, products, approvals, addApproval, removeApproval, addStage, removeStage } = useData();
  const { users } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", approvalType: "Required", stageId: "", productId: "" });
  const [newStage, setNewStage] = useState({ name: "", pipelineKind: "NONE" });
  const [busy, setBusy] = useState(false);

  const defaultApprovalStageId = useMemo(() => {
    const byKind = stages.find((s) => s.pipelineKind === "PENDING");
    return byKind?.id || stages[0]?.id || "";
  }, [stages]);

  const handleAddRule = async () => {
    if (!form.userId || !form.stageId) return;
    setBusy(true);
    try {
      await addApproval({
        userId: form.userId,
        approvalType: form.approvalType,
        stageId: form.stageId,
        productId: form.productId || undefined,
      });
      setForm({ userId: "", approvalType: "Required", stageId: defaultApprovalStageId, productId: "" });
      setShowForm(false);
    } catch (e) {
      window.alert(e?.message || "Could not add rule");
    } finally {
      setBusy(false);
    }
  };

  const handleAddStage = async () => {
    if (!newStage.name.trim()) return;
    setBusy(true);
    try {
      await addStage({
        name: newStage.name.trim(),
        order: (stages?.length || 0) + 1,
        pipelineKind: newStage.pipelineKind,
      });
      setNewStage({ name: "", pipelineKind: "NONE" });
    } catch (e) {
      window.alert(e?.message || "Could not add stage");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStage = async (row) => {
    if (!window.confirm(`Delete stage "${row.name}"? Approval rules on this stage will be removed.`)) return;
    setBusy(true);
    try {
      await removeStage(row.id);
    } catch (e) {
      window.alert(e?.message || "Could not delete stage");
    } finally {
      setBusy(false);
    }
  };

  const stageColumns = [
    { key: "name", label: "Name", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    {
      key: "pipelineKind",
      label: "Maps to",
      render: (val) => (
        <span className="text-xs text-surface-600 font-mono">{val || "—"}</span>
      ),
    },
    {
      key: "ecoCount",
      label: "Live ECOs",
      render: (val) => (
        <span className="font-semibold tabular-nums text-surface-800">{typeof val === "number" ? val : 0}</span>
      ),
    },
    { key: "order", label: "Order", render: (val) => <span className="text-surface-500">Step {val}</span> },
    {
      key: "approverCount",
      label: "Approvers",
      render: (val) => (
        <span className="text-surface-700 tabular-nums">{typeof val === "number" ? val : 0}</span>
      ),
    },
    {
      key: "id",
      label: "",
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleDeleteStage(row)}
          disabled={busy}
          className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Delete stage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      ),
    },
  ];

  const approvalColumns = [
    { key: "stageName", label: "Stage", render: (val) => <span className="text-surface-700">{val}</span> },
    {
      key: "productName",
      label: "Product / scope",
      render: (val) => (
        <span className={`text-sm ${val === "All products" ? "text-surface-500 italic" : "font-medium text-surface-800"}`}>
          {val}
        </span>
      ),
    },
    { key: "userName", label: "Approver", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    {
      key: "approvalType",
      label: "Approval Category",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          val === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        }`}>{val}</span>
      ),
    },
    {
      key: "id",
      label: "",
      render: (_, row) => (
        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            try {
              await removeApproval(row.id);
            } catch (e) {
              window.alert(e?.message || "Could not remove rule");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Remove"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      ),
    },
  ];

  return (
    <Layout title="ECO Stages">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-surface-900 mb-4">Stage configuration</h3>
          <p className="text-sm text-surface-500 mb-4">
            Stages are stored in the database. <span className="font-medium text-surface-700">Live ECOs</span> counts
            ECO records by status for each pipeline mapping (see Maps to).
          </p>
          <DataTable columns={stageColumns} data={stages} emptyMessage="No stages defined. Run seed or add a stage below." />
        </div>

        <div className="bg-surface-50 rounded-xl border border-surface-200 p-5">
          <h4 className="font-semibold text-surface-800 mb-3">Add workflow stage</h4>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[180px] flex-1">
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Name</label>
              <input
                type="text"
                value={newStage.name}
                onChange={(e) => setNewStage((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Review"
                className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
              />
            </div>
            <div className="min-w-[220px] flex-1">
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Pipeline mapping</label>
              <select
                value={newStage.pipelineKind}
                onChange={(e) => setNewStage((p) => ({ ...p, pipelineKind: e.target.value }))}
                className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
              >
                {PIPELINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddStage}
              disabled={busy || !newStage.name.trim()}
              className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 hover:bg-primary-700 transition-colors"
            >
              Add stage
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Approval configuration</h3>
              <p className="text-sm text-surface-500 mt-1">
                Pick a <span className="font-medium text-surface-700">product</span> or <em>All products</em>.{" "}
                <span className="font-semibold text-red-600">Required</span> /{" "}
                <span className="font-semibold text-blue-600">Optional</span> as above.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm);
                setForm((f) => ({ ...f, stageId: f.stageId || defaultApprovalStageId }));
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl border border-primary-200 p-5 mb-4 shadow-sm">
              <h4 className="font-semibold text-surface-800 mb-4">Add approval rule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Stage</label>
                  <select
                    value={form.stageId || defaultApprovalStageId}
                    onChange={(e) => setForm((prev) => ({ ...prev, stageId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Product</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    <option value="">All products</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">User</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    <option value="">Select user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Approval category</label>
                  <select
                    value={form.approvalType}
                    onChange={(e) => setForm((prev) => ({ ...prev, approvalType: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    <option>Required</option>
                    <option>Optional</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleAddRule}
                    disabled={!form.userId || !form.stageId || busy}
                    className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 text-surface-600 hover:bg-surface-100 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <DataTable columns={approvalColumns} data={approvals} emptyMessage="No approval rules configured." />
        </div>
      </div>
    </Layout>
  );
}
