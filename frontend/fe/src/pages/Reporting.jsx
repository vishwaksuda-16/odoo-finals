import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";

export default function Reporting() {
  const { ecos } = useData();
  const navigate = useNavigate();

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
      <DataTable
        columns={columns}
        data={ecos}
        onRowClick={(eco) => navigate(`/ecos/${eco.id}`)}
        emptyMessage="No ECO reports available."
      />
    </Layout>
  );
}