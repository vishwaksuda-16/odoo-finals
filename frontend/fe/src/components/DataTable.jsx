export default function DataTable({ columns, data, onRowClick, emptyMessage = "No data available" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <p className="text-surface-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-primary-50/50" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-sm text-surface-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
