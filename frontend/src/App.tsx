import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Tasks } from './pages/Tasks';
import { ChecklistMaster } from './pages/ChecklistMaster';
import { Security } from './pages/Security';
import { Documentation } from './pages/Documentation';
import { Deployments } from './pages/Deployments';
import { Maintenance } from './pages/Maintenance';
import { QualityGate } from './pages/QualityGate';
import { Notifications } from './pages/Notifications';
import { Invites } from './pages/Invites';
import { SeoScanner } from './pages/SeoScanner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A12]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="checklist" element={<ChecklistMaster />} />
              <Route path="security" element={<Security />} />
              <Route path="docs" element={<Documentation />} />
              <Route path="deploy" element={<Deployments />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="quality-gate" element={<QualityGate />} />
              <Route path="seo-scanner" element={<SeoScanner />} />
              <Route path="notifications" element={<Notifications />} />
              <Route
                path="invites"
                element={
                  <ProtectedRoute adminOnly>
                    <Invites />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
