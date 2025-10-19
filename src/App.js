import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LearnPass from './pages/LearnPass';
import Marketplace from './pages/Marketplace';
import Badges from './pages/Badges';
import Verify from './pages/Verify';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Transfer from './pages/Transfer';
import CreateNFT from './pages/CreateNFT';
import Portfolio from './pages/Portfolio';
import PortfolioNFT from './pages/PortfolioNFT';
import MetaMaskGuide from './pages/MetaMaskGuide';
import DepositPoints from './pages/DepositPoints';

// Context
import { WalletProvider } from './context/WalletContext';
import { AuthProvider } from './context/AuthContext';

// Utils - removed setTestUser import

// Utils
import socket from './utils/socket';
import { getUserFromLocalStorage } from './utils/userUtils';
import { clearLocalStorage } from './utils/clearLocalStorage';

const queryClient = new QueryClient();

function App() {
  const [noti, setNoti] = useState('');
  const user = getUserFromLocalStorage();

  // Clear any existing test data on app start
  useEffect(() => {
    // Temporarily disabled to prevent clearing user data on refresh
    // clearLocalStorage();
    
    // Remove any test/mock data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Check if it's test data (has test-token only)
        if (userData.accessToken === 'test-token') {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          console.log('Cleared test user data');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, []);

  useEffect(() => {
    if (user && (user.userId || user.id)) {
      socket.emit('user-online', user.userId || user.id);
    }
    socket.on('receive-money', data => setNoti(data.message));
    socket.on('transfer-success', data => setNoti(data.message));
    return () => {
      socket.off('receive-money');
      socket.off('transfer-success');
    };
  }, [user]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WalletProvider>
            <Router>
            {noti && (
              <div
                style={{
                  background: 'yellow',
                  color: '#333',
                  padding: 12,
                  borderRadius: 6,
                  position: 'fixed',
                  right: 20,
                  top: 20,
                  zIndex: 9999
                }}
              >
                {noti}
              </div>
            )}
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/learnpass" element={
                  <ProtectedRoute>
                    <LearnPass />
                  </ProtectedRoute>
                } />
                <Route path="/marketplace" element={
                  <ProtectedRoute>
                    <Marketplace />
                  </ProtectedRoute>
                } />
                <Route path="/badges" element={
                  <ProtectedRoute>
                    <Badges />
                  </ProtectedRoute>
                } />
                <Route path="/verify" element={<Verify />} />
                <Route path="/about" element={<About />} />
                <Route path="/metamask-guide" element={<MetaMaskGuide />} />
                {/* Route chuyển tiền bảo vệ đăng nhập */}
                <Route path="/transfer" element={
                  <ProtectedRoute>
                    <Transfer />
                  </ProtectedRoute>
                } />
                {/* Route tạo NFT bảo vệ đăng nhập */}
        <Route path="/create-nft" element={
          <ProtectedRoute>
            <CreateNFT />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } />
        <Route path="/portfolio-nft" element={
          <ProtectedRoute>
            <PortfolioNFT />
          </ProtectedRoute>
        } />
        <Route path="/deposit-points" element={
          <ProtectedRoute>
            <DepositPoints />
          </ProtectedRoute>
        } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            </Router>
          </WalletProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
