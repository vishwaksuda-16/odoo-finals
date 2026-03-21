import { useState } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function ECOStages() {
  const { stages, approvals, addApproval, removeApproval } = useData();
  const { users } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", approvalType: "Required" });

  const handleAdd = () => {
    if (!form.userId) return;
    const user = users.find((u) => u.id === form.userId);
    addApproval({
      userId: form.userId,
      userName: user?.name || user?.email || "",
      approvalType: form.approvalType,
      stageId: "s2", // Approval stage
    });
    setForm({ userId: "", approvalType: "Required" });
    setShowForm(false);
  };

  // Build the ECO stage list with approval info
  const stageRows = stages.map((s) => ({
    ...s,
    status: s.name === "Done" ? "Done" : "Not Done",
    approverCount: approvals.filter((a) => a.stageId === s.id || (s.name === "Approval" && a.stageId === "s2")).length,
  }));

  const stageColumns = [
    { key: "name", label: "Name", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          val === "Done" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}>{val}</span>
      ),
    },
    { key: "order", label: "Order", render: (val) => <span className="text-surface-500">Step {val}</span> },
  ];

  const approvalColumns = [
    { key: "userName", label: "User", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
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
          onClick={() => removeApproval(row.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
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
        {/* Stages Table */}
        <div>
          <h3 className="text-lg font-bold text-surface-900 mb-4">Stage Configuration</h3>
          <DataTable columns={stageColumns} data={stageRows} emptyMessage="No stages defined." />
        </div>

        {/* Approvals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Approval Configuration</h3>
              <p className="text-sm text-surface-500 mt-1">
                <span className="font-semibold text-red-600">Required</span> = must approve.{" "}
                <span className="font-semibold text-blue-600">Optional</span> = ECO can proceed without it.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-primary-200 p-5 mb-4 shadow-sm">
              <h4 className="font-semibold text-surface-800 mb-4">Add Approval Rule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">User</label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-1.5">Approval Category</label>
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
                    onClick={handleAdd}
                    disabled={!form.userId}
                    className="px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
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