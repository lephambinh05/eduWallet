import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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
import Transfer from './pages/Transfer';

// Context
import { WalletProvider } from './context/WalletContext';

// Utils
import socket from './utils/socket';
import { getUserFromLocalStorage } from './utils/userUtils';

const queryClient = new QueryClient();

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
`;

const MainContent = styled.main`
  flex: 1;
`;

function App() {
  const [noti, setNoti] = useState('');
  const user = getUserFromLocalStorage();

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
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Router>
          <AppContainer>
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
            <Navbar />
            <MainContent>
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
                {/* Route chuyển tiền bảo vệ đăng nhập */}
                <Route path="/transfer" element={
                  <ProtectedRoute>
                    <Transfer />
                  </ProtectedRoute>
                } />
              </Routes>
            </MainContent>
            <Footer />
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
          </AppContainer>
        </Router>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
