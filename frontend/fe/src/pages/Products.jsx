import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import KanbanCard from "../components/KanbanCard";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { products } = useData();
  const { canCreate } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: "name", label: "Product Name", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    { key: "version", label: "Version", render: (val) => <span className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs font-semibold">v{val}</span> },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          val === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-surface-200 text-surface-600"
        }`}>{val}</span>
      ),
    },
    { key: "salesPrice", label: "Sales Price", render: (val) => `$${val?.toFixed(2) || "0.00"}` },
  ];

  return (
    <Layout title="Products">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {canCreate && (
          <button
            onClick={() => navigate("/products/create")}
            id="new-product-button"
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New
          </button>
        )}

        <div className="relative flex-1 max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            id="search-products"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
          />
        </div>

        <div className="flex items-center bg-surface-100 rounded-xl p-1">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === "list" ? "bg-white shadow text-surface-800" : "text-surface-500"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === "kanban" ? "bg-white shadow text-surface-800" : "text-surface-500"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>

      {view === "list" ? (
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(p) => navigate(`/products/${p.id}`)}
          emptyMessage="No products found."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-surface-500">No products found</div>
          ) : (
            filtered.map((p) => (
              <KanbanCard
                key={p.id}
                title={p.name}
                status={p.status}
                fields={[
                  { label: "Version", value: `v${p.version}` },
                  { label: "Sales Price", value: `$${p.salesPrice?.toFixed(2)}` },
                  { label: "Cost Price", value: `$${p.costPrice?.toFixed(2)}` },
                ]}
                onClick={() => navigate(`/products/${p.id}`)}
              />
            ))
          )}
        </div>
      )}
    </Layout>
  );
}