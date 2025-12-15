import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import NewProjectPage from '@/pages/NewProjectPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import ClientsPage from '@/pages/ClientsPage';
import TeamPage from '@/pages/TeamPage';
import SettingsPage from '@/pages/SettingsPage';
import ClientBriefWizard from '@/pages/ClientBriefWizard';
import WorkflowPage from '@/pages/WorkflowPage';
import SignContractPage from '@/pages/SignContractPage';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectPath = user?.role === 'CLIENT' ? '/client/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

export default function App() {
  const { verifyToken } = useAuthStore();

  // Enable global notifications
  useGlobalNotifications();

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Public Contract Signing */}
        <Route path="/sign-contract/:contractId" element={<SignContractPage />} />

        {/* Protected Agency Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="workflow" element={<WorkflowPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Client Routes */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
        <Route
          path="/client/brief/:projectId"
          element={
            <ProtectedRoute>
              <ClientBriefWizard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
