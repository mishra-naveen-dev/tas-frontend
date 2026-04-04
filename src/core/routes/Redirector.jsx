import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'modules/auth/contexts/AuthContext';

const Redirector = () => {

    const { user, loading, isAuthenticated } = useAuth();

    // ================= LOADING =================
    if (loading) return null;

    // ================= NOT AUTHENTICATED =================
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // ================= FORCE PASSWORD =================
    if (user.force_password_change === true) {
        return <Navigate to="/change-password" replace />;
    }

    // ================= ROLE NORMALIZATION =================
    const role = String(
        user.role_name ||
        user.role ||
        ''
    ).toUpperCase();

    // ================= ROLE BASED REDIRECT =================
    if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === 'EMPLOYEE') {
        return <Navigate to="/employee/dashboard" replace />;
    }

    // ================= FALLBACK =================
    return <Navigate to="/login" replace />;
};

export default Redirector;