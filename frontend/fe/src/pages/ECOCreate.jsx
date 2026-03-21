import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export default function ECOCreate() {
  const { user, canCreate, canStart } = useAuth();
  const { products, boms, addEco } = useData();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isReadOnlyRole = role === "approver";

  const [form, setForm] = useState({
    title: "",
    ecoType: "Product",
    productId: "",
    bomId: "",
    effectiveDate: "",
    versionUpdate: false,
    newSalePrice: "",
    newCostPrice: "",
  });
  const [componentDraft, setComponentDraft] = useState({ componentName: "", quantity: "" });
  const [componentChanges, setComponentChanges] = useState([]);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    if (isReadOnlyRole) return; // Block edits for unauthorized role
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "ecoType" && value !== "BoM") {
        next.bomId = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.productId) errs.productId = "Product is required";
    if (form.ecoType === "BoM" && !form.bomId) errs.bomId = "Bill of Materials is required";
    if (form.ecoType === "Product" && !form.newSalePrice && !form.newCostPrice) {
      errs.proposedChanges = "Set at least one product attribute change";
    }
    if (form.ecoType === "BoM" && componentChanges.length === 0) {
      errs.proposedChanges = "Add at least one component change";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedProduct = products.find((p) => p.id === form.productId);
  const selectedBom = boms.find((b) => b.id === form.bomId);

  const addComponentChange = () => {
    const componentName = componentDraft.componentName.trim();
    const quantity = parseInt(componentDraft.quantity, 10);
    if (!componentName || !quantity || quantity <= 0) return;
    setComponentChanges((prev) => [...prev, { componentName, quantity }]);
    setComponentDraft({ componentName: "", quantity: "" });
    setErrors((prev) => ({ ...prev, proposedChanges: "" }));
  };

  const removeComponentChange = (index) => {
    setComponentChanges((prev) => prev.filter((_, i) => i !== index));
  };

  const buildProposedChanges = () => {
    if (form.ecoType === "BoM") {
      return {
        components: componentChanges.map((c) => ({ componentName: c.componentName, quantity: c.quantity })),
      };
    }
    const payload = {};
    if (form.newSalePrice !== "") {
      payload.salePrice = parseFloat(form.newSalePrice);
      payload.oldSalePrice = selectedProduct?.salesPrice ?? null;
    }
    if (form.newCostPrice !== "") {
      payload.costPrice = parseFloat(form.newCostPrice);
      payload.oldCostPrice = selectedProduct?.costPrice ?? null;
    }
    return payload;
  };

  const handleSave = async () => {
    if (!canCreate) return;
    if (!validate()) return;
    const eco = await addEco({
      title: form.title.trim(),
      ecoType: form.ecoType,
      productId: form.productId,
      productName: selectedProduct?.name || "",
      bomId: form.ecoType === "BoM" ? form.bomId : null,
      bomName: form.ecoType === "BoM" ? selectedBom?.bomNumber || "" : null,
      userId: user?.id || "",
      userName: user?.loginId || "",
      effectiveDate: form.effectiveDate,
      versionUpdate: form.versionUpdate,
      proposedChanges: buildProposedChanges(),
    });
    setSaved(true);
    navigate(`/ecos/${eco.id}`);
  };

  const handleStart = async () => {
    if (!canStart) return;
    if (!validate()) return;
    const eco = await addEco({
      title: form.title.trim(),
      ecoType: form.ecoType,
      productId: form.productId,
      productName: selectedProduct?.name || "",
      bomId: form.ecoType === "BoM" ? form.bomId : null,
      bomName: form.ecoType === "BoM" ? selectedBom?.bomNumber || "" : null,
      userId: user?.id || "",
      userName: user?.loginId || "",
      effectiveDate: form.effectiveDate,
      versionUpdate: form.versionUpdate,
      proposedChanges: buildProposedChanges(),
    });
    setTimeout(() => {
      navigate(`/ecos/${eco.id}?start=true`);
    }, 0);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-danger-500 focus:ring-danger-500/30 bg-danger-500/5"
        : "border-surface-200 focus:ring-primary-500/30 focus:border-primary-400"
    } ${isReadOnlyRole ? "bg-surface-50 text-surface-500 cursor-not-allowed" : ""}`;

  return (
    <Layout title="Create ECO">
      <div className="max-w-2xl mx-auto">
        {/* RBAC banner for unauthorized users */}
        {isReadOnlyRole && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Read-only Access</p>
              <p className="text-xs text-amber-600">Approver role cannot create or edit ECOs. Switch to Engineer or Admin to make changes.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">New Engineering Change Order</h2>
            <p className="text-sm text-surface-500 mt-1">Fill in the required fields marked with <span className="text-primary-600 font-bold">*</span></p>
          </div>

          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Title *</label>
              <input
                id="eco-title"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Enter ECO title"
                className={inputClass("title")}
                readOnly={isReadOnlyRole}
              />
              {errors.title && <p className="mt-1.5 text-xs text-danger-500">{errors.title}</p>}
            </div>

            {/* ECO Type */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">ECO Type *</label>
              <select
                id="eco-type"
                value={form.ecoType}
                onChange={(e) => update("ecoType", e.target.value)}
                disabled={isReadOnlyRole}
                className={`w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 bg-white ${isReadOnlyRole ? "bg-surface-50 text-surface-500 cursor-not-allowed" : ""}`}
              >
                <option value="Product">Product</option>
                <option value="BoM">BoM</option>
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Product *</label>
              <select
                id="eco-product"
                value={form.productId}
                onChange={(e) => update("productId", e.target.value)}
                disabled={isReadOnlyRole}
                className={inputClass("productId")}
              >
                <option value="">Select Product</option>
                {products.filter((p) => p.status === "Active").map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.productId && <p className="mt-1.5 text-xs text-danger-500">{errors.productId}</p>}
            </div>

            {/* BoM - Only visible when ECO Type = BoM */}
            {form.ecoType === "BoM" && (
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Bill of Materials *</label>
                <select
                  id="eco-bom"
                  value={form.bomId}
                  onChange={(e) => update("bomId", e.target.value)}
                  disabled={isReadOnlyRole}
                  className={inputClass("bomId")}
                >
                  <option value="">Select BoM</option>
                  {boms.filter((b) => b.status === "Active").map((b) => (
                    <option key={b.id} value={b.id}>{b.bomNumber} — {b.productName}</option>
                  ))}
                </select>
                {errors.bomId && <p className="mt-1.5 text-xs text-danger-500">{errors.bomId}</p>}
              </div>
            )}

            {form.ecoType === "Product" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">New Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.newSalePrice}
                    onChange={(e) => update("newSalePrice", e.target.value)}
                    disabled={isReadOnlyRole}
                    className={inputClass("newSalePrice")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-2">New Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.newCostPrice}
                    onChange={(e) => update("newCostPrice", e.target.value)}
                    disabled={isReadOnlyRole}
                    className={inputClass("newCostPrice")}
                  />
                </div>
              </div>
            )}

            {form.ecoType === "BoM" && (
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Component Changes</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={componentDraft.componentName}
                    onChange={(e) => setComponentDraft((prev) => ({ ...prev, componentName: e.target.value }))}
                    placeholder="Component"
                    disabled={isReadOnlyRole}
                    className="sm:col-span-2 w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={componentDraft.quantity}
                      onChange={(e) => setComponentDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                      placeholder="Qty"
                      disabled={isReadOnlyRole}
                      className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                    />
                    <button
                      type="button"
                      onClick={addComponentChange}
                      disabled={isReadOnlyRole}
                      className="px-4 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {componentChanges.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {componentChanges.map((c, idx) => (
                      <div key={`${c.componentName}-${idx}`} className="flex items-center justify-between bg-surface-50 border border-surface-200 px-3 py-2 rounded-lg">
                        <p className="text-sm text-surface-700">{c.componentName} - Qty {c.quantity}</p>
                        {!isReadOnlyRole && (
                          <button type="button" onClick={() => removeComponentChange(idx)} className="text-xs text-danger-600 hover:text-danger-700">
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errors.proposedChanges && <p className="text-xs text-danger-500">{errors.proposedChanges}</p>}

            {/* User (auto-filled) */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">User *</label>
              <input
                type="text"
                value={user?.loginId || ""}
                readOnly
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
              />
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Effective Date</label>
              <input
                id="eco-date"
                type="datetime-local"
                value={form.effectiveDate}
                onChange={(e) => update("effectiveDate", e.target.value)}
                readOnly={isReadOnlyRole}
                className={`w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 ${isReadOnlyRole ? "bg-surface-50 text-surface-500 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Version Update */}
            <div className="flex items-center gap-3 py-2">
              <input
                id="eco-version-update"
                type="checkbox"
                checked={form.versionUpdate}
                onChange={(e) => update("versionUpdate", e.target.checked)}
                disabled={isReadOnlyRole}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500/30"
              />
              <label htmlFor="eco-version-update" className="text-sm font-medium text-surface-700">
                Version Update
              </label>
              <span className="text-xs text-surface-400">(Creates a new version on approval)</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 py-4 border-t border-surface-200 bg-surface-50/50 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {/* Save — visible for Engineer & Admin */}
              {canCreate && (
                <button
                  onClick={handleSave}
                  id="eco-save-button"
                  className="px-5 py-2.5 text-sm font-semibold bg-white border border-surface-300 text-surface-700 rounded-xl hover:bg-surface-50 transition-colors shadow-sm"
                >
                  Save as Draft
                </button>
              )}
              {/* Start — visible for Engineer & Admin only */}
              {canCreate && (
                <button
                  onClick={handleStart}
                  id="eco-start-button"
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all"
                >
                  Start →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}