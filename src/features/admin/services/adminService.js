import axios from "axios";

// Use the same backend URL env var as the rest of the app
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance
const adminAPI = axios.create({
  // Mount admin API client with /api prefix so existing endpoints use paths like /admin/...
  baseURL: API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, "")}/api` : undefined,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    console.log("AdminAPI Interceptor - Raw token from localStorage:", token); // Debug log

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "AdminAPI Request:",
        config.method?.toUpperCase(),
        config.url,
        "with token"
      ); // Debug log
      console.log(
        "AdminAPI - Authorization header:",
        config.headers.Authorization?.substring(0, 50) + "..."
      ); // Debug log
    } else {
      console.warn(
        "AdminAPI Request without token:",
        config.method?.toUpperCase(),
        config.url
      ); // Debug log
      console.warn("AdminAPI - localStorage adminToken is:", token); // Debug log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "AdminAPI Response Error:",
      error.response?.status,
      error.response?.statusText
    );
    console.error("AdminAPI Error details:", error.response?.data);

    if (error.response?.status === 401) {
      // Token expired or invalid for admin - clear admin auth.
      // Do NOT force a navigation here to avoid surprising redirects when non-admin
      // pages trigger a 401 from an admin request. Let the app route logic (AdminRoute)
      // handle redirects to /admin/login when an admin page is accessed.
      console.warn(
        "AdminAPI - 401 Unauthorized, clearing admin auth (no forced redirect)"
      );
      try {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      } catch (e) {
        console.warn("AdminAPI - could not clear localStorage", e);
      }
    }
    return Promise.reject(error);
  }
);

// ====================
// Admin API Methods
// ====================

export const AdminService = {
  // ==================== Auth ====================
  login: async (credentials) => {
    // Use the configured axios instance (baseURL already includes /api)
    const response = await adminAPI.post(`/auth/login`, credentials);
    console.log("AdminService.login - Raw response:", response); // Debug log
    console.log("AdminService.login - Response data:", response.data); // Debug log
    console.log(
      "AdminService.login - Token in response:",
      response.data?.data?.token
    ); // Debug log
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },

  // ==================== Dashboard ====================
  getDashboardStats: async () => {
    console.log(
      "AdminService.getDashboardStats - Making request to /admin/dashboard"
    );
    console.log("AdminService.getDashboardStats - API Base URL:", API_BASE_URL);
    const response = await adminAPI.get("/admin/dashboard");
    console.log(
      "AdminService.getDashboardStats - Response received:",
      response
    );
    console.log(
      "AdminService.getDashboardStats - Response.data:",
      response.data
    );
    return response.data;
  },

  // ==================== User Management ====================
  getAllUsers: async (params) => {
    console.log("AdminService.getAllUsers - Making request to /admin/users");
    console.log("AdminService.getAllUsers - Params:", params);
    const response = await adminAPI.get("/admin/users", { params });
    console.log("AdminService.getAllUsers - Response received:", response);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await adminAPI.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await adminAPI.post("/admin/users", userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await adminAPI.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminAPI.delete(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await adminAPI.patch(`/admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  updateUserStatus: async (userId, isActive, reason) => {
    const response = await adminAPI.patch(`/admin/users/${userId}/status`, {
      isActive,
      reason,
    });
    return response.data;
  },

  blockUser: async (userId, reason) => {
    const response = await adminAPI.post(`/admin/users/${userId}/block`, {
      reason,
    });
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await adminAPI.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  getUserActivities: async (userId, params) => {
    const response = await adminAPI.get(`/admin/users/${userId}/activities`, {
      params,
    });
    return response.data;
  },

  // ==================== Bulk Operations ====================
  bulkDeleteUsers: async (userIds) => {
    const response = await adminAPI.post("/admin/users/bulk-delete", {
      userIds,
    });
    return response.data;
  },

  bulkUpdateRole: async (userIds, role) => {
    const response = await adminAPI.post("/admin/users/bulk-update-role", {
      userIds,
      role,
    });
    return response.data;
  },

  exportUsers: async (params) => {
    const response = await adminAPI.get("/admin/users/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // ==================== Activity Logs ====================
  getActivities: async (params) => {
    const response = await adminAPI.get("/admin/activities", { params });
    return response.data;
  },

  // ==================== Certificate Management ====================
  getCertificates: async (params) => {
    const response = await adminAPI.get("/admin/certificates", { params });
    return response.data;
  },

  getCertificateById: async (certificateId) => {
    const response = await adminAPI.get(`/admin/certificates/${certificateId}`);
    return response.data;
  },

  verifyCertificate: async (certificateId) => {
    const response = await adminAPI.post(
      `/admin/certificates/${certificateId}/verify`
    );
    return response.data;
  },

  revokeCertificate: async (certificateId, data) => {
    const response = await adminAPI.post(
      `/admin/certificates/${certificateId}/revoke`,
      data
    );
    return response.data;
  },

  getCertificateActivities: async (certificateId, params) => {
    const response = await adminAPI.get(
      `/admin/certificates/${certificateId}/activities`,
      { params }
    );
    return response.data;
  },

  // ==================== LearnPass Management ====================
  getLearnPasses: async (params) => {
    const response = await adminAPI.get("/admin/learnpasses", { params });
    return response.data;
  },

  // ==================== NFT Portfolio ====================
  getNFTPortfolio: async (params) => {
    const response = await adminAPI.get("/admin/nft-portfolio", { params });
    return response.data;
  },

  // ==================== Portfolio Change Logs ====================
  getPortfolioChanges: async (params) => {
    const response = await adminAPI.get("/admin/portfolio-changes", { params });
    return response.data;
  },

  getLearnPassById: async (learnPassId) => {
    const response = await adminAPI.get(`/admin/learnpasses/${learnPassId}`);
    return response.data;
  },

  verifyLearnPass: async (learnPassId) => {
    const response = await adminAPI.post(
      `/admin/learnpasses/${learnPassId}/verify`
    );
    return response.data;
  },

  suspendLearnPass: async (learnPassId, data) => {
    const response = await adminAPI.post(
      `/admin/learnpasses/${learnPassId}/suspend`,
      data
    );
    return response.data;
  },

  reactivateLearnPass: async (learnPassId) => {
    const response = await adminAPI.post(
      `/admin/learnpasses/${learnPassId}/reactivate`
    );
    return response.data;
  },

  revokeLearnPass: async (learnPassId, data) => {
    const response = await adminAPI.post(
      `/admin/learnpasses/${learnPassId}/revoke`,
      data
    );
    return response.data;
  },

  getLearnPassActivities: async (learnPassId, params) => {
    const response = await adminAPI.get(
      `/admin/learnpasses/${learnPassId}/activities`,
      { params }
    );
    return response.data;
  },

  // ==================== Admin Wallet ====================
  getAdminWallet: async () => {
    const response = await adminAPI.get(`/admin/wallet`);
    return response.data;
  },

  upsertAdminWallet: async (payload) => {
    const response = await adminAPI.post(`/admin/wallet`, payload);
    return response.data;
  },

  // ==================== System ====================
  getSystemHealth: async () => {
    const response = await adminAPI.get("/admin/health");
    return response.data;
  },
};

export default AdminService;
