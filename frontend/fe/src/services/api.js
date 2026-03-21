const API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("plm_token");
}

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (e) {
    if (e?.name === "TypeError") {
      throw new Error(`Cannot reach API at ${API_BASE}. Is the backend running on port 5000?`);
    }
    throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || "Request failed");
  return data;
}

const api = {
  auth: {
    login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
    users: () => request("/auth/users"),
    updateUser: (id, payload) => request(`/auth/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteUser: (id) => request(`/auth/users/${id}`, { method: "DELETE" }),
    clearUsers: () => request("/auth/users", { method: "DELETE" }),
    resetPassword: (payload) => request("/auth/reset-password", { method: "PATCH", body: JSON.stringify(payload) }),
    forgotPassword: (email) =>
      request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPasswordWithOtp: (email, otp, newPassword) =>
      request("/auth/reset-password-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      }),
  },
  products: {
    list: () => request("/products"),
    create: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
    remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
    clear: () => request("/products", { method: "DELETE" }),
  },
  boms: {
    list: () => request("/boms"),
    detail: (id) => request(`/boms/${id}`),
    create: (payload) => request("/boms", { method: "POST", body: JSON.stringify(payload) }),
    remove: (id) => request(`/boms/${id}`, { method: "DELETE" }),
    clear: () => request("/boms", { method: "DELETE" }),
  },
  ecos: {
    list: () => request("/ecos"),
    create: (payload) => request("/ecos", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/ecos/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => request(`/ecos/${id}`, { method: "DELETE" }),
    adminRemove: (id) => request(`/ecos/admin/${id}`, { method: "DELETE" }),
    clear: () => request("/ecos/admin/all", { method: "DELETE" }),
    updateStatus: (id, status) => request(`/ecos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    approve: (id) => request(`/ecos/${id}/approve`, { method: "PATCH" }),
    reject: (id) => request(`/ecos/${id}/reject`, { method: "PATCH" }),
  },
};

export default api;