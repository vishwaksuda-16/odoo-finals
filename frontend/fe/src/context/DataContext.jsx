import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

const toUiStatus = (status) => {
  if (status === "DRAFT") return { stage: "Draft", status: "Draft" };
  if (status === "REJECTED") return { stage: "Draft", status: "Rejected" };
  if (status === "NEW") return { stage: "New", status: "In Progress" };
  if (status === "PENDING") return { stage: "Approval", status: "Pending" };
  if (status === "APPROVED") return { stage: "Done", status: "Approved" };
  return { stage: "Draft", status: "Draft" };
};

const numOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const bomLineOperation = (c) => {
  const newQty = numOrNull(c.quantity ?? c.qty);
  const oldQty = numOrNull(c.oldQuantity);
  if (oldQty === null && newQty !== null) return "Added";
  if (oldQty !== null && newQty === null) return "Removed";
  if (oldQty !== null && newQty !== null) {
    if (oldQty === newQty) return "Unmodified";
    return "Modified";
  }
  return "Modified";
};

const valuesEqual = (a, b) => numOrNull(a) === numOrNull(b);

const toEcoChanges = (eco) => {
  const changes = eco?.proposedChanges || {};
  if (eco?.type === "BOM") {
    const bomRows = (changes.components || []).map((c) => {
      const oldQ = c.oldQuantity;
      const newQ = c.quantity ?? c.qty;
      return {
        component: c.componentName || c.name || "",
        oldQty: oldQ != null && oldQ !== "" ? oldQ : "—",
        newQty: newQ != null && newQ !== "" ? newQ : "—",
        operation: bomLineOperation(c),
      };
    });
    return { product: [], bom: bomRows };
  }

  const productRows = [];
  if (typeof changes.salePrice !== "undefined") {
    const oldV = changes.oldSalePrice;
    const newV = changes.salePrice;
    productRows.push({
      field: "Sale Price",
      oldValue: oldV ?? "—",
      newValue: newV,
      status: valuesEqual(oldV, newV) ? "Unmodified" : "Modified",
    });
  }
  if (typeof changes.costPrice !== "undefined") {
    const oldV = changes.oldCostPrice;
    const newV = changes.costPrice;
    productRows.push({
      field: "Cost Price",
      oldValue: oldV ?? "—",
      newValue: newV,
      status: valuesEqual(oldV, newV) ? "Unmodified" : "Modified",
    });
  }
  return { product: productRows, bom: [] };
};

export function DataProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [ecos, setEcos] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [stages, setStages] = useState([]);

  const loadAll = useCallback(async () => {
    try {
      const [productRows, bomRows, ecoRows, workflow] = await Promise.all([
        api.products.list(),
        api.boms.list(),
        api.ecos.list(),
        api.settings.workflow().catch(() => ({ stages: [], rules: [] })),
      ]);

      setStages(workflow?.stages || []);
      setApprovals(workflow?.rules || []);

      setProducts(
        (productRows || []).map((p) => {
          const active = (p.versions || []).find((v) => v.status === "ACTIVE") || (p.versions || [])[0];
          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            archived: !!p.archived,
            salesPrice: active?.salePrice || 0,
            costPrice: active?.costPrice || 0,
            status: p.archived ? "Archived" : (active?.status === "ACTIVE" ? "Active" : "Archived"),
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
            proposedChanges: e.proposedChanges || {},
            userId: e.createdById,
            userName: e.createdBy?.name || e.createdBy?.email || "",
            effectiveDate: "",
            versionUpdate: true,
            stage: mapped.stage,
            status: mapped.status,
            createdAt: new Date(e.createdAt).toISOString().split("T")[0],
            changes: toEcoChanges(e),
          };
        })
      );
    } catch {
      setProducts([]);
      setBoms([]);
      setEcos([]);
      setApprovals([]);
      setStages([]);
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
      setStages([]);
    }
  }, [loadAll, user]);

  // ── Products CRUD ──
  const addProduct = async (product) => {
    const sku = `${product.name}`.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8) || `SKU${Date.now()}`;
    const created = await api.products.create({
      sku,
      name: product.name,
      initialSalePrice: product.salesPrice,
      initialCostPrice: product.costPrice,
    });
    if (product.bomComponents?.length) {
      await api.boms.create({
        productId: created?.product?.id,
        components: product.bomComponents.map((c) => ({
          componentName: c.componentName,
          quantity: c.quantity,
        })),
      });
    }
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
      proposedChanges: eco.proposedChanges || {},
    });
    await loadAll();
    return { id: created.id };
  };

  const updateEco = async (id, eco) => {
    await api.ecos.update(id, {
      title: eco.title,
      type: eco.ecoType === "BoM" ? "BOM" : "PRODUCT",
      productId: eco.productId,
      proposedChanges: eco.proposedChanges || {},
    });
    await loadAll();
  };

  const deleteEco = async (id) => {
    if (isAdmin) {
      await api.ecos.adminRemove(id);
    } else {
      await api.ecos.remove(id);
    }
    await loadAll();
  };

  const clearEcos = async () => {
    await api.ecos.clear();
    await loadAll();
  };

  const deleteProduct = async (id) => {
    await api.products.remove(id);
    await loadAll();
  };

  const archiveProduct = async (id) => {
    await api.products.archive(id);
    await loadAll();
  };

  const unarchiveProduct = async (id) => {
    await api.products.unarchive(id);
    await loadAll();
  };

  const clearProducts = async () => {
    await api.products.clear();
    await loadAll();
  };

  const deleteBom = async (id) => {
    await api.boms.remove(id);
    await loadAll();
  };

  const clearBoms = async () => {
    await api.boms.clear();
    await loadAll();
  };

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

  // ── Stages CRUD (admin) ──
  const addStage = async ({ name, order, pipelineKind }) => {
    await api.settings.createStage({ name, order, pipelineKind });
    await loadAll();
  };

  const updateStage = async (id, payload) => {
    await api.settings.updateStage(id, payload);
    await loadAll();
  };

  const removeStage = async (id) => {
    await api.settings.deleteStage(id);
    await loadAll();
  };

  // ── Approvals CRUD (admin) ──
  const addApproval = async ({ userId, approvalType, stageId, productId }) => {
    await api.settings.createApprovalRule({
      userId,
      approvalType,
      stageId,
      ...(productId ? { productId } : {}),
    });
    await loadAll();
  };

  const removeApproval = async (id) => {
    await api.settings.deleteApprovalRule(id);
    await loadAll();
  };

  return (
    <DataContext.Provider
      value={{
        products, addProduct, updateProduct, deleteProduct, archiveProduct, unarchiveProduct, clearProducts,
        boms, addBom, updateBom, deleteBom, clearBoms,
        ecos, addEco, updateEco, deleteEco, clearEcos, startEco, approveEco, rejectEco, moveEcoToApproval,
        stages, addStage, updateStage, removeStage,
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
