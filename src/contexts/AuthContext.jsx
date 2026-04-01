import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const userRole = useMemo(() => user?.role_name || null, [user]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem('access_token');

            if (token) {
                try {
                    const res = await api.getCurrentUser();
                    setUser(res.data);
                } catch {
                    sessionStorage.clear();
                }
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (!loading && userRole) {
            const path = window.location.pathname;

            if (path === '/' || path === '/login') {
                if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (userRole === 'EMPLOYEE') {
                    navigate('/employee/dashboard', { replace: true });
                }
            }
        }
    }, [userRole, loading, navigate]);

    const login = async (username, password) => {
        const tokens = await api.login(username, password);

        sessionStorage.setItem('access_token', tokens.access);
        sessionStorage.setItem('refresh_token', tokens.refresh);

        const res = await api.getCurrentUser();
        const userData = res.data;

        setUser(userData);


        if (userData.force_password_change) {
            navigate('/change-password', { replace: true });
            return userData;
        }

        return userData;
    };

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
        navigate('/login');
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                userRole,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);