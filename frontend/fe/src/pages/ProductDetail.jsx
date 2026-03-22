import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, deleteProduct, archiveProduct, unarchiveProduct } = useData();
  const { canCreate, isAdmin } = useAuth();
  const [product, setProduct] = useState(products.find((p) => p.id === id));
  const [productHistory, setProductHistory] = useState(null);

  useEffect(() => {
    if (product) {
      api.products.history(id)
        .then((h) => setProductHistory(h))
        .catch(() => setProductHistory(null));
    }
  }, [id, product]);

  useEffect(() => {
    const p = products.find((x) => x.id === id);
    if (p) setProduct(p);
    else {
      api.products.getById(id)
        .then((raw) => {
          const active = (raw.versions || []).find((v) => v.status === "ACTIVE") || (raw.versions || [])[0];
          setProduct({
            id: raw.id,
            name: raw.name,
            salesPrice: active?.salePrice || 0,
            costPrice: active?.costPrice || 0,
            version: active?.versionNumber || 1,
            status: raw.archived ? "Archived" : "Active",
            archived: raw.archived,
            createdAt: raw.createdAt,
          });
        })
        .catch(() => setProduct(null));
    }
  }, [id, products]);

  if (!product) {
    return (
      <Layout title="Product Not Found">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
          </div>
          <h2 className="text-xl font-bold text-surface-800 mb-2">Product Not Found</h2>
          <button onClick={() => navigate("/products")} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl mt-4">
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={product.name}>
      <button
        onClick={() => navigate("/products")}
        className="mb-6 flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-surface-900">Product Details</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                product.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-surface-200 text-surface-600"
              }`}>{product.status}</span>
              {(canCreate || isAdmin) && (
                <>
                  {product.archived ? (
                    <button
                      onClick={async () => { await unarchiveProduct?.(id); navigate("/products"); }}
                      className="px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200"
                    >
                      Unarchive
                    </button>
                  ) : (
                    <button
                      onClick={async () => { await archiveProduct?.(id); navigate("/products"); }}
                      className="px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200"
                    >
                      Archive
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (window.confirm("Permanently delete this product?")) {
                          await deleteProduct?.(id);
                          navigate("/products");
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-5">
            {[
              { label: "Product Name", value: product.name },
              { label: "Version", value: `v${product.version}` },
              { label: "Sales Price", value: `$${product.salesPrice?.toFixed(2)}` },
              { label: "Cost Price", value: `$${product.costPrice?.toFixed(2)}` },
              { label: "Created", value: product.createdAt },
              { label: "Status", value: product.status },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-medium text-surface-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-200 bg-surface-50/50">
            <h3 className="font-bold text-surface-900">Attachments</h3>
          </div>
          <div className="p-5">
            {product.attachments && product.attachments.length > 0 ? (
              <div className="space-y-2">
                {product.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 px-3 py-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {att}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-sm text-center py-4">No attachments</p>
            )}
          </div>
        </div>

        {productHistory?.versions?.filter((v) => v.status === "ARCHIVED").length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50">
              <h3 className="font-bold text-surface-900">Archived Versions</h3>
              <p className="text-sm text-surface-500 mt-1">Previous product versions (replaced on ECO approval)</p>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-2 font-semibold text-surface-700">Version</th>
                    <th className="text-left py-2 font-semibold text-surface-700">Sale Price</th>
                    <th className="text-left py-2 font-semibold text-surface-700">Cost Price</th>
                    <th className="text-left py-2 font-semibold text-surface-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productHistory.versions.filter((v) => v.status === "ARCHIVED").map((v) => (
                    <tr key={v.id} className="border-b border-surface-100">
                      <td className="py-2 font-medium">v{v.versionNumber}</td>
                      <td className="py-2">${v.salePrice?.toFixed(2)}</td>
                      <td className="py-2">${v.costPrice?.toFixed(2)}</td>
                      <td className="py-2"><span className="px-2 py-0.5 rounded text-xs bg-surface-200 text-surface-600">Archived</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
