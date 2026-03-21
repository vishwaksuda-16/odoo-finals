import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import KanbanCard from "../components/KanbanCard";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

const listIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const kanbanIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;

const stageBadge = (stage) => {
  const map = {
    Draft: "bg-surface-100 text-surface-600",
    New: "bg-blue-100 text-blue-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Approval: "bg-amber-100 text-amber-700",
    Pending: "bg-amber-100 text-amber-700",
    Done: "bg-emerald-100 text-emerald-700",
    Approved: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[stage] || map.Draft}`}>{stage}</span>;
};

export default function Dashboard() {
  const { ecos } = useData();
  const { canCreate } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");

  const filtered = ecos.filter((eco) => {
    const q = search.toLowerCase();
    return (
      eco.title.toLowerCase().includes(q) ||
      eco.productName.toLowerCase().includes(q) ||
      eco.stage.toLowerCase().includes(q) ||
      eco.ecoType.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: "title", label: "Name (ECO Title)", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    { key: "ecoType", label: "ECO Type", render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${val === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>{val}</span>
    )},
    { key: "productName", label: "Product" },
    { key: "stage", label: "Stage", render: (val) => stageBadge(val) },
    { key: "status", label: "Status", render: (val) => stageBadge(val) },
  ];

  return (
    <Layout title="PLM Sentry Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total ECOs", value: ecos.length, color: "from-primary-500 to-primary-600", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg> },
          { label: "In Progress", value: ecos.filter((e) => e.stage === "New" || e.stage === "Approval").length, color: "from-amber-500 to-orange-500", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
          { label: "Approved", value: ecos.filter((e) => e.status === "Approved").length, color: "from-emerald-500 to-green-600", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Draft", value: ecos.filter((e) => e.stage === "Draft").length, color: "from-surface-500 to-surface-600", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {canCreate && (
          <button
            onClick={() => navigate("/ecos/create")}
            id="new-eco-button"
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New
          </button>
        )}

        <div className="flex items-center gap-3 flex-1 justify-center max-w-md w-full">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              id="search-ecos"
              placeholder="Search by reference, product, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center bg-surface-100 rounded-xl p-1">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === "list" ? "bg-white shadow text-surface-800" : "text-surface-500 hover:text-surface-700"}`}
            id="list-view-button"
          >
            {listIcon}
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === "kanban" ? "bg-white shadow text-surface-800" : "text-surface-500 hover:text-surface-700"}`}
            id="kanban-view-button"
          >
            {kanbanIcon}
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "list" ? (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(eco) => navigate(`/ecos/${eco.id}`)}
          emptyMessage="No ECOs found. Create your first Engineering Change Order."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-surface-500">No ECOs found</div>
          ) : (
            filtered.map((eco) => (
              <KanbanCard
                key={eco.id}
                title={eco.title}
                subtitle={eco.ecoType}
                status={eco.stage}
                fields={[
                  { label: "Product", value: eco.productName },
                  { label: "Status", value: eco.status },
                  { label: "Created", value: eco.createdAt },
                ]}
                onClick={() => navigate(`/ecos/${eco.id}`)}
              />
            ))
          )}
        </div>
      )}
    </Layout>
  );
}