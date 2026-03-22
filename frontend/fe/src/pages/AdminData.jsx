import Layout from "../components/Layout";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function AdminData() {
  const { ecos, products, boms, deleteEco, clearEcos, deleteProduct, clearProducts, deleteBom, clearBoms } = useData();
  const { users, user, removeUser, clearUsers } = useAuth();

  const handleDeleteOne = async (type, id) => {
    if (!window.confirm(`Delete this ${type} record?`)) return;
    if (type === "eco") await deleteEco(id);
    if (type === "product") await deleteProduct(id);
    if (type === "bom") await deleteBom(id);
    if (type === "user") await removeUser(id);
  };

  const handleClearTable = async (type) => {
    if (!window.confirm(`Delete all records in ${type} table?`)) return;
    if (type === "ecos") await clearEcos();
    if (type === "products") await clearProducts();
    if (type === "boms") await clearBoms();
    if (type === "users") await clearUsers();
  };

  return (
    <Layout title="Admin Quick Data">
      <div className="mb-6">
        <p className="text-surface-500 text-sm">Delete individual entries or clear full tables. Use with caution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-surface-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-surface-800">Users</h4>
            <button onClick={() => handleClearTable("users")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                <p className="text-sm text-surface-700">{u.name || u.email} ({u.role})</p>
                {u.id !== user?.id && <button onClick={() => handleDeleteOne("user", u.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-surface-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-surface-800">Products</h4>
            <button onClick={() => handleClearTable("products")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                <p className="text-sm text-surface-700">{p.name}</p>
                <button onClick={() => handleDeleteOne("product", p.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-surface-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-surface-800">BoMs</h4>
            <button onClick={() => handleClearTable("boms")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {boms.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                <p className="text-sm text-surface-700">{b.bomNumber} - {b.productName}</p>
                <button onClick={() => handleDeleteOne("bom", b.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-surface-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-surface-800">ECOs</h4>
            <button onClick={() => handleClearTable("ecos")} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Clear Table</button>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {ecos.map((e) => (
              <div key={e.id} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded-lg border border-surface-200">
                <p className="text-sm text-surface-700">{e.title}</p>
                <button onClick={() => handleDeleteOne("eco", e.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
