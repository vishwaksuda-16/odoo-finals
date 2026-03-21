export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h1 className="text-xl font-bold mb-6">PLM Sentry</h1>

      <ul className="space-y-4">
        <li className="cursor-pointer hover:text-blue-400">Dashboard</li>
        <li className="cursor-pointer hover:text-blue-400">Products</li>
        <li className="cursor-pointer hover:text-blue-400">BoM</li>
        <li className="cursor-pointer hover:text-blue-400">Reporting</li>
        <li className="cursor-pointer hover:text-blue-400">Settings</li>
      </ul>
    </div>
  );
}