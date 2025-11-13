
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BillsPage from './pages/BillsPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import AssetsPage from './pages/AssetsPage';
import ImportExportPage from './pages/ImportExportPage';
import FamilySharingPage from './pages/FamilySharingPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
    const { isLoading, isAuthenticated } = useAppContext();

    if (isLoading && !isAuthenticated) { // Show loading screen only when initially checking auth
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading...</div>
            </div>
        );
    }
    
    return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bills" 
            element={
              <ProtectedRoute>
                <Layout><BillsPage /></Layout>
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Layout><TransactionsPage /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <Layout><CategoriesPage /></Layout>
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/assets" 
            element={
              <ProtectedRoute>
                <Layout><AssetsPage /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/import-export" 
            element={
              <ProtectedRoute>
                <Layout><ImportExportPage /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sharing" 
            element={
              <ProtectedRoute>
                <Layout><FamilySharingPage /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout><SettingsPage /></Layout>
              </ProtectedRoute>
            } 
          />
           <Route path="*" element={<LoginPage />} />
        </Routes>
    )
}


function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
