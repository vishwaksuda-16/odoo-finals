import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext(null);

const INITIAL_PRODUCTS = [
  { id: "p1", name: "Wooden Table", salesPrice: 299.99, costPrice: 150.00, status: "Active", version: 1, attachments: [], createdAt: "2026-01-15" },
  { id: "p2", name: "Office Chair", salesPrice: 449.99, costPrice: 220.00, status: "Active", version: 2, attachments: [], createdAt: "2026-01-20" },
  { id: "p3", name: "Metal Shelf", salesPrice: 189.99, costPrice: 85.00, status: "Archived", version: 1, attachments: [], createdAt: "2026-02-01" },
  { id: "p4", name: "Standing Desk", salesPrice: 599.99, costPrice: 310.00, status: "Active", version: 1, attachments: [], createdAt: "2026-02-10" },
];

const INITIAL_BOMS = [
  { id: "b1", bomNumber: "BOM-001", finishedProduct: "p1", productName: "Wooden Table", reference: "WT-BOM-A", quantity: 1, stockLocation: "Warehouse A", version: 1, unitOfMeasure: "Unit", workOrders: "Assembly Line 1", status: "Active", components: [
    { name: "Wood Panel", quantity: 4, unit: "pcs" },
    { name: "Screws", quantity: 16, unit: "pcs" },
    { name: "Wood Glue", quantity: 1, unit: "bottle" },
    { name: "Leg Set", quantity: 4, unit: "pcs" },
  ]},
  { id: "b2", bomNumber: "BOM-002", finishedProduct: "p2", productName: "Office Chair", reference: "OC-BOM-A", quantity: 1, stockLocation: "Warehouse B", version: 1, unitOfMeasure: "Unit", workOrders: "Assembly Line 2", status: "Active", components: [
    { name: "Seat Cushion", quantity: 1, unit: "pcs" },
    { name: "Back Rest", quantity: 1, unit: "pcs" },
    { name: "Wheel Set", quantity: 5, unit: "pcs" },
    { name: "Gas Cylinder", quantity: 1, unit: "pcs" },
    { name: "Armrest", quantity: 2, unit: "pcs" },
  ]},
  { id: "b3", bomNumber: "BOM-003", finishedProduct: "p3", productName: "Metal Shelf", reference: "MS-BOM-A", quantity: 1, stockLocation: "Warehouse A", version: 1, unitOfMeasure: "Unit", workOrders: "Assembly Line 3", status: "Archived", components: [
    { name: "Metal Frame", quantity: 2, unit: "pcs" },
    { name: "Shelf Panel", quantity: 5, unit: "pcs" },
    { name: "Bolts", quantity: 20, unit: "pcs" },
  ]},
];

const INITIAL_ECOS = [
  {
    id: "eco1", title: "Change Screws", ecoType: "BoM", productId: "p1", productName: "Wooden Table",
    bomId: "b1", bomName: "BOM-001", userId: "u1", userName: "admin1",
    effectiveDate: "2026-03-01T10:00", versionUpdate: true, stage: "Done", status: "Approved",
    createdAt: "2026-02-15",
    changes: {
      bom: [
        { component: "Screws", oldQty: 16, newQty: 20, operation: "Modified" },
        { component: "Lock Washers", oldQty: 0, newQty: 20, operation: "Added" },
      ],
      product: []
    }
  },
  {
    id: "eco2", title: "Update Chair Price", ecoType: "Product", productId: "p2", productName: "Office Chair",
    bomId: null, bomName: null, userId: "u2", userName: "engineer1",
    effectiveDate: "2026-03-10T14:00", versionUpdate: true, stage: "Approval", status: "Pending",
    createdAt: "2026-02-20",
    changes: {
      bom: [],
      product: [
        { field: "Sales Price", oldValue: "$399.99", newValue: "$449.99", status: "Modified" },
        { field: "Cost Price", oldValue: "$200.00", newValue: "$220.00", status: "Modified" },
      ]
    }
  },
  {
    id: "eco3", title: "Add Desk Components", ecoType: "BoM", productId: "p4", productName: "Standing Desk",
    bomId: null, bomName: null, userId: "u1", userName: "admin1",
    effectiveDate: "", versionUpdate: false, stage: "New", status: "Draft",
    createdAt: "2026-03-05",
    changes: {
      bom: [
        { component: "Motor Unit", oldQty: 0, newQty: 1, operation: "Added" },
        { component: "Controller Board", oldQty: 0, newQty: 1, operation: "Added" },
      ],
      product: []
    }
  },
];

const INITIAL_STAGES = [
  { id: "s1", name: "New", order: 1 },
  { id: "s2", name: "Approval", order: 2 },
  { id: "s3", name: "Done", order: 3 },
];

const INITIAL_APPROVALS = [
  { id: "a1", userId: "u3", userName: "approver1", approvalType: "Required", stageId: "s2" },
  { id: "a2", userId: "u1", userName: "admin1", approvalType: "Optional", stageId: "s2" },
];

function loadState(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }) {
  const [products, setProducts] = useState(() => loadState("plm_products", INITIAL_PRODUCTS));
  const [boms, setBoms] = useState(() => loadState("plm_boms", INITIAL_BOMS));
  const [ecos, setEcos] = useState(() => loadState("plm_ecos", INITIAL_ECOS));
  const [stages, setStages] = useState(() => loadState("plm_stages", INITIAL_STAGES));
  const [approvals, setApprovals] = useState(() => loadState("plm_approvals", INITIAL_APPROVALS));

  useEffect(() => { localStorage.setItem("plm_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("plm_boms", JSON.stringify(boms)); }, [boms]);
  useEffect(() => { localStorage.setItem("plm_ecos", JSON.stringify(ecos)); }, [ecos]);
  useEffect(() => { localStorage.setItem("plm_stages", JSON.stringify(stages)); }, [stages]);
  useEffect(() => { localStorage.setItem("plm_approvals", JSON.stringify(approvals)); }, [approvals]);

  // ── Products CRUD ──
  const addProduct = (product) => {
    const newProduct = { ...product, id: "p" + Date.now(), version: 1, status: "Active", createdAt: new Date().toISOString().split("T")[0] };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // ── BoM CRUD ──
  const addBom = (bom) => {
    const newBom = { ...bom, id: "b" + Date.now(), version: 1, status: "Active", components: bom.components || [] };
    setBoms((prev) => [...prev, newBom]);
    return newBom;
  };

  const updateBom = (id, updates) => {
    setBoms((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // ── ECO CRUD ──
  const addEco = (eco) => {
    const newEco = {
      ...eco,
      id: "eco" + Date.now(),
      stage: "Draft",
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      changes: { bom: [], product: [] },
    };
    setEcos((prev) => [...prev, newEco]);
    return newEco;
  };

  const updateEco = (id, updates) => {
    setEcos((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const startEco = (id) => {
    setEcos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, stage: "New", status: "In Progress" } : e))
    );
  };

  const approveEco = (id) => {
    setEcos((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, stage: "Done", status: "Approved" };
        // Handle version update
        if (e.versionUpdate) {
          if (e.ecoType === "Product") {
            setProducts((prods) =>
              prods.map((p) =>
                p.id === e.productId ? { ...p, version: p.version + 1 } : p
              )
            );
          } else if (e.ecoType === "BoM" && e.bomId) {
            setBoms((bs) =>
              bs.map((b) =>
                b.id === e.bomId ? { ...b, version: b.version + 1 } : b
              )
            );
          }
        }
        return updated;
      })
    );
  };

  const moveEcoToApproval = (id) => {
    setEcos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, stage: "Approval", status: "Pending" } : e))
    );
  };

  // ── Stages CRUD ──
  const addStage = (stage) => {
    const newStage = { ...stage, id: "s" + Date.now() };
    setStages((prev) => [...prev, newStage]);
    return newStage;
  };

  // ── Approvals CRUD ──
  const addApproval = (approval) => {
    const newApproval = { ...approval, id: "a" + Date.now() };
    setApprovals((prev) => [...prev, newApproval]);
    return newApproval;
  };

  const removeApproval = (id) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        products, addProduct, updateProduct,
        boms, addBom, updateBom,
        ecos, addEco, updateEco, startEco, approveEco, moveEcoToApproval,
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
