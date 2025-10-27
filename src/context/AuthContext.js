import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../config/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");
        const storedUser = localStorage.getItem("user");

        if (storedAccessToken && storedRefreshToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Temporarily disable token verification to prevent logout on refresh
          // try {
          //   const response = await authAPI.getProfile();
          //   setUser(response.data.data.user);
          // } catch (error) {
          //   // Token is invalid, clear auth state
          //   logout();
          // }
        } else {
          // No stored auth data, user is not authenticated
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      // Backend may return token under `token` or `accessToken` depending on endpoint/version
      const {
        user: userData,
        accessToken: maybeAccessToken,
        token: maybeToken,
        refreshToken: newRefreshToken,
      } = response.data.data;

      const newAccessToken = maybeAccessToken || maybeToken;

      // Store tokens and user data
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      setIsAuthenticated(true);

      toast.success("Đăng nhập thành công!");
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      const {
        user: newUser,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data.data;

      // Store tokens and user data
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);
      setIsAuthenticated(true);

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);

      toast.success("Đã đăng xuất");
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token);
      if (user) {
        const updatedUser = { ...user, isEmailVerified: true };
        updateUser(updatedUser);
      }
      toast.success("Email đã được xác thực thành công!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Xác thực email thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerification = async (email) => {
    try {
      await authAPI.resendVerification(email);
      toast.success("Email xác thực đã được gửi lại!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Gửi email xác thực thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Gửi email đặt lại mật khẩu thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success("Mật khẩu đã được đặt lại thành công!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Đặt lại mật khẩu thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authAPI.refreshToken(refreshToken);
      const {
        accessToken: maybeAccessToken,
        token: maybeToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data.data || {};

      const newAccessToken = maybeAccessToken || maybeToken;

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return { success: false };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
