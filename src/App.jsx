import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Loader from './components/Loader';

// 🔥 Lazy Loaded Pages (IMPORTANT)
const Login = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PunchRecords = lazy(() => import('./pages/PunchRecords'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Profile = lazy(() => import('./pages/Profile'));

// Employee
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const PunchHistory = lazy(() => import('./pages/employee/PunchHistory'));
const CreateAllowance = lazy(() => import('./pages/employee/CreateAllowance'));
const AllowanceHistory = lazy(() => import('./pages/employee/AllowanceHistory'));
const PunchCorrections = lazy(() => import('./pages/employee/PunchCorrections'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PendingApprovals = lazy(() => import('./pages/admin/PendingApprovals'));
const EmployeeTracking = lazy(() => import('./pages/admin/EmployeeTracking'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CRMVisits = lazy(() => import('./pages/admin/CRMVisits'));
const PunchCorrectionManagement = lazy(() => import('./pages/admin/PunchCorrectionManagement'));
const CreateUser = lazy(() => import('./pages/admin/CreateUser'));
const ProfileApproval = lazy(() => import('./pages/admin/ProfileApproval'));
const AdminPunchDetails = lazy(() => import('./pages/admin/AdminPunchDetails'));

// Common
const Unauthorized = lazy(() => import('./components/Unauthorized'));
const Redirector = lazy(() => import('./components/Redirector'));

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>

                    {/* 🔥 GLOBAL LOADER */}
                    <Suspense fallback={<Loader />}>

                        <Routes>

                            {/* PUBLIC */}
                            <Route path="/login" element={<Login />} />

                            <Route
                                path="/change-password"
                                element={
                                    <ProtectedRoute>
                                        <ChangePassword />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin/profile-approval" element={<ProfileApproval />} />

                            {/* EMPLOYEE */}
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
                                path="/employee/punch"
                                element={
                                    <ProtectedRoute requiredRoles={['EMPLOYEE']}>
                                        <AppLayout>
                                            <PunchRecords />
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

                            {/* ADMIN */}
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
                                            <AdminPunchDetails />
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
                                path="/admin/users"
                                element={
                                    <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
                                        <AppLayout>
                                            <UserManagement />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* COMMON DASHBOARD */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <DashboardPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* REDIRECT */}
                            <Route path="/" element={<Redirector />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            <Route path="*" element={<Navigate to="/unauthorized" replace />} />

                        </Routes>

                    </Suspense>

                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
};

export default App;