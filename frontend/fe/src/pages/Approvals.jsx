import { useState, useMemo } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function Approvals() {
  const { approvals, stages, products, addApproval, removeApproval } = useData();
  const { users } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", approvalType: "Required", stageId: "", productId: "" });
  const [busy, setBusy] = useState(false);

  const defaultApprovalStageId = useMemo(() => {
    const byKind = stages.find((s) => s.pipelineKind === "PENDING");
    return byKind?.id || stages[0]?.id || "";
  }, [stages]);

  const handleAdd = async () => {
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

  const columns = [
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
      label: "Approval type",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          val === "Required" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        }`}>{val}</span>
      ),
    },
    {
      key: "id",
      label: "Actions",
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
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <Layout title="Approvals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-surface-500 text-sm">
              Assign approvers per <span className="font-medium text-surface-700">stage</span> and{" "}
              <span className="font-medium text-surface-700">product</span>. Use <em>All products</em> for a global rule.
              Engineers and approvers see these assignments on each ECO.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-surface-600 font-medium">Required — Must approve for ECO to proceed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-surface-600 font-medium">Optional — ECO can proceed without approval</span>
              </div>
            </div>
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
          <div className="bg-white rounded-xl border border-primary-200 p-5 shadow-sm">
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
                    <option key={u.id} value={u.id}>{u.name || u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 mb-1.5">Approval type</label>
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
                  onClick={handleAdd}
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

        <DataTable columns={columns} data={approvals} emptyMessage="No approval configurations yet." />
      </div>
    </Layout>
  );
}
