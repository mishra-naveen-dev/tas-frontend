import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from 'modules/auth/contexts/AuthContext';

const Redirector = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.force_password_change) {
        return <Navigate to="/change-password" replace />;
    }

    if (user.role_name === 'ADMIN' || user.role_name === 'SUPER_ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role_name === 'EMPLOYEE') {
        return <Navigate to="/employee/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
};

export default Redirector;