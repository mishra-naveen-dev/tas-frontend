import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from 'core/theme/theme';

import { AuthProvider } from 'modules/auth/contexts/AuthContext';
import ProtectedRoute from 'core/routes/ProtectedRoute';
import Redirector from 'core/routes/Redirector';
import AppLayout from 'core/layouts/AppLayout';

import Loader from 'shared/components/Loader';
import Unauthorized from 'shared/components/Unauthorized';

// ================= LAZY PAGES =================

// Auth
const Login = lazy(() => import('modules/auth/pages/Login'));
const ChangePassword = lazy(() => import('modules/auth/pages/ChangePassword'));

// Profile
const Profile = lazy(() => import('modules/profile/Profile'));

// Employee
const EmployeeDashboard = lazy(() => import('modules/employee/pages/EmployeeDashboard'));
const PunchHistory = lazy(() => import('modules/employee/pages/PunchHistory'));
const PunchCorrections = lazy(() => import('modules/employee/pages/PunchCorrections'));
const CreateAllowance = lazy(() => import('modules/employee/pages/CreateAllowance'));
const AllowanceHistory = lazy(() => import('modules/employee/pages/AllowanceHistory'));
const DailySummary = lazy(() => import('modules/employee/pages/DailySummary'));

// Admin
const AdminDashboard = lazy(() => import('modules/admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('modules/admin/pages/UserManagement'));
const CreateUser = lazy(() => import('modules/admin/pages/CreateUser'));
const PendingApprovals = lazy(() => import('modules/approvals/pages/PendingApprovals'));
const PunchDetails = lazy(() => import('modules/admin/pages/PunchDetails'));
const EmployeeTracking = lazy(() => import('modules/admin/pages/EmployeeTracking'));
const CRMVisits = lazy(() => import('modules/admin/pages/CRMVisits'));
const ProfileApproval = lazy(() => import('modules/admin/pages/ProfileApproval'));

// ================= ROUTES =================
const AppRoutes = () => {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>

                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />

                {/* ROOT REDIRECT */}
                <Route path="/" element={<Redirector />} />

                {/* COMMON */}
                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Profile />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ================= EMPLOYEE ================= */}
                <Route
                    path="/employee/dashboard"
                    element={
                        <ProtectedRoute roles={['EMPLOYEE']}>
                            <AppLayout>
                                <EmployeeDashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/punch-history"
                    element={
                        <ProtectedRoute roles={['EMPLOYEE']}>
                            <AppLayout>
                                <PunchHistory />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/punch-corrections"
                    element={
                        <ProtectedRoute roles={['EMPLOYEE']}>
                            <AppLayout>
                                <PunchCorrections />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/create-allowance"
                    element={
                        <ProtectedRoute roles={['EMPLOYEE']}>
                            <AppLayout>
                                <CreateAllowance />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/allowance-history"
                    element={
                        <ProtectedRoute roles={['EMPLOYEE']}>
                            <AppLayout>
                                <AllowanceHistory />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/daily-summary"
                    element={
                        <ProtectedRoute roles={['EMPLOYEE']}>
                            <AppLayout>
                                <DailySummary />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ================= ADMIN ================= */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <AdminDashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <UserManagement />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/create-user"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <CreateUser />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/pending-approvals"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <PendingApprovals />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/punch-details"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <PunchDetails />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/punch-corrections"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <PunchCorrections />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/employee-tracking"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <EmployeeTracking />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/crm-visits"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <CRMVisits />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/profile-approval"
                    element={
                        <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <ProfileApproval />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* FALLBACK */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </Suspense>
    );

};

// ================= MAIN APP =================
const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <AuthProvider>
                <AppRoutes />
            </AuthProvider>

        </ThemeProvider>
    );

};

export default App;