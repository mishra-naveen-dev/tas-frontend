import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
    useRef
} from 'react';

import api from 'core/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [blocked, setBlocked] = useState(false);
    const [blockedReason, setBlockedReason] = useState('');

    const logoutRef = useRef(null);

    const userRole = useMemo(() => {
        return user?.role_name || user?.role || null;
    }, [user]);

    const logout = useCallback(() => {
        sessionStorage.clear();
        setUser(null);
        window.location.replace('/#/login');
    }, []);

    logoutRef.current = logout;

    useEffect(() => {
        if (user?.is_blocked) {
            setBlocked(true);
            setBlockedReason(user.blocked_reason || 'Your account has been blocked');
            const timer = setTimeout(() => {
                if (logoutRef.current) {
                    logoutRef.current();
                }
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setBlocked(false);
            setBlockedReason('');
        }
    }, [user]);

    useEffect(() => {
        const initAuth = async () => {

            const token = sessionStorage.getItem('access_token');

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await api.getCurrentUser();

                setUser(res.data);

            } catch (err) {

                // 🔥 TOKEN INVALID → FORCE LOGOUT
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
            const data = await api.login(username, password);

            if (!data || !data.access) {
                return {
                    success: false,
                    message: "Invalid server response"
                };
            }

            // ✅ SAFE USER EXTRACTION
            const userData = data.user || {};

            // ✅ NORMALIZE ROLE
            const role =
                data.role ||
                userData.role_name ||
                userData.role;

            // ✅ FORCE PASSWORD FLAG
            const forcePasswordChange = Boolean(
                userData.force_password_change
            );

            // 🔥 SET USER
            setUser({
                ...userData,
                role_name: role,
                force_password_change: forcePasswordChange
            });

            return {
                success: true,
                role,
                force_password_change: forcePasswordChange
            };

        } catch (err) {
            const errorData = err?.response?.data;
            const errorCode = errorData?.code;
            const errorMessage = errorData?.error || errorData?.detail || err?.message;

            if (errorCode === 'DEVICE_PENDING_APPROVAL') {
                return {
                    success: false,
                    message: "Your device is pending approval. Please wait for administrator to approve your device.",
                    code: errorCode,
                    device_pending: true
                };
            }

            if (errorCode === 'DEVICE_REJECTED') {
                return {
                    success: false,
                    message: "Your device has been rejected. Please contact your administrator.",
                    code: errorCode,
                    device_rejected: true
                };
            }

            if (errorCode === 'DEVICE_OWNED_BY_ANOTHER_USER') {
                return {
                    success: false,
                    message: "This device is registered to another user. Please use your own device.",
                    code: errorCode,
                    device_blocked: true
                };
            }

            if (errorCode === 'DEVICE_BLOCKED') {
                return {
                    success: false,
                    message: "This device has been blocked. Please contact your administrator.",
                    code: errorCode,
                    device_blocked: true
                };
            }

            if (errorCode === 'DEVICE_LIMIT_EXCEEDED') {
                return {
                    success: false,
                    message: `Device limit reached. Maximum ${errorData?.max_devices || 5} devices allowed.`,
                    code: errorCode
                };
            }

            if (errorCode === 'USER_BLOCKED') {
                return {
                    success: false,
                    message: errorData?.blocked_reason || "Your account has been blocked. Please contact your administrator.",
                    code: errorCode,
                    blocked: true
                };
            }

            return {
                success: false,
                message: errorMessage || "Invalid username or password"
            };
        }
    };

    const value = {
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        userRole,
        login,
        logout,
        blocked,
        blockedReason
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ================= HOOK =================
export const useAuth = () => useContext(AuthContext);