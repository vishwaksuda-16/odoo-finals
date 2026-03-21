import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { usePermissions } from "../hooks/usePermissions";

const stageColors = {
  Draft: "bg-surface-200 text-surface-700",
  New: "bg-blue-100 text-blue-700 border border-blue-200",
  "In Progress": "bg-blue-100 text-blue-700 border border-blue-200",
  Approval: "bg-amber-100 text-amber-700 border border-amber-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Done: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const roleBadgeColors = {
  engineer: "bg-blue-100 text-blue-700 border-blue-200",
  approver: "bg-emerald-100 text-emerald-700 border-emerald-200",
  admin: "bg-primary-100 text-primary-700 border-primary-200",
};

export default function ECODetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, canStart, canApprove } = useAuth();
  const { role } = usePermissions();
  const { ecos, startEco, moveEcoToApproval, approveEco, rejectEco, approvals } = useData();
  const eco = ecos.find((e) => e.id === id);

  // Auto-start if redirected from create with ?start=true
  useEffect(() => {
    if (searchParams.get("start") === "true" && eco && eco.stage === "Draft" && canStart) {
      startEco(id);
    }
  }, [searchParams, id]);

  if (!eco) {
    return (
      <Layout title="ECO Not Found">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
          </div>
          <h2 className="text-xl font-bold text-surface-800 mb-2">ECO Not Found</h2>
          <p className="text-surface-500 mb-6">The engineering change order you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const hasApprovalConfig = approvals.some((a) => a.approvalType === "Required");

  const handleStart = () => { if (canStart) startEco(id); };
  const handleMoveToApproval = () => { if (canStart) moveEcoToApproval(id); };
  const handleApprove = () => { if (canApprove) approveEco(id); };
  const handleReject = () => { if (canApprove) rejectEco(id); };

  const stageSteps = ["New", "Approval", "Done"];
  const currentStepIndex = stageSteps.indexOf(eco.stage === "Draft" || eco.stage === "In Progress" ? "New" : eco.stage);

  return (
    <Layout title={eco.title}>
      {/* Current role indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${roleBadgeColors[role] || roleBadgeColors.engineer}`}>
            {role?.toUpperCase()} ROLE
          </span>
          <span className="text-xs text-surface-500">
            {role === "engineer" && "You can create, edit & start ECOs"}
            {role === "approver" && "You can review & approve ECOs"}
            {role === "admin" && "Full access to all actions"}
          </span>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${stageColors[eco.stage] || stageColors.Draft}`}>
              {eco.stage}
            </span>
            {eco.status === "Approved" && (
              <span className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ECO Applied
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {eco.ecoType === "BoM" && eco.bomId && (
              <button
                onClick={() => navigate(`/bom/${eco.bomId}`)}
                className="px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Open BoM
              </button>
            )}
            {eco.ecoType === "Product" && (
              <button
                onClick={() => navigate(`/products/${eco.productId}`)}
                className="px-4 py-2 text-sm font-medium bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
              >
                Open Product
              </button>
            )}
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {stageSteps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                i <= currentStepIndex
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                  : "bg-surface-200 text-surface-500"
              }`}>
                {i < currentStepIndex ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              <div className="flex-1 ml-2">
                <p className={`text-sm font-medium ${i <= currentStepIndex ? "text-surface-800" : "text-surface-400"}`}>{step}</p>
              </div>
              {i < stageSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded ${i < currentStepIndex ? "bg-primary-500" : "bg-surface-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ECO Details */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50">
            <h3 className="font-bold text-surface-900">ECO Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Title", value: eco.title },
              { label: "ECO Type", value: eco.ecoType, badge: true },
              { label: "Product", value: eco.productName },
              { label: "Bill of Materials", value: eco.bomName || "—" },
              { label: "User", value: eco.userName },
              { label: "Effective Date", value: eco.effectiveDate ? new Date(eco.effectiveDate).toLocaleString() : "—" },
              { label: "Version Update", value: eco.versionUpdate ? "Yes" : "No" },
              { label: "Created", value: eco.createdAt },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">{item.label}</p>
                {item.badge ? (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.value === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"
                  }`}>{item.value}</span>
                ) : (
                  <p className="text-sm font-medium text-surface-800">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <h3 className="font-bold text-surface-900 mb-4">Actions</h3>
            <div className="space-y-3">

              {/* ▶ Start ECO - ENGINEER & ADMIN only at Draft */}
              {eco.stage === "Draft" && canStart && (
                <button
                  onClick={handleStart}
                  id="eco-start-action"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Start ECO
                </button>
              )}

              {/* ➤ Send for Approval — ENGINEER & ADMIN only */}
              {(eco.stage === "New" || eco.stage === "In Progress") && canStart && (
                <button
                  onClick={handleMoveToApproval}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send for Approval
                </button>
              )}
              {(eco.stage === "New" || eco.stage === "In Progress") && !canStart && (
                <div className="w-full py-2.5 bg-surface-100 text-surface-400 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Send for Approval (Engineer/Admin only)
                </div>
              )}

              {/* ✓ Approve/Validate - APPROVER & ADMIN only */}
              {eco.stage === "Approval" && (
                <>
                  {canApprove ? (
                    <>
                      <button
                        onClick={handleApprove}
                        id="eco-approve-action"
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Validate / Approve
                      </button>
                      <button
                        onClick={handleReject}
                        id="eco-reject-action"
                        className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-2.5 bg-amber-50 text-amber-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 border border-amber-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                      Pending Approval
                    </div>
                  )}
                </>
              )}

              {/* Done state */}
              {eco.stage === "Done" && (
                <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-emerald-700 font-semibold text-sm flex items-center justify-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ECO Completed
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">All changes have been applied</p>
                </div>
              )}
            </div>
          </div>

          {/* Changes Section */}
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <h3 className="font-bold text-surface-900 mb-3">Changes</h3>
            <button
              onClick={() => navigate(`/changes/${eco.id}`)}
              className="w-full py-2.5 bg-surface-100 text-surface-700 font-medium rounded-xl hover:bg-surface-200 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Changes
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}