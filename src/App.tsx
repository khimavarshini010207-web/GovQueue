import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './client/context/AuthContext.js';
import { ToastProvider } from './client/context/ToastContext.js';
import { AppLayout } from './client/components/AppLayout.js';

// Pages
import { LandingPage } from './client/pages/LandingPage.js';
import { ServicesPage } from './client/pages/ServicesPage.js';
import { ServiceDetailPage } from './client/pages/ServiceDetailPage.js';
import { CentersPage } from './client/pages/CentersPage.js';
import { BookingPage } from './client/pages/BookingPage.js';
import { DashboardPage } from './client/pages/DashboardPage.js';
import { AppointmentsPage } from './client/pages/AppointmentsPage.js';
import { AppointmentDetailPage } from './client/pages/AppointmentDetailPage.js';
import { QueuePage } from './client/pages/QueuePage.js';
import { StaffDashboardPage } from './client/pages/StaffDashboardPage.js';
import { StaffAppointmentsPage } from './client/pages/StaffAppointmentsPage.js';
import { AdminDashboardPage } from './client/pages/AdminDashboardPage.js';
import { AdminServicesPage } from './client/pages/AdminServicesPage.js';
import { AdminCentersPage } from './client/pages/AdminCentersPage.js';
import { AdminStaffPage } from './client/pages/AdminStaffPage.js';
import { AdminUsersPage } from './client/pages/AdminUsersPage.js';
import { AdminAppointmentsPage } from './client/pages/AdminAppointmentsPage.js';
import { AdminAuditLogsPage } from './client/pages/AdminAuditLogsPage.js';
import { ProfilePage } from './client/pages/ProfilePage.js';
import { LoginPage } from './client/pages/LoginPage.js';
import { InternalPortalPage } from './client/pages/InternalPortalPage.js';
import { RegisterPage } from './client/pages/RegisterPage.js';
import { HelpPage } from './client/pages/HelpPage.js';

// Access Denied View
const AccessDeniedView: React.FC<{ userRole: string }> = ({ userRole }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            403 Forbidden
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Access Denied</h2>
          <p className="text-xs text-slate-600">
            Your current account role (<strong className="text-slate-900">{userRole}</strong>) is not authorized to access this department console. All access attempts are recorded in security logs.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to={userRole === 'STAFF' ? '/staff' : userRole === 'ADMIN' ? '/admin' : '/dashboard'}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-500">Checking credentials...</div>;
  }

  if (!user) {
    // If requesting internal staff/admin routes while unauthenticated, route to /internal
    if (allowedRoles && (allowedRoles.includes('STAFF') || allowedRoles.includes('ADMIN'))) {
      return <Navigate to="/internal" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDeniedView userRole={user.role} />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/centers" element={<CentersPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Citizen Routes */}
                <Route path="/book" element={<BookingPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <AppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments/:id"
                  element={
                    <ProtectedRoute>
                      <AppointmentDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/queue/:id" element={<QueuePage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Routes */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <StaffDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/queue"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <StaffDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <StaffAppointmentsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminServicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/centers"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminCentersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/staff"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminStaffPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/queues"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <StaffDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Hidden Internal Administrative Portal Entrypoint (Unlinked from Citizen UI) */}
                <Route path="/internal" element={<InternalPortalPage />} />
                <Route path="/internal/login" element={<InternalPortalPage />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </AppLayout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
