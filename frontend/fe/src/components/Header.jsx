export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 bg-white shadow">
      
      {/* Title */}
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {/* User Icon */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-gray-600">User</span>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          👤
        </div>
      </div>

    </div>
  );
}