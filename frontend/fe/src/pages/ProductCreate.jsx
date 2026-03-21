import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";

export default function ProductCreate() {
  const { addProduct } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    salesPrice: "",
    costPrice: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    else if (form.name.length > 255) errs.name = "Max 255 characters";
    if (!form.salesPrice || parseFloat(form.salesPrice) < 0) errs.salesPrice = "Valid sales price is required";
    if (!form.costPrice || parseFloat(form.costPrice) < 0) errs.costPrice = "Valid cost price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await addProduct({
      name: form.name.trim(),
      salesPrice: parseFloat(form.salesPrice),
      costPrice: parseFloat(form.costPrice),
      attachments: attachments.map((f) => f.name),
    });
    navigate("/products");
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-danger-500 focus:ring-danger-500/30 bg-danger-500/5"
        : "border-surface-200 focus:ring-primary-500/30 focus:border-primary-400"
    }`;

  return (
    <Layout title="Create Product">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">New Product</h2>
            <p className="text-sm text-surface-500 mt-1">Add a new product to the master data</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Product Name *</label>
              <input
                id="product-name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter product name (max 255 chars)"
                maxLength={255}
                className={inputClass("name")}
              />
              {errors.name && <p className="mt-1.5 text-xs text-danger-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Sales Price *</label>
                <input
                  id="product-sales-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salesPrice}
                  onChange={(e) => update("salesPrice", e.target.value)}
                  placeholder="0.00"
                  className={inputClass("salesPrice")}
                />
                {errors.salesPrice && <p className="mt-1.5 text-xs text-danger-500">{errors.salesPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Cost Price *</label>
                <input
                  id="product-cost-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => update("costPrice", e.target.value)}
                  placeholder="0.00"
                  className={inputClass("costPrice")}
                />
                {errors.costPrice && <p className="mt-1.5 text-xs text-danger-500">{errors.costPrice}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Attachments</label>
              <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                <input
                  id="product-attachments"
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="hidden"
                />
                <label htmlFor="product-attachments" className="cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-surface-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="text-sm text-surface-500">Click to upload PDF, Excel, or Images</p>
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-1">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 px-3 py-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {f.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Version</label>
              <input
                type="text"
                value="1"
                readOnly
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
              />
              <p className="mt-1.5 text-xs text-surface-400">Version updates only when an ECO is approved</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-surface-200 bg-surface-50/50 flex items-center justify-between">
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-200 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              id="product-save-button"
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg transition-all"
            >
              Save Product
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}