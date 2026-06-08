import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import { NotificationProvider } from './context/NotificationContext';
import CustomCursor from './components/CustomCursor';
import Login from './pages/Login';
import Register from './pages/Register';
import News from './pages/News';
import AboutUs from './pages/AboutUs';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Simple loading indicator
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'sans-serif',
    fontWeight: 600
  }}>
    Initializing UniServe session...
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, targetPortal }) => {
  const { user, token, portal, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role restrictions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Check portal alignment if requested
  if (targetPortal && portal !== targetPortal) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public Pages */}
      <Route path="/listings" element={<Navigate to="/#listings" replace />} />
      <Route path="/news" element={<News />} />
      <Route path="/about" element={<AboutUs />} />

      {/* Student Customer Dashboards */}
      <Route 
        path="/customer" 
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'SERVICE_PROVIDER']} targetPortal="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Service Provider Dashboards */}
      <Route 
        path="/provider" 
        element={
          <ProtectedRoute allowedRoles={['SERVICE_PROVIDER']} targetPortal="provider">
            <ProviderDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Dashboards */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} targetPortal="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <CustomCursor />
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}
