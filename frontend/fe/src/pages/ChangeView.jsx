import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DiffView from "../components/DiffView";
import { useData } from "../context/DataContext";

export default function ChangeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ecos } = useData();

  const eco = ecos.find((e) => e.id === id);

  if (!eco) {
    return (
      <Layout title="Changes Not Found">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-surface-800 mb-2">ECO Not Found</h2>
          <p className="text-surface-500 mb-6">Cannot find changes for this ECO.</p>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  // Determine version labels
  const baseVersion = eco.versionUpdate ? "v" + 1 : "v1";
  const newVersion = eco.versionUpdate ? "v" + 2 : "v1 (updated)";

  return (
    <Layout title={`Changes — ${eco.title}`}>
      {/* Back navigation */}
      <button
        onClick={() => navigate(`/ecos/${eco.id}`)}
        className="mb-6 flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to ECO Detail
      </button>

      {/* ECO Info */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-surface-900">{eco.title}</h2>
            <p className="text-sm text-surface-500 mt-1">{eco.ecoType} change for {eco.productName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              eco.ecoType === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"
            }`}>{eco.ecoType}</span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              eco.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>{eco.status}</span>
          </div>
        </div>
      </div>

      {/* Diff View */}
      <DiffView
        bomChanges={eco.changes?.bom || []}
        productChanges={eco.changes?.product || []}
        oldVersion={baseVersion}
        newVersion={newVersion}
      />
    </Layout>
  );
}