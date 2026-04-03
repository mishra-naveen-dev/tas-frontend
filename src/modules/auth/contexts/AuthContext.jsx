import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import api from 'core/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ================= ROLE =================
    const userRole = useMemo(() => user?.role_name || null, [user]);

    // ================= INIT AUTH =================
    useEffect(() => {
        const initAuth = async () => {
            const token = sessionStorage.getItem('access_token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.getCurrentUser();
                setUser(res.data);
            } catch (err) {
                console.error("Auth init failed:", err?.response?.data);

                // 🔥 Invalid token → logout clean
                sessionStorage.clear();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // ================= LOGIN =================
    const login = async (username, password) => {
        try {
            // 🔥 Tokens stored inside api.login()
            await api.login(username, password);

            const res = await api.getCurrentUser();
            const userData = res.data;

            setUser(userData);

            return userData;

        } catch (err) {
            console.error("Login failed:", err?.response?.data);
            throw err;
        }
    };

    // ================= LOGOUT =================
    const logout = () => {
        sessionStorage.clear();
        setUser(null);

        // 🔥 Safe redirect (HashRouter compatible)
        window.location.replace('/#/login');
    };

    // ================= CONTEXT VALUE =================
    const value = {
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        userRole,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

};

// ================= HOOK =================
export const useAuth = () => useContext(AuthContext);