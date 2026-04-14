import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from 'core/theme/theme';

import { AuthProvider } from 'modules/auth/contexts/AuthContext';
import ProtectedRoute from 'core/routes/ProtectedRoute';
import Redirector from 'core/routes/Redirector';
import AppLayout from 'core/layouts/AppLayout';
import ErrorBoundary from 'shared/components/ErrorBoundary';

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
const PunchCorrectionManagement = lazy(() => import('modules/admin/pages/PunchCorrectionManagement'));
const AdminDeviceManagement = lazy(() => import('modules/admin/pages/AdminDeviceManagement'));
const PasswordManagement = lazy(() => import('modules/admin/pages/PasswordManagement'));
const RouteMap = lazy(() => import('modules/admin/pages/RouteMap'));
const CorrectionSettings = lazy(() => import('modules/admin/pages/CorrectionSettings'));
const ApprovalHierarchySettings = lazy(() => import('modules/admin/pages/ApprovalHierarchySettings'));
const FeatureManagement = lazy(() => import('modules/admin/pages/FeatureManagement'));

// ================= ROUTES =================
const AppRoutes = () => {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>

                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />

                {/* ROOT REDIRECT */}
                <Route path="/" element={<Redirector />} />

                {/* ================= COMMON ================= */}
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
                        <ProtectedRoute requiredRoles={['EMPLOYEE']}>
                            <AppLayout>
                                <EmployeeDashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/punch-history"
                    element={
                        <ProtectedRoute requiredRoles={['EMPLOYEE']}>
                            <AppLayout>
                                <PunchHistory />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/punch-corrections"
                    element={
                        <ProtectedRoute requiredRoles={['EMPLOYEE']}>
                            <AppLayout>
                                <PunchCorrections />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/create-allowance"
                    element={
                        <ProtectedRoute requiredRoles={['EMPLOYEE']}>
                            <AppLayout>
                                <CreateAllowance />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/allowance-history"
                    element={
                        <ProtectedRoute requiredRoles={['EMPLOYEE']}>
                            <AppLayout>
                                <AllowanceHistory />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/daily-summary"
                    element={
                        <ProtectedRoute requiredRoles={['EMPLOYEE']}>
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
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <AdminDashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <UserManagement />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/create-user"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <CreateUser />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/pending-approvals"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <PendingApprovals />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/punch-details"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <PunchDetails />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />



                <Route
                    path="/admin/employee-tracking"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <EmployeeTracking />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/crm-visits"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <CRMVisits />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/punch-corrections"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <PunchCorrectionManagement />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/profile-approval"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <ProfileApproval />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/device-management"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <AdminDeviceManagement />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/password-management"
                    element={
                        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                            <AppLayout>
                                <PasswordManagement />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/route-map"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                            <AppLayout>
                                <RouteMap />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/correction-settings"
                    element={
                        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                            <AppLayout>
                                <CorrectionSettings />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/approval-hierarchy"
                    element={
                        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                            <AppLayout>
                                <ApprovalHierarchySettings />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/feature-management"
                    element={
                        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                            <AppLayout>
                                <FeatureManagement />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* ================= FALLBACK ================= */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </Suspense>
    );
};

// ================= MAIN APP =================
const App = () => {
    return (
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>

            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;