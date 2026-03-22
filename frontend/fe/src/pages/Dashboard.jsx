import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import KanbanCard from "../components/KanbanCard";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { getMyApproverDutyForEco } from "../utils/approvalRules";

const listIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const kanbanIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;

const stageBadge = (stage) => {
  const map = {
    Draft: "bg-surface-100 text-surface-600",
    Rejected: "bg-red-100 text-red-700",
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
  const { ecos, products, boms, deleteEco, clearEcos, deleteProduct, clearProducts, deleteBom, clearBoms, approvals, stages } = useData();
  const { canCreate, isAdmin, users, user, removeUser, clearUsers } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");

  const isApproverLike = ["APPROVER", "ADMIN"].includes(user?.role);
  const visibleEcos = isAdmin || isApproverLike ? ecos : ecos.filter((eco) => eco.userId === user?.id);

  const filtered = visibleEcos.filter((eco) => {
    const q = search.toLowerCase();
    return (
      eco.title.toLowerCase().includes(q) ||
      eco.productName.toLowerCase().includes(q) ||
      eco.stage.toLowerCase().includes(q) ||
      eco.ecoType.toLowerCase().includes(q)
    );
  });
  const byStatus = {
    Draft: visibleEcos.filter((e) => e.stage === "Draft").length,
    InProgress: visibleEcos.filter((e) => e.stage === "New").length,
    Pending: visibleEcos.filter((e) => e.stage === "Approval").length,
    Approved: visibleEcos.filter((e) => e.status === "Approved").length,
    Rejected: visibleEcos.filter((e) => e.status === "Rejected").length,
  };
  const roleTotals = visibleEcos.reduce((acc, eco) => {
    const key = eco.userName || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const contributorRows = Object.entries(roleTotals)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxContributor = contributorRows[0]?.count || 1;

  const pieSegments = [
    { label: "In Progress", value: byStatus.InProgress, color: "#2563eb" },
    { label: "Approval", value: byStatus.Pending, color: "#f59e0b" },
    { label: "Approved", value: byStatus.Approved, color: "#059669" },
    { label: "Draft", value: byStatus.Draft, color: "#64748b" },
    { label: "Rejected", value: byStatus.Rejected, color: "#dc2626" },
  ].filter((s) => s.value > 0);
  const pieTotal = pieSegments.reduce((sum, s) => sum + s.value, 0) || 1;
  let accum = 0;
  const pieGradient = pieSegments.map((segment) => {
    const start = (accum / pieTotal) * 100;
    accum += segment.value;
    const end = (accum / pieTotal) * 100;
    return `${segment.color} ${start}% ${end}%`;
  }).join(", ");

  const approvalDutyCell = (eco) => {
    if (eco.stage !== "Approval") {
      return <span className="text-surface-400 text-xs">—</span>;
    }
    const mine = getMyApproverDutyForEco(eco, user?.id, approvals, stages);
    if (!mine.length) {
      return <span className="text-surface-400 text-xs">Not on list</span>;
    }
    const required = mine.some((m) => m.approvalType === "Required");
    return (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          required ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
        }`}
      >
        {required ? "Required for you" : "Optional for you"}
      </span>
    );
  };

  const columns = [
    { key: "title", label: "Name (ECO Title)", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    { key: "ecoType", label: "ECO Type", render: (val) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${val === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>{val}</span>
    )},
    { key: "productName", label: "Product" },
    { key: "stage", label: "Stage", render: (val) => stageBadge(val) },
    { key: "status", label: "Status", render: (val) => stageBadge(val) },
    ...(isApproverLike
      ? [{
          key: "approvalDuty",
          label: "Your approval (product)",
          render: (_, eco) => approvalDutyCell(eco),
        }]
      : []),
  ];

  const handleDeleteOne = async (type, id) => {
    if (!window.confirm(`Delete this ${type} record?`)) return;
    if (type === "eco") await deleteEco(id);
    if (type === "product") await deleteProduct(id);
    if (type === "bom") await deleteBom(id);
    if (type === "user") await removeUser(id);
  };

  const handleClearTable = async (type) => {
    if (!window.confirm(`Delete all records in ${type} table?`)) return;
    if (type === "ecos") await clearEcos();
    if (type === "products") await clearProducts();
    if (type === "boms") await clearBoms();
    if (type === "users") await clearUsers();
  };

  return (
    <Layout title="PLM Sentry Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total ECOs", value: visibleEcos.length, color: "from-primary-500 to-primary-600", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg> },
          { label: "In Progress", value: visibleEcos.filter((e) => e.stage === "New" || e.stage === "Approval").length, color: "from-amber-500 to-orange-500", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
          { label: "Approved", value: visibleEcos.filter((e) => e.status === "Approved").length, color: "from-emerald-500 to-green-600", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Draft", value: visibleEcos.filter((e) => e.stage === "Draft").length, color: "from-surface-500 to-surface-600", icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
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

      {/* Role-based analytics (only for applicable users) */}
      {isApproverLike ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div className="xl:col-span-2 bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-surface-900">Changes by Contributor</h3>
              <span className="text-xs text-surface-500">Top users by ECO count</span>
            </div>
            <div className="space-y-3">
              {contributorRows.length === 0 ? (
                <p className="text-sm text-surface-500">No contributor data available.</p>
              ) : contributorRows.map((row) => (
                <div key={row.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-surface-700">{row.name}</span>
                    <span className="text-surface-500">{row.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                      style={{ width: `${Math.max((row.count / maxContributor) * 100, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <h3 className="text-base font-bold text-surface-900 mb-4">Status Distribution</h3>
            <div className="flex items-center justify-center">
              <div
                className="w-44 h-44 rounded-full relative"
                style={{ background: `conic-gradient(${pieGradient || "#e2e8f0 0% 100%"})` }}
              >
                <div className="absolute inset-7 rounded-full bg-white border border-surface-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-surface-700">{visibleEcos.length}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {pieSegments.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-surface-600">{s.label}</span>
                  </div>
                  <span className="font-semibold text-surface-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-surface-900">My ECO Pipeline</h3>
            <span className="text-xs text-surface-500">Engineer-only view</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Draft", value: byStatus.Draft, color: "text-surface-700 bg-surface-100" },
              { label: "In Progress", value: byStatus.InProgress, color: "text-blue-700 bg-blue-100" },
              { label: "Approval", value: byStatus.Pending, color: "text-amber-700 bg-amber-100" },
              { label: "Approved", value: byStatus.Approved, color: "text-emerald-700 bg-emerald-100" },
              { label: "Rejected", value: byStatus.Rejected, color: "text-red-700 bg-red-100" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-surface-200 p-3">
                <p className="text-xs text-surface-500">{item.label}</p>
                <div className={`inline-block mt-2 px-2.5 py-1 rounded-full text-sm font-bold ${item.color}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        <div className="space-y-4">
          <DataTable
            columns={[
              ...columns,
              { key: "userName", label: "Requested By" },
              { key: "createdAt", label: "Created Date" },
            ]}
            data={filtered}
            onRowClick={(eco) => navigate(`/ecos/${eco.id}`)}
            emptyMessage="No ECOs found. Create your first Engineering Change Order."
          />
          {isApproverLike && (
            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h3 className="text-base font-bold text-surface-900 mb-3">Detailed Pipeline Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">In Progress</p><p className="text-xl font-bold text-blue-900">{byStatus.InProgress}</p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">Awaiting Approval</p><p className="text-xl font-bold text-amber-900">{byStatus.Pending}</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Approved</p><p className="text-xl font-bold text-emerald-900">{byStatus.Approved}</p>
                </div>
                <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
                  <p className="text-xs text-surface-600">Draft</p><p className="text-xl font-bold text-surface-800">{byStatus.Draft}</p>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-xs text-red-700">Rejected</p><p className="text-xl font-bold text-red-900">{byStatus.Rejected}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-surface-500">No ECOs found</div>
          ) : (
            filtered.map((eco) => {
              const mine = isApproverLike && eco.stage === "Approval"
                ? getMyApproverDutyForEco(eco, user?.id, approvals, stages)
                : [];
              const dutyLabel = mine.length
                ? (mine.some((m) => m.approvalType === "Required") ? "Required for you" : "Optional for you")
                : null;
              return (
              <KanbanCard
                key={eco.id}
                title={eco.title}
                subtitle={eco.ecoType}
                status={eco.stage}
                fields={[
                  { label: "Product", value: eco.productName },
                  ...(dutyLabel ? [{ label: "Your approval", value: dutyLabel }] : []),
                  { label: "Status", value: eco.status },
                  { label: "Created", value: eco.createdAt },
                ]}
                onClick={() => navigate(`/ecos/${eco.id}`)}
              />
            );
            })
          )}
        </div>
      )}

      {isAdmin && (
        <div className="mt-8 bg-white rounded-xl border border-surface-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-surface-900">Admin Quick Delete</h3>
            <span className="text-xs text-surface-500">Delete individual entries or clear a full table</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-surface-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-surface-800">Users</h4>
                <button onClick={() => handleClearTable("users")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
              </div>
              <div className="space-y-2 max-h-52 overflow-auto">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                    <p className="text-sm text-surface-700">{u.name || u.email} ({u.role})</p>
                    {u.id !== user?.id && <button onClick={() => handleDeleteOne("user", u.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-surface-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-surface-800">Products</h4>
                <button onClick={() => handleClearTable("products")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
              </div>
              <div className="space-y-2 max-h-52 overflow-auto">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                    <p className="text-sm text-surface-700">{p.name}</p>
                    <button onClick={() => handleDeleteOne("product", p.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-surface-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-surface-800">BoMs</h4>
                <button onClick={() => handleClearTable("boms")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
              </div>
              <div className="space-y-2 max-h-52 overflow-auto">
                {boms.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                    <p className="text-sm text-surface-700">{b.bomNumber} - {b.productName}</p>
                    <button onClick={() => handleDeleteOne("bom", b.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-surface-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-surface-800">ECOs</h4>
                <button onClick={() => handleClearTable("ecos")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
              </div>
              <div className="space-y-2 max-h-52 overflow-auto">
                {ecos.map((e) => (
                  <div key={e.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                    <p className="text-sm text-surface-700">{e.title}</p>
                    <button onClick={() => handleDeleteOne("eco", e.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}