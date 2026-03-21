import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useData();

  const product = products.find((p) => p.id === id);

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
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50 flex items-center justify-between">
            <h3 className="font-bold text-surface-900">Product Details</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              product.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-surface-200 text-surface-600"
            }`}>{product.status}</span>
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
      </div>
    </Layout>
  );
}
