export default function DiffView({ title, bomChanges = [], productChanges = [], oldVersion = "v1", newVersion = "v2" }) {
  const getRowColor = (operation) => {
    if (operation === "Added") return "bg-emerald-50 border-l-4 border-l-emerald-500";
    if (operation === "Removed") return "bg-red-50 border-l-4 border-l-red-500";
    if (operation === "Modified") return "bg-amber-50 border-l-4 border-l-amber-400";
    return "";
  };

  const getBadge = (operation) => {
    const map = {
      Added: "bg-emerald-100 text-emerald-700",
      Removed: "bg-red-100 text-red-700",
      Modified: "bg-amber-100 text-amber-700",
      Unchanged: "bg-surface-100 text-surface-600",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[operation] || map.Unchanged}`}>
        {operation}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Version comparison header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="px-3 py-1.5 bg-surface-200 text-surface-700 rounded-lg text-sm font-semibold">{oldVersion}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">{newVersion}</span>
      </div>

      {/* BoM Changes */}
      {bomChanges.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
            <h3 className="font-semibold text-surface-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              BoM Changes
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Component</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Old Qty</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">New Qty</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {bomChanges.map((c, i) => (
                <tr key={i} className={getRowColor(c.operation)}>
                  <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{c.component}</td>
                  <td className="px-5 py-3.5 text-sm text-surface-600">{c.oldQty}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-surface-800">{c.newQty}</td>
                  <td className="px-5 py-3.5">{getBadge(c.operation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Changes */}
      {productChanges.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
            <h3 className="font-semibold text-surface-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8V16A2 2 0 0 1 19 18H5A2 2 0 0 1 3 16V8A2 2 0 0 1 5 6H19A2 2 0 0 1 21 8Z"/><path d="M3 10H21"/></svg>
              Product Changes
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Field</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Old Value</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">New Value</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {productChanges.map((c, i) => (
                <tr key={i} className={getRowColor(c.status)}>
                  <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{c.field}</td>
                  <td className="px-5 py-3.5 text-sm text-red-600 line-through">{c.oldValue}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-emerald-700">{c.newValue}</td>
                  <td className="px-5 py-3.5">{getBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bomChanges.length === 0 && productChanges.length === 0 && (
        <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
          <p className="text-surface-500">No changes recorded.</p>
        </div>
      )}
    </div>
  );
}