import axios from "axios";

// API Base URL - Backend Node.js (must be provided via environment)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {
              refreshToken,
            }
          );
          const {
            accessToken: maybeAccessToken,
            token: maybeToken,
            refreshToken: newRefreshToken,
          } = response.data.data || {};

          const accessToken = maybeAccessToken || maybeToken;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  // Authentication
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  logout: () => api.post("/api/auth/logout"),
  refreshToken: (refreshToken) =>
    api.post("/api/auth/refresh", { refreshToken }),

  // User profile
  getProfile: () => api.get("/api/auth/me"),

  // Email verification
  verifyEmail: (token) => api.post("/api/auth/verify-email", { token }),
  resendVerification: (email) =>
    api.post("/api/auth/resend-verification", { email }),

  // Password reset
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/api/auth/reset-password", { token, password }),
};

export const userAPI = {
  // User management
  getUsers: (params) => api.get("/api/users", { params }),
  getUserById: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),

  // Wallet management (legacy - keeping for backward compatibility)
  connectWallet: (walletData) => api.post("/api/users/wallet", walletData),
  disconnectWallet: (walletAddress) =>
    api.delete("/api/users/wallet", { data: { walletAddress } }),
  getWalletInfo: (walletAddress) =>
    api.get("/api/users/wallet", { params: { walletAddress } }),
  getCurrentUserWallet: () => api.get("/api/users/me/wallet"),
  // Get authenticated user's enrollments (purchased courses / access links)
  getMyEnrollments: (params) =>
    api.get("/api/partner/my-enrollments", { params }),
  // Get enrollment detail
  getEnrollment: (id) => api.get(`/api/enrollments/${id}`),
  // Update enrollment status (partner)
  updateEnrollmentStatus: (id, data) =>
    api.patch(`/api/enrollments/${id}/status`, data),
  // Add assessment (partner/seller) to an enrollment
  addEnrollmentAssessment: (id, data) =>
    api.post(`/api/enrollments/${id}/assessments`, data),
  updateEnrollmentAssessment: (id, aid, data) =>
    api.put(`/api/enrollments/${id}/assessments/${aid}`, data),
  deleteEnrollmentAssessment: (id, aid) =>
    api.delete(`/api/enrollments/${id}/assessments/${aid}`),
};

// New wallet API endpoints
export const walletAPI = {
  // Save wallet (idempotent)
  saveWallet: (walletData) => api.post("/api/wallet/save", walletData),

  // Delete wallet
  deleteWallet: (address) => api.post("/api/wallet/delete", { address }),

  // Check wallet exists
  checkWallet: (address) => api.post("/api/wallet/check", { address }),

  // Get user wallets
  getUserWallets: () => api.get("/api/wallet/user"),
};

export const institutionAPI = {
  // Institution management
  getInstitutions: (params) => api.get("/api/institutions", { params }),
  getInstitutionById: (id) => api.get(`/api/institutions/${id}`),
  createInstitution: (data) => api.post("/api/institutions", data),
  updateInstitution: (id, data) => api.put(`/api/institutions/${id}`, data),
  deleteInstitution: (id) => api.delete(`/api/institutions/${id}`),

  // Institution verification
  verifyInstitution: (id) => api.post(`/api/institutions/${id}/verify`),
  unverifyInstitution: (id) => api.post(`/api/institutions/${id}/unverify`),
};

export const learnPassAPI = {
  // LearnPass management
  getLearnPasses: (params) => api.get("/api/learnpass", { params }),
  getLearnPassById: (id) => api.get(`/api/learnpass/${id}`),
  createLearnPass: (data) => api.post("/api/learnpass", data),
  updateLearnPass: (id, data) => api.put(`/api/learnpass/${id}`, data),
  deleteLearnPass: (id) => api.delete(`/api/learnpass/${id}`),

  // LearnPass verification
  verifyLearnPass: (id) => api.post(`/api/learnpass/${id}/verify`),
  suspendLearnPass: (id, reason) =>
    api.post(`/api/learnpass/${id}/suspend`, { reason }),
  revokeLearnPass: (id, reason) =>
    api.post(`/api/learnpass/${id}/revoke`, { reason }),
};

export const certificateAPI = {
  // Certificate management
  getCertificates: (params) => api.get("/api/certificates", { params }),
  getCertificateById: (id) => api.get(`/api/certificates/${id}`),
  createCertificate: (data) => api.post("/api/certificates", data),
  updateCertificate: (id, data) => api.put(`/api/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/api/certificates/${id}`),

  // Certificate verification
  verifyCertificate: (id) => api.post(`/api/certificates/${id}/verify`),
  suspendCertificate: (id, reason) =>
    api.post(`/api/certificates/${id}/suspend`, { reason }),
  revokeCertificate: (id, reason) =>
    api.post(`/api/certificates/${id}/revoke`, { reason }),

  // Certificate search
  searchCertificates: (query, filters) =>
    api.get("/api/certificates/search", {
      params: { q: query, ...filters },
    }),
};

export const marketplaceAPI = {
  // Marketplace items
  getItems: (params) => api.get("/api/marketplace/items", { params }),
  getItemById: (id) => api.get(`/api/marketplace/items/${id}`),
  createItem: (data) => api.post("/api/marketplace/items", data),
  updateItem: (id, data) => api.put(`/api/marketplace/items/${id}`, data),
  deleteItem: (id) => api.delete(`/api/marketplace/items/${id}`),

  // Purchase
  purchaseItem: (id) => api.post(`/api/marketplace/items/${id}/purchase`),
  getPurchaseHistory: (params) =>
    api.get("/api/marketplace/purchases", { params }),
};

export const blockchainAPI = {
  // Network info
  getNetworkInfo: () => api.get("/api/blockchain/network-info"),

  // Wallet balance
  getWalletBalance: (address) =>
    api.get("/api/blockchain/wallet-balance", {
      params: { address },
    }),
  getEduTokenBalance: (address) =>
    api.get("/api/blockchain/edu-token-balance", {
      params: { address },
    }),

  // User registration on blockchain
  registerUser: (userData) =>
    api.post("/api/blockchain/register-user", userData),

  // Certificate issuance
  issueCertificate: (certificateData) =>
    api.post("/api/blockchain/issue-certificate", certificateData),

  // Metadata
  getLearnPassMetadata: (tokenId) =>
    api.get(`/api/blockchain/learnpass-metadata/${tokenId}`),
  getCertificateMetadata: (tokenId) =>
    api.get(`/api/blockchain/certificate-metadata/${tokenId}`),

  // Updates
  updateLearnPassMetadata: (tokenId, data) =>
    api.put(`/api/blockchain/update-learnpass/${tokenId}`, data),
  verifyCertificate: (tokenId) =>
    api.post(`/api/blockchain/verify-certificate/${tokenId}`),

  // Marketplace
  getMarketplaceItems: () => api.get("/api/blockchain/marketplace/items"),
  purchaseMarketplaceItem: (itemId) =>
    api.post(`/api/blockchain/marketplace/purchase/${itemId}`),

  // Token transfers
  transferEduTokens: (to, amount) =>
    api.post("/api/blockchain/transfer-edu-tokens", { to, amount }),

  // Transaction details
  getTransaction: (txHash) => api.get(`/api/blockchain/transaction/${txHash}`),

  // Get authenticated user's persisted transactions (paginated)
  // filters: { type, status }
  getMyTransactions: (page = 1, limit = 50, filters = {}) =>
    api.get(`/api/blockchain/transactions/me`, {
      params: {
        page,
        limit,
        ...filters,
      },
    }),

  // Persist blockchain transaction (frontend -> backend)
  saveTransaction: (record) => api.post("/api/blockchain/transactions", record),

  // Process point deposit (credit EDU tokens after PZO transfer)
  processPointDeposit: (data) => api.post("/api/point/deposit", data),

  // Public point deposit endpoint (no auth required, verified by wallet address)
  processPointDepositPublic: (data) =>
    api.post("/api/point/deposit-public", data),
};

export const adminAPI = {
  // Admin dashboard
  getDashboardStats: () => api.get("/api/admin/dashboard"),

  // User management
  getAllUsers: (params) => api.get("/api/admin/users", { params }),
  updateUserRole: (id, role) =>
    api.put(`/api/admin/users/${id}/role`, { role }),
  blockUser: (id, reason) =>
    api.post(`/api/admin/users/${id}/block`, { reason }),
  unblockUser: (id) => api.post(`/api/admin/users/${id}/unblock`),

  // Institution management
  getAllInstitutions: (params) =>
    api.get("/api/admin/institutions", { params }),
  approveInstitution: (id) => api.post(`/api/admin/institutions/${id}/approve`),
  rejectInstitution: (id, reason) =>
    api.post(`/api/admin/institutions/${id}/reject`, { reason }),

  // System management
  getSystemLogs: (params) => api.get("/api/admin/logs", { params }),
  getSystemHealth: () => api.get("/api/admin/health"),
  // Get configured admin wallet address (public)
  getAdminWallet: () => api.get("/api/admin/wallet"),
  // Public admin wallet / conversion settings (no auth required)
  getPublicAdminWallet: () => api.get("/api/public/admin-wallet"),
};

export const partnerAPI = {
  // Partner course management
  createCourse: (data) => api.post("/api/partner/courses", data),
  getMyCourses: () => api.get("/api/partner/courses"),
  getMySales: (params) => api.get("/api/partner/sales", { params }),
  getMyLearners: (params) => api.get("/api/partner/learners", { params }),
  // Public partner courses
  getPublicCourses: (params) =>
    api.get("/api/partner/public-courses", { params }),
  purchaseCourse: (id, data) =>
    api.post(`/api/partner/courses/${id}/purchase`, data || {}),
  publishCourse: (id, publish = true) =>
    api.patch(`/api/partner/courses/${id}/publish`, { publish }),
  toggleCoursePublish: (id, publish) =>
    api.patch(`/api/partner/courses/${id}/publish`, { publish }),

  // Partner Sources (API URLs của web đối tác)
  getPartnerSources: () => api.get("/api/partner/sources"),
  createPartnerSource: (data) => api.post("/api/partner/sources", data),
  updatePartnerSource: (id, data) =>
    api.patch(`/api/partner/sources/${id}`, data),
  deletePartnerSource: (id) => api.delete(`/api/partner/sources/${id}`),
  syncCoursesFromSource: (id) => api.post(`/api/partner/sources/${id}/sync`),
};

export default api;
