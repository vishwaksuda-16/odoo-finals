import { useState } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

const TYPES = [
  { value: "users", label: "Users" },
  { value: "products", label: "Products" },
  { value: "boms", label: "Bills of Materials" },
  { value: "ecos", label: "ECOs" },
];

export default function AdminData() {
  const [selectedType, setSelectedType] = useState("users");
  const { ecos, products, boms, deleteEco, clearEcos, deleteProduct, clearProducts, deleteBom, clearBoms } = useData();
  const { users, user, removeUser, clearUsers } = useAuth();

  const handleDeleteOne = async (type, id) => {
    if (!window.confirm(`Delete this ${type} record?`)) return;
    if (type === "eco") await deleteEco(id);
    if (type === "product") await deleteProduct(id);
    if (type === "bom") await deleteBom(id);
    if (type === "user") await removeUser(id);
  };

  const handleClearTable = async (type) => {
    if (!window.confirm(`Delete all records in ${type} table? This cannot be undone.`)) return;
    if (type === "ecos") await clearEcos();
    if (type === "products") await clearProducts();
    if (type === "boms") await clearBoms();
    if (type === "users") await clearUsers();
  };

  const getData = () => {
    switch (selectedType) {
      case "users":
        return users.map((u) => ({ ...u, _type: "user" }));
      case "products":
        return products.map((p) => ({ ...p, _type: "product" }));
      case "boms":
        return boms.map((b) => ({ ...b, _type: "bom" }));
      case "ecos":
        return ecos.map((e) => ({ ...e, _type: "eco" }));
      default:
        return [];
    }
  };

  const getColumns = () => {
    const deleteCol = {
      key: "delete",
      label: "Actions",
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDeleteOne(row._type, row.id); }}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      ),
    };

    switch (selectedType) {
      case "users":
        return [
          { key: "name", label: "Name", render: (v, r) => r.name || r.email || "—" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (v) => <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary-100 text-primary-700">{v}</span> },
          { ...deleteCol, render: (_, row) => row.id === user?.id ? <span className="text-surface-400 text-xs">Current user</span> : deleteCol.render(_, row) },
        ];
      case "products":
        return [
          { key: "name", label: "Product Name" },
          { key: "version", label: "Version", render: (v) => `v${v || 1}` },
          { key: "salesPrice", label: "Sales Price", render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
          { key: "costPrice", label: "Cost Price", render: (v) => v != null ? `$${Number(v).toFixed(2)}` : "—" },
          deleteCol,
        ];
      case "boms":
        return [
          { key: "bomNumber", label: "BOM" },
          { key: "productName", label: "Product" },
          { key: "version", label: "Version", render: (v) => `v${v || 1}` },
          { key: "status", label: "Status" },
          deleteCol,
        ];
      case "ecos":
        return [
          { key: "title", label: "ECO Title" },
          { key: "ecoType", label: "Type", render: (v) => <span className={`px-2 py-0.5 rounded text-xs font-semibold ${v === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>{v}</span> },
          { key: "productName", label: "Product" },
          { key: "stage", label: "Stage" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created" },
          deleteCol,
        ];
      default:
        return [];
    }
  };

  const data = getData();

  return (
    <Layout title="Admin Data">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm font-semibold text-surface-700 mb-2">Select data type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <p className="text-sm text-surface-500">{data.length} record{data.length !== 1 ? "s" : ""}</p>
          <button
            onClick={() => handleClearTable(selectedType)}
            disabled={data.length === 0}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear all {selectedType}
          </button>
        </div>
      </div>

      <p className="text-surface-500 text-sm mb-4">Delete individual entries or clear the full table. Use with caution.</p>

      <DataTable
        columns={getColumns()}
        data={data}
        emptyMessage={`No ${selectedType} found.`}
      />
    </Layout>
  );
}
