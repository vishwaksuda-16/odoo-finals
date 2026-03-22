import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ArchivedProducts() {
  const navigate = useNavigate();
  const { deleteProduct, unarchiveProduct } = useData();
  const { isAdmin, canCreate } = useAuth();
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.listArchived()
      .then((rows) => {
        setArchived((rows || []).map((p) => {
          const latest = (p.versions || [])[0];
          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            version: latest?.versionNumber || 1,
            salesPrice: latest?.salePrice || 0,
            costPrice: latest?.costPrice || 0,
            status: "Archived",
          };
        }));
      })
      .catch(() => setArchived([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnarchive = async (id) => {
    try {
      await unarchiveProduct(id);
      setArchived((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: "name", label: "Product Name", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    { key: "version", label: "Version", render: (val) => <span className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs font-semibold">v{val}</span> },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-200 text-surface-600">{val}</span>
      ),
    },
    { key: "salesPrice", label: "Sales Price", render: (val) => `$${val?.toFixed(2) || "0.00"}` },
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {(canCreate || isAdmin) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleUnarchive(row.id); }}
              className="px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              Unarchive
            </button>
          )}
          {isAdmin && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm("Permanently delete this product?")) {
                  await deleteProduct(row.id);
                  setArchived((prev) => prev.filter((p) => p.id !== row.id));
                }
              }}
              className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout title="Archived Products">
      <button
        onClick={() => navigate("/products")}
        className="mb-6 flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Products
      </button>
      <div className="mb-6">
        <p className="text-surface-500 text-sm">Products archived by engineers or admins. Unarchive to restore to the main list.</p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-surface-500">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={archived}
          onRowClick={(p) => navigate(`/products/${p.id}`)}
          emptyMessage="No archived products."
        />
      )}
    </Layout>
  );
}
