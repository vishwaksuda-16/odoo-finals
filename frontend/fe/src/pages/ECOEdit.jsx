import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function ECOEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canCreate } = useAuth();
  const { ecos, products, boms, updateEco, startEco } = useData();
  const eco = ecos.find((e) => e.id === id);

  const [form, setForm] = useState({
    title: "",
    ecoType: "Product",
    productId: "",
    bomId: "",
    newSalePrice: "",
    newCostPrice: "",
  });
  const [componentDraft, setComponentDraft] = useState({ componentName: "", quantity: "" });
  const [componentChanges, setComponentChanges] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!eco) return;
    const changes = eco.proposedChanges || {};
    setForm({
      title: eco.title || "",
      ecoType: eco.ecoType || "Product",
      productId: eco.productId || "",
      bomId: eco.bomId || "",
      newSalePrice: typeof changes.salePrice !== "undefined" ? String(changes.salePrice) : "",
      newCostPrice: typeof changes.costPrice !== "undefined" ? String(changes.costPrice) : "",
    });
    setComponentChanges(
      (changes.components || []).map((c) => ({
        componentName: c.componentName || c.name || "",
        quantity: c.quantity || c.qty || "",
      }))
    );
  }, [eco]);

  if (!eco) {
    return (
      <Layout title="ECO Not Found">
        <div className="text-center py-16">
          <p className="text-surface-600">ECO not found.</p>
        </div>
      </Layout>
    );
  }

  const isDraft = useMemo(() => eco.stage === "Draft", [eco.stage]);

  useEffect(() => {
    if (!isDraft) navigate(`/ecos/${eco.id}`);
  }, [isDraft, navigate, eco.id]);

  if (!isDraft) return null;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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

  const selectedProduct = products.find((p) => p.id === form.productId);

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

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.productId) errs.productId = "Product is required";
    if (form.ecoType === "Product" && !form.newSalePrice && !form.newCostPrice) {
      errs.proposedChanges = "Set at least one product attribute change";
    }
    if (form.ecoType === "BoM" && componentChanges.length === 0) {
      errs.proposedChanges = "Add at least one component change";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async (andStart = false) => {
    if (!canCreate) return;
    if (!validate()) return;
    await updateEco(id, {
      title: form.title.trim(),
      ecoType: form.ecoType,
      productId: form.productId,
      proposedChanges: buildProposedChanges(),
    });
    if (andStart) {
      await startEco(id);
    }
    navigate(`/ecos/${id}`);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-danger-500 focus:ring-danger-500/30 bg-danger-500/5"
        : "border-surface-200 focus:ring-primary-500/30 focus:border-primary-400"
    }`;

  return (
    <Layout title="Edit Draft ECO">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
          <h2 className="text-lg font-bold text-surface-900">Edit Draft ECO</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Title *</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass("title")} />
            {errors.title && <p className="mt-1.5 text-xs text-danger-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">ECO Type *</label>
            <select value={form.ecoType} onChange={(e) => update("ecoType", e.target.value)} className={inputClass("ecoType")}>
              <option value="Product">Product</option>
              <option value="BoM">BoM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">Product *</label>
            <select value={form.productId} onChange={(e) => update("productId", e.target.value)} className={inputClass("productId")}>
              <option value="">Select Product</option>
              {products.filter((p) => p.status === "Active").map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.productId && <p className="mt-1.5 text-xs text-danger-500">{errors.productId}</p>}
          </div>

          {form.ecoType === "Product" && (
            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.01" min="0" placeholder="New Sale Price" value={form.newSalePrice} onChange={(e) => update("newSalePrice", e.target.value)} className={inputClass("newSalePrice")} />
              <input type="number" step="0.01" min="0" placeholder="New Cost Price" value={form.newCostPrice} onChange={(e) => update("newCostPrice", e.target.value)} className={inputClass("newCostPrice")} />
            </div>
          )}

          {form.ecoType === "BoM" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={componentDraft.componentName}
                  onChange={(e) => setComponentDraft((prev) => ({ ...prev, componentName: e.target.value }))}
                  placeholder="Component"
                  className="sm:col-span-2 w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={componentDraft.quantity}
                    onChange={(e) => setComponentDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Qty"
                    className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                  />
                  <button type="button" onClick={addComponentChange} className="px-4 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700">Add</button>
                </div>
              </div>
              {componentChanges.length > 0 && (
                <div className="mt-3 space-y-2">
                  {componentChanges.map((c, idx) => (
                    <div key={`${c.componentName}-${idx}`} className="flex items-center justify-between bg-surface-50 border border-surface-200 px-3 py-2 rounded-lg">
                      <p className="text-sm text-surface-700">{c.componentName} - Qty {c.quantity}</p>
                      <button type="button" onClick={() => removeComponentChange(idx)} className="text-xs text-danger-600 hover:text-danger-700">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {errors.proposedChanges && <p className="text-xs text-danger-500">{errors.proposedChanges}</p>}
        </div>
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50/50 flex items-center justify-between">
          <button onClick={() => navigate(`/ecos/${id}`)} className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-200 rounded-xl transition-colors">Cancel</button>
          <div className="flex gap-3">
            <button onClick={() => handleUpdate(false)} className="px-5 py-2.5 text-sm font-semibold bg-white border border-surface-300 text-surface-700 rounded-xl hover:bg-surface-50 transition-colors shadow-sm">Update Draft</button>
            <button onClick={() => handleUpdate(true)} className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all">Update & Start</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
