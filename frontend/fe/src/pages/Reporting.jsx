import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import api from "../services/api";

export default function Reporting() {
  const { ecos } = useData();
  const navigate = useNavigate();
  const [approverStats, setApproverStats] = useState({ approvers: [], totals: { approved: 0, rejected: 0 } });

  useEffect(() => {
    api.reports.approverStats()
      .then((data) => setApproverStats(data))
      .catch(() => setApproverStats({ approvers: [], totals: { approved: 0, rejected: 0 } }));
  }, []);

  const columns = [
    { key: "title", label: "ECO Title", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    {
      key: "ecoType",
      label: "ECO Type",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          val === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"
        }`}>{val}</span>
      ),
    },
    { key: "productName", label: "Product" },
    {
      key: "id",
      label: "Changes",
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/changes/${row.id}`); }}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Changes
        </button>
      ),
    },
    {
      key: "stage",
      label: "Stage",
      render: (val) => {
        const map = {
          Draft: "bg-surface-100 text-surface-600",
          New: "bg-blue-100 text-blue-700",
          Approval: "bg-amber-100 text-amber-700",
          Done: "bg-emerald-100 text-emerald-700",
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[val] || map.Draft}`}>{val}</span>;
      },
    },
  ];

  return (
    <Layout title="ECO Reports">
      <div className="mb-6">
        <p className="text-surface-500 text-sm">View all Engineering Change Orders and their associated changes.</p>
      </div>

      {approverStats.approvers.length > 0 && (
        <div className="mb-6 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50">
            <h3 className="font-bold text-surface-900">Approver Statistics</h3>
            <p className="text-sm text-surface-500 mt-1">Approved and rejected counts by approver</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-600 uppercase">Total Approved</p>
                <p className="text-2xl font-bold text-emerald-700">{approverStats.totals.approved}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-xs font-semibold text-red-600 uppercase">Total Rejected</p>
                <p className="text-2xl font-bold text-red-700">{approverStats.totals.rejected}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-2 font-semibold text-surface-700">Approver</th>
                    <th className="text-left py-2 font-semibold text-surface-700">Email</th>
                    <th className="text-right py-2 font-semibold text-emerald-700">Approved</th>
                    <th className="text-right py-2 font-semibold text-red-700">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {approverStats.approvers.map((a) => (
                    <tr key={a.userId} className="border-b border-surface-100 hover:bg-surface-50">
                      <td className="py-2">{a.name}</td>
                      <td className="py-2 text-surface-500">{a.email}</td>
                      <td className="py-2 text-right font-medium text-emerald-600">{a.approved}</td>
                      <td className="py-2 text-right font-medium text-red-600">{a.rejected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={ecos}
        onRowClick={(eco) => navigate(`/ecos/${eco.id}`)}
        emptyMessage="No ECO reports available."
      />
    </Layout>
  );
}