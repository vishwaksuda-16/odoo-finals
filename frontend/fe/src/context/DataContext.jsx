import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

const STAGES = [
  { id: "s1", name: "New", order: 1 },
  { id: "s2", name: "Approval", order: 2 },
  { id: "s3", name: "Done", order: 3 },
];

const toUiStatus = (status) => {
  if (status === "DRAFT") return { stage: "Draft", status: "Draft" };
  if (status === "NEW") return { stage: "New", status: "In Progress" };
  if (status === "PENDING") return { stage: "Approval", status: "Pending" };
  if (status === "APPROVED") return { stage: "Done", status: "Approved" };
  return { stage: "Draft", status: "Draft" };
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [ecos, setEcos] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const stages = STAGES;

  const loadAll = useCallback(async () => {
    try {
      const [productRows, bomRows, ecoRows] = await Promise.all([
        api.products.list(),
        api.boms.list(),
        api.ecos.list(),
      ]);

      setProducts(
        (productRows || []).map((p) => {
          const active = (p.versions || []).find((v) => v.status === "ACTIVE");
          return {
            id: p.id,
            name: p.name,
            salesPrice: active?.salePrice || 0,
            costPrice: active?.costPrice || 0,
            status: active?.status === "ACTIVE" ? "Active" : "Archived",
            version: active?.versionNumber || 1,
            attachments: [],
            createdAt: p.createdAt,
          };
        })
      );

      setBoms(
        (bomRows || []).map((b, idx) => ({
          id: b.id,
          bomNumber: `BOM-${String(idx + 1).padStart(3, "0")}`,
          finishedProduct: b.productId,
          productName: b.product?.name || "",
          reference: `BOM-${(b.product?.sku || "REF").slice(0, 5)}`,
          quantity: 1,
          stockLocation: "",
          version: b.versionNumber,
          unitOfMeasure: "Unit",
          workOrders: "",
          status: b.status === "ACTIVE" ? "Active" : "Archived",
          components: (b.components || []).map((c) => ({ name: c.componentName, quantity: c.quantity, unit: "pcs" })),
        }))
      );

      setEcos(
        (ecoRows || []).map((e) => {
          const mapped = toUiStatus(e.status);
          return {
            id: e.id,
            title: e.title,
            ecoType: e.type === "BOM" ? "BoM" : "Product",
            productId: e.productId,
            productName: e.product?.name || "",
            bomId: null,
            bomName: null,
            userId: e.createdById,
            userName: e.createdBy?.name || e.createdBy?.email || "",
            effectiveDate: "",
            versionUpdate: true,
            stage: mapped.stage,
            status: mapped.status,
            createdAt: new Date(e.createdAt).toISOString().split("T")[0],
            changes: { bom: [], product: [] },
          };
        })
      );
    } catch {
      setProducts([]);
      setBoms([]);
      setEcos([]);
      setApprovals([]);
    }
  }, []);

  useEffect(() => {
    if (user && localStorage.getItem("plm_token")) {
      loadAll();
    } else {
      setProducts([]);
      setBoms([]);
      setEcos([]);
      setApprovals([]);
    }
  }, [loadAll, user]);

  // ── Products CRUD ──
  const addProduct = async (product) => {
    const sku = `${product.name}`.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8) || `SKU${Date.now()}`;
    await api.products.create({
      sku,
      name: product.name,
      initialSalePrice: product.salesPrice,
      initialCostPrice: product.costPrice,
    });
    await loadAll();
  };

  const updateProduct = () => {};

  // ── BoM CRUD ──
  const addBom = async (bom) => {
    await api.boms.create({
      productId: bom.finishedProduct,
      components: [],
    });
    await loadAll();
  };

  const updateBom = () => {};

  // ── ECO CRUD ──
  const addEco = async (eco) => {
    const created = await api.ecos.create({
      title: eco.title,
      type: eco.ecoType === "BoM" ? "BOM" : "PRODUCT",
      productId: eco.productId,
      proposedChanges: {},
    });
    await loadAll();
    return { id: created.id };
  };

  const updateEco = () => {};

  const startEco = async (id) => {
    await api.ecos.updateStatus(id, "NEW");
    await loadAll();
  };

  const approveEco = async (id) => {
    await api.ecos.approve(id);
    await loadAll();
  };
  const rejectEco = async (id) => {
    await api.ecos.reject(id);
    await loadAll();
  };

  const moveEcoToApproval = async (id) => {
    await api.ecos.updateStatus(id, "PENDING");
    await loadAll();
  };

  // ── Stages CRUD ──
  const addStage = () => {};

  // ── Approvals CRUD ──
  const addApproval = () => null;

  const removeApproval = () => null;

  return (
    <DataContext.Provider
      value={{
        products, addProduct, updateProduct,
        boms, addBom, updateBom,
        ecos, addEco, updateEco, startEco, approveEco, rejectEco, moveEcoToApproval,
        stages, addStage,
        approvals, addApproval, removeApproval,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
