import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import LearnPass from "./pages/LearnPass";
import Marketplace from "./pages/Marketplace";
import Badges from "./pages/Badges";
import Verify from "./pages/Verify";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Transfer from "./pages/Transfer";
import CreateNFT from "./pages/CreateNFT";
import Portfolio from "./pages/Portfolio";
import PortfolioNFT from "./pages/PortfolioNFT";
import MetaMaskGuide from "./pages/MetaMaskGuide";
import DepositPoints from "./pages/DepositPoints";
import TransactionHistory from "./pages/TransactionHistory";
// Partner pages
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import ManageCourses from "./pages/partner/ManageCourses";
import Learners from "./pages/partner/Learners";
import PartnerEnrollmentDetail from "./pages/partner/EnrollmentDetail";
import PartnerAPIDocs from "./pages/partner/PartnerAPIDocs";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import EnrollmentDetail from "./pages/EnrollmentDetail";

// Admin Pages
import AdminLogin from "./features/admin/pages/AdminLogin";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminUsers from "./features/admin/pages/AdminUsers";
import AdminActivities from "./features/admin/pages/AdminActivities";
import AdminCertificates from "./features/admin/pages/AdminCertificates";
import AdminLearnPasses from "./features/admin/pages/AdminLearnPasses";
import AdminInstitutions from "./features/admin/pages/AdminInstitutions";
import AdminNFTPortfolio from "./features/admin/pages/AdminNFTPortfolio";
import AdminPortfolioChanges from "./features/admin/pages/AdminPortfolioChanges";
import AdminSettings from "./features/admin/pages/AdminSettings";
import AdminLayout from "./features/admin/components/AdminLayout";
import AdminRoute from "./features/admin/components/AdminRoute";

// Context
import { WalletProvider } from "./context/WalletContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./features/admin/context/AdminContext";

// Utils - removed setTestUser import

// Utils
import socket from "./utils/socket";
import { getUserFromLocalStorage } from "./utils/userUtils";
// import { clearLocalStorage } from './utils/clearLocalStorage'; // Temporarily disabled

const queryClient = new QueryClient();

function App() {
  const [noti, setNoti] = useState("");
  const user = getUserFromLocalStorage();

  // Clear any existing test data on app start
  useEffect(() => {
    // Temporarily disabled to prevent clearing user data on refresh
    // clearLocalStorage();

    // Remove any test/mock data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Check if it's test data (has test-token only)
        if (userData.accessToken === "test-token") {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          console.log("Cleared test user data");
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }, []);

  useEffect(() => {
    if (user && (user.userId || user.id)) {
      socket.emit("user-online", user.userId || user.id);
    }
    socket.on("receive-money", (data) => setNoti(data.message));
    socket.on("transfer-success", (data) => setNoti(data.message));
    return () => {
      socket.off("receive-money");
      socket.off("transfer-success");
    };
  }, [user]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WalletProvider>
            <AdminProvider>
              <Router>
                {noti && (
                  <div
                    style={{
                      background: "yellow",
                      color: "#333",
                      padding: 12,
                      borderRadius: 6,
                      position: "fixed",
                      right: 20,
                      top: 20,
                      zIndex: 9999,
                    }}
                  >
                    {noti}
                  </div>
                )}

                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="activities" element={<AdminActivities />} />
                    <Route
                      path="certificates"
                      element={<AdminCertificates />}
                    />
                    <Route path="learnpasses" element={<AdminLearnPasses />} />
                    <Route
                      path="institutions"
                      element={<AdminInstitutions />}
                    />
                    <Route
                      path="nft-portfolio"
                      element={<AdminNFTPortfolio />}
                    />
                    <Route
                      path="portfolio-changes"
                      element={<AdminPortfolioChanges />}
                    />
                    <Route
                      path="settings"
                      element={
                        /* lazy import below */ <React.Suspense fallback={null}>
                          <AdminSettings />
                        </React.Suspense>
                      }
                    />
                    {/* More admin routes will be added here */}
                  </Route>

                  {/* Regular App Routes */}
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <Layout>
                        <Login />
                      </Layout>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <Layout>
                        <Register />
                      </Layout>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  {/* Partner routes (nested under /partner) */}
                  {/* Public partner docs (no login required) */}
                  <Route
                    path="/partner/docs"
                    element={
                      <Layout>
                        <PartnerAPIDocs />
                      </Layout>
                    }
                  />

                  <Route
                    path="/partner"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Outlet />
                        </ProtectedRoute>
                      </Layout>
                    }
                  >
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<PartnerDashboard />} />
                    <Route path="courses" element={<ManageCourses />} />
                    <Route path="learners" element={<Learners />} />
                    <Route
                      path="learners/:id"
                      element={<PartnerEnrollmentDetail />}
                    />
                    <Route path="docs" element={<PartnerAPIDocs />} />
                  </Route>
                  <Route
                    path="/learnpass"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <LearnPass />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/marketplace"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Marketplace />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Courses />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-courses"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <MyCourses />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-courses/:id"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <EnrollmentDetail />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/badges"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Badges />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/verify"
                    element={
                      <Layout>
                        <Verify />
                      </Layout>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <Layout>
                        <About />
                      </Layout>
                    }
                  />
                  <Route
                    path="/metamask-guide"
                    element={
                      <Layout>
                        <MetaMaskGuide />
                      </Layout>
                    }
                  />
                  {/* Route chuyển tiền bảo vệ đăng nhập */}
                  <Route
                    path="/transfer"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Transfer />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  {/* Route tạo NFT bảo vệ đăng nhập */}
                  <Route
                    path="/create-nft"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <CreateNFT />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <Portfolio />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/portfolio-nft"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <PortfolioNFT />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/deposit-points"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <DepositPoints />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <TransactionHistory />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Layout>
                        <NotFound />
                      </Layout>
                    }
                  />
                </Routes>

                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "#363636",
                      color: "#fff",
                    },
                  }}
                />
              </Router>
            </AdminProvider>
          </WalletProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
