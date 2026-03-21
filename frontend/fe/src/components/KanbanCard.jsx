export default function KanbanCard({ title, subtitle, status, statusColor = "bg-surface-100 text-surface-600", fields = [], onClick, actions }) {
  const colorMap = {
    Active: "bg-emerald-100 text-emerald-700",
    Archived: "bg-surface-200 text-surface-600",
    Draft: "bg-surface-200 text-surface-600",
    "In Progress": "bg-blue-100 text-blue-700",
    New: "bg-blue-100 text-blue-700",
    Pending: "bg-amber-100 text-amber-700",
    Approval: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Done: "bg-emerald-100 text-emerald-700",
  };

  const resolvedColor = colorMap[status] || statusColor;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-surface-200 p-5 hover:shadow-lg hover:shadow-surface-200/50 hover:border-primary-200 transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 truncate">{title}</h3>
          {subtitle && <p className="text-sm text-surface-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {status && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ml-3 ${resolvedColor}`}>
            {status}
          </span>
        )}
      </div>

      {fields.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-surface-100">
          {fields.map((field, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-surface-500">{field.label}</span>
              <span className="text-surface-700 font-medium">{field.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className="mt-4 pt-3 border-t border-surface-100 flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
