import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import { LoadingSpinner } from './components/common/StatCard';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PredictPage from './pages/PredictPage';
import PredictionResultPage from './pages/PredictionResultPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DatasetInsightsPage from './pages/DatasetInsightsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import FeatureImportancePage from './pages/FeatureImportancePage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPredictionsPage from './pages/AdminPredictionsPage';
import AboutPage from './pages/AboutPage';
import AgriMapPage from './pages/AgriMapPage';
import SensitivitySimulatorPage from './pages/SensitivitySimulatorPage';

// Protected Route Guard
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout Shell
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Certain public pages don't show the permanent desktop sidebar
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/login' || location.pathname === '/register';
  const showSidebar = isAuthenticated && !isAuth;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:pl-64' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dataset-insights" element={<DatasetInsightsPage />} />
              <Route path="/model-performance" element={<ModelPerformancePage />} />
              <Route path="/feature-importance" element={<FeatureImportancePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/map" element={<AgriMapPage />} />
              <Route path="/simulator" element={<SensitivitySimulatorPage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/predict/result/:id" element={<PredictionResultPage />} />

              {/* User Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <PredictionHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/predictions"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPredictionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
