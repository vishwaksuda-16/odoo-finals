const API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("plm_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || "Request failed");
  return data;
}

const api = {
  auth: {
    login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
    users: () => request("/auth/users"),
    resetPassword: (payload) => request("/auth/reset-password", { method: "PATCH", body: JSON.stringify(payload) }),
  },
  products: {
    list: () => request("/products"),
    create: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  },
  boms: {
    list: () => request("/boms"),
    detail: (id) => request(`/boms/${id}`),
    create: (payload) => request("/boms", { method: "POST", body: JSON.stringify(payload) }),
  },
  ecos: {
    list: () => request("/ecos"),
    create: (payload) => request("/ecos", { method: "POST", body: JSON.stringify(payload) }),
    updateStatus: (id, status) => request(`/ecos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    approve: (id) => request(`/ecos/${id}/approve`, { method: "PATCH" }),
  },
};

export default api;