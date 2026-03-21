import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";

export default function BOMDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { boms } = useData();

  const bom = boms.find((b) => b.id === id);

  if (!bom) {
    return (
      <Layout title="BoM Not Found">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
          </div>
          <h2 className="text-xl font-bold text-surface-800 mb-2">BoM Not Found</h2>
          <button onClick={() => navigate("/bom")} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl mt-4">
            Back to BoMs
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`BoM — ${bom.bomNumber}`}>
      <button
        onClick={() => navigate("/bom")}
        className="mb-6 flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Bills of Materials
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50 flex items-center justify-between">
            <h3 className="font-bold text-surface-900">BoM Details</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              bom.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-surface-200 text-surface-600"
            }`}>{bom.status}</span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-5">
            {[
              { label: "BoM Number", value: bom.bomNumber },
              { label: "Finished Product", value: bom.productName },
              { label: "Reference", value: bom.reference },
              { label: "Quantity", value: bom.quantity },
              { label: "Stock Location", value: bom.stockLocation || "—" },
              { label: "Unit of Measure", value: bom.unitOfMeasure || "Unit" },
              { label: "Version", value: `v${bom.version}` },
              { label: "Work Orders", value: bom.workOrders || "—" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-medium text-surface-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Components */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-200 bg-surface-50/50">
            <h3 className="font-bold text-surface-900">Components</h3>
          </div>
          <div className="divide-y divide-surface-100">
            {bom.components && bom.components.length > 0 ? (
              bom.components.map((comp, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-800">{comp.name}</p>
                    <p className="text-xs text-surface-500">{comp.unit}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-100 text-surface-700 rounded-lg text-sm font-semibold">
                    ×{comp.quantity}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-surface-500 text-sm">No components defined</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
