import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";

export default function BOMCreate() {
  const { products, addBom } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bomNumber: "",
    finishedProduct: "",
    quantity: "",
    reference: "",
    stockLocation: "",
    unitOfMeasure: "Unit",
    workOrders: "",
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.bomNumber.trim()) errs.bomNumber = "BoM Number is required";
    else if (form.bomNumber.length > 8) errs.bomNumber = "Max 8 characters";
    if (!form.finishedProduct) errs.finishedProduct = "Product is required";
    if (!form.quantity || parseFloat(form.quantity) <= 0) errs.quantity = "Valid quantity is required";
    if (!form.reference.trim()) errs.reference = "Reference is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const product = products.find((p) => p.id === form.finishedProduct);
    addBom({
      bomNumber: form.bomNumber.trim().toUpperCase(),
      finishedProduct: form.finishedProduct,
      productName: product?.name || "",
      quantity: parseFloat(form.quantity),
      reference: form.reference.trim(),
      stockLocation: form.stockLocation.trim(),
      unitOfMeasure: form.unitOfMeasure,
      workOrders: form.workOrders.trim(),
    });
    navigate("/bom");
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-danger-500 focus:ring-danger-500/30 bg-danger-500/5"
        : "border-surface-200 focus:ring-primary-500/30 focus:border-primary-400"
    }`;

  return (
    <Layout title="Create Bill of Materials">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">New Bill of Materials</h2>
            <p className="text-sm text-surface-500 mt-1">Define a new BoM for a product</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">BoM Number *</label>
                <input
                  id="bom-number"
                  type="text"
                  value={form.bomNumber}
                  onChange={(e) => update("bomNumber", e.target.value)}
                  placeholder="e.g. BOM-004"
                  maxLength={8}
                  className={inputClass("bomNumber")}
                />
                {errors.bomNumber && <p className="mt-1.5 text-xs text-danger-500">{errors.bomNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Quantity *</label>
                <input
                  id="bom-quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  placeholder="1"
                  className={inputClass("quantity")}
                />
                {errors.quantity && <p className="mt-1.5 text-xs text-danger-500">{errors.quantity}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Finished Product *</label>
              <select
                id="bom-product"
                value={form.finishedProduct}
                onChange={(e) => update("finishedProduct", e.target.value)}
                className={inputClass("finishedProduct")}
              >
                <option value="">Select Product</option>
                {products.filter((p) => p.status === "Active").map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.finishedProduct && <p className="mt-1.5 text-xs text-danger-500">{errors.finishedProduct}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Reference *</label>
              <input
                id="bom-reference"
                type="text"
                value={form.reference}
                onChange={(e) => update("reference", e.target.value)}
                placeholder="e.g. WT-BOM-B"
                className={inputClass("reference")}
              />
              {errors.reference && <p className="mt-1.5 text-xs text-danger-500">{errors.reference}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Stock Location</label>
                <input
                  id="bom-stock-location"
                  type="text"
                  value={form.stockLocation}
                  onChange={(e) => update("stockLocation", e.target.value)}
                  placeholder="e.g. Warehouse A"
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Unit of Measure</label>
                <select
                  id="bom-uom"
                  value={form.unitOfMeasure}
                  onChange={(e) => update("unitOfMeasure", e.target.value)}
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white"
                >
                  <option>Unit</option>
                  <option>Kg</option>
                  <option>Litre</option>
                  <option>Meter</option>
                  <option>Dozen</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Work Orders</label>
              <textarea
                id="bom-work-orders"
                value={form.workOrders}
                onChange={(e) => update("workOrders", e.target.value)}
                placeholder="Additional manufacturing details..."
                rows={3}
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Version</label>
              <input
                type="text"
                value="1"
                readOnly
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-surface-200 bg-surface-50/50 flex items-center justify-between">
            <button
              onClick={() => navigate("/bom")}
              className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-200 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              id="bom-save-button"
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg transition-all"
            >
              Save BoM
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}