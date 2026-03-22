import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { getMyApproverDutyForEco } from "../utils/approvalRules";
import { countEcosByPipelineBucket } from "../utils/ecoPipeline";

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

export default function ApproverWorkspace() {
  const { ecos, approvals, stages } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const visibleEcos = useMemo(
    () => (["APPROVER", "ADMIN"].includes(user?.role) ? ecos : []),
    [ecos, user?.role]
  );

  const byBucket = useMemo(() => countEcosByPipelineBucket(visibleEcos), [visibleEcos]);

  const pieSegments = useMemo(
    () =>
      [
        { label: "In Progress", value: byBucket.InProgress, color: "#2563eb" },
        { label: "Approval", value: byBucket.Approval, color: "#f59e0b" },
        { label: "Approved", value: byBucket.Approved, color: "#059669" },
        { label: "Draft", value: byBucket.Draft, color: "#64748b" },
        { label: "Rejected", value: byBucket.Rejected, color: "#dc2626" },
      ].filter((s) => s.value > 0),
    [byBucket]
  );

  const pieTotal = pieSegments.reduce((sum, s) => sum + s.value, 0);
  let accum = 0;
  const pieGradient = pieSegments.map((segment) => {
    const start = (accum / pieTotal) * 100;
    accum += segment.value;
    const end = (accum / pieTotal) * 100;
    return `${segment.color} ${start}% ${end}%`;
  }).join(", ");

  const roleTotals = useMemo(() => {
    const acc = {};
    visibleEcos.forEach((eco) => {
      const key = eco.userName || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, [visibleEcos]);

  const contributorRows = Object.entries(roleTotals)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxContributor = contributorRows[0]?.count || 1;

  const pendingQueue = useMemo(() => {
    const pending = visibleEcos.filter((e) => e.stage === "Approval");
    return [...pending].sort((a, b) => {
      const aMine = getMyApproverDutyForEco(a, user?.id, approvals, stages);
      const bMine = getMyApproverDutyForEco(b, user?.id, approvals, stages);
      const aReq = aMine.some((m) => m.approvalType === "Required") ? 0 : 1;
      const bReq = bMine.some((m) => m.approvalType === "Required") ? 0 : 1;
      if (aReq !== bReq) return aReq - bReq;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  }, [visibleEcos, user?.id, approvals, stages]);

  const requiredForYou = pendingQueue.filter((e) => {
    const mine = getMyApproverDutyForEco(e, user?.id, approvals, stages);
    return mine.some((m) => m.approvalType === "Required");
  }).length;

  const queueColumns = [
    { key: "title", label: "ECO", render: (val) => <span className="font-medium text-surface-900">{val}</span> },
    { key: "productName", label: "Product" },
    { key: "ecoType", label: "Type", render: (val) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${val === "BoM" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>{val}</span>
    ) },
    { key: "stage", label: "Stage", render: (val) => stageBadge(val) },
    {
      key: "id",
      label: "Your role",
      render: (_, row) => {
        const mine = getMyApproverDutyForEco(row, user?.id, approvals, stages);
        if (!mine.length) return <span className="text-surface-400 text-xs">Not assigned</span>;
        const req = mine.some((m) => m.approvalType === "Required");
        return (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${req ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
            {req ? "Required" : "Optional"}
          </span>
        );
      },
    },
    { key: "userName", label: "Requested by" },
    { key: "createdAt", label: "Created" },
  ];

  return (
    <Layout title="Approver workspace">
      <div className="mb-6 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white to-surface-50 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800/80">Review queue</p>
            <h2 className="text-xl font-bold text-surface-900 mt-1">Engineering change oversight</h2>
            <p className="text-sm text-surface-600 mt-2 max-w-xl">
              Pipeline totals, contributor activity, and status mix use mutually exclusive buckets so the donut matches the legend. Open any row below to approve or reject.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-white border border-amber-100 px-4 py-3 shadow-sm min-w-[120px]">
              <p className="text-xs text-surface-500">Awaiting approval</p>
              <p className="text-2xl font-bold text-amber-700">{byBucket.Approval}</p>
            </div>
            <div className="rounded-xl bg-white border border-red-100 px-4 py-3 shadow-sm min-w-[120px]">
              <p className="text-xs text-surface-500">Required for you</p>
              <p className="text-2xl font-bold text-red-700">{requiredForYou}</p>
            </div>
            <div className="rounded-xl bg-white border border-surface-200 px-4 py-3 shadow-sm min-w-[120px]">
              <p className="text-xs text-surface-500">Total ECOs</p>
              <p className="text-2xl font-bold text-surface-900">{visibleEcos.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
        <div className="xl:col-span-2 bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-surface-900">Changes by contributor</h3>
            <span className="text-xs text-surface-500">Top submitters by ECO count</span>
          </div>
          <div className="space-y-3">
            {contributorRows.length === 0 ? (
              <p className="text-sm text-surface-500">No contributor data yet.</p>
            ) : (
              contributorRows.map((row) => (
                <div key={row.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-surface-700">{row.name}</span>
                    <span className="text-surface-500 tabular-nums">{row.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-primary-400"
                      style={{ width: `${Math.max((row.count / maxContributor) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <h3 className="text-base font-bold text-surface-900 mb-1">Status distribution</h3>
          <p className="text-xs text-surface-500 mb-4">Each ECO counted once — sums to {visibleEcos.length}</p>
          <div className="flex items-center justify-center">
            <div
              className="w-44 h-44 rounded-full relative shrink-0"
              style={{
                background:
                  pieTotal > 0
                    ? `conic-gradient(${pieGradient})`
                    : "conic-gradient(#e2e8f0 0% 100%)",
              }}
            >
              <div className="absolute inset-7 rounded-full bg-white border border-surface-100 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-surface-800 tabular-nums">{pieTotal}</span>
                <span className="text-[10px] uppercase tracking-wide text-surface-500">in chart</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {pieSegments.length === 0 ? (
              <p className="text-sm text-surface-500 text-center">No data</p>
            ) : (
              pieSegments.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-surface-600 truncate">{s.label}</span>
                  </div>
                  <span className="font-semibold text-surface-700 tabular-nums shrink-0">{s.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-200 bg-surface-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-surface-900">Pending your review</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              ECOs in approval stage — required items first, then by date. Click a row to open the detail page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 self-start sm:self-center"
          >
            Full dashboard →
          </button>
        </div>
        <DataTable
          columns={queueColumns}
          data={pendingQueue}
          onRowClick={(eco) => navigate(`/ecos/${eco.id}`)}
          emptyMessage="No ECOs are waiting for approval right now."
        />
      </div>
    </Layout>
  );
}
