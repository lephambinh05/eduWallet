import React, { createContext, useState, useContext, useEffect } from "react";
import AdminService from "../services/adminService";
import { toast } from "react-hot-toast";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize admin auth from localStorage
    try {
      const storedToken = localStorage.getItem("adminToken");
      const storedUser = localStorage.getItem("adminUser");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setAdminUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("AdminProvider init error:", err);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AdminService.login(credentials);
      console.log("AdminContext - API Response:", response);

      if (response && response.success) {
        // Normalize response shape (some endpoints return data under response.data)
        const payload =
          response.data && typeof response.data === "object"
            ? response.data
            : response;
        const inner = payload.data || payload;
        const {
          user,
          accessToken: maybeAccessToken,
          token: maybeToken,
        } = inner || {};
        const resolvedToken = maybeAccessToken || maybeToken;

        if (!user) {
          return { success: false, message: "Invalid response from server" };
        }

        // Role check
        if (!["admin", "super_admin"].includes(user.role)) {
          toast.error("Access denied. Admin privileges required.");
          return { success: false, message: "Not authorized" };
        }

        if (resolvedToken) {
          localStorage.setItem("adminToken", resolvedToken);
        }
        localStorage.setItem("adminUser", JSON.stringify(user));

        setToken(resolvedToken);
        setAdminUser(user);

        toast.success(`Welcome back, ${user.username}!`);
        return { success: true, user, token: resolvedToken };
      }

      return { success: false, message: response?.message || "Login failed" };
    } catch (error) {
      console.error("AdminContext - Login error:", error);
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    AdminService.logout();
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
  };

  const isAuthenticated = () => {
    return !!token && !!adminUser;
  };

  const isAdmin = () => {
    return adminUser && ["admin", "super_admin"].includes(adminUser.role);
  };

  const isSuperAdmin = () => {
    return adminUser && adminUser.role === "super_admin";
  };

  const value = {
    adminUser,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContext;
