import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import api from 'core/services/api';
import { useAuth } from 'modules/auth/contexts/AuthContext';

const ChangePassword = () => {

    const navigate = useNavigate();
    const { user, setUser, login } = useAuth();

    // ================= PROTECT ROUTE =================
    useEffect(() => {
        const token = sessionStorage.getItem('access_token');

        if (!token) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // ================= STATE =================
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ================= VALIDATION =================
    const validate = () => {

        if (!password) return "Password is required";

        if (password.length < 6)
            return "Password must be at least 6 characters";

        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return "Password must contain at least 1 uppercase letter and 1 number";
        }

        if (password !== confirmPassword)
            return "Passwords do not match";

        return null;
    };

    // ================= HANDLE =================
    const handleChangePassword = async () => {

        if (loading) return;

        setError('');
        setSuccess('');

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            // 🔥 CHANGE PASSWORD API
            await api.changePassword(password);

            // ✅ Auto-login with new password
            const username = user?.username;
            
            if (username) {
                // Call login API using AuthContext login which includes device headers
                const loginRes = await login(username, password);

                if (loginRes.success) {
                    // Update user context with fresh data
                    if (loginRes.user) {
                        setUser({
                            ...loginRes.user,
                            role_name: loginRes.role,
                            force_password_change: false
                        });
                    }

                    // Show success and redirect
                    setSuccess("Password updated successfully! Redirecting...");
                    
                    setTimeout(() => {
                        if (loginRes.force_password_change) {
                            // Still needs password change - redirect back
                            navigate('/change-password', { replace: true });
                        } else {
                            // Success - go to dashboard
                            if (loginRes.role === 'EMPLOYEE') {
                                navigate('/employee/dashboard', { replace: true });
                            } else {
                                navigate('/admin/dashboard', { replace: true });
                            }
                        }
                    }, 1000);
                } else {
                    // Login failed - redirect to login
                    setSuccess("Password updated. Please login again.");
                    setTimeout(() => {
                        sessionStorage.clear();
                        setUser(null);
                        navigate('/login', { replace: true });
                    }, 1200);
                }
            } else {
                // Fallback: redirect to login
                setSuccess("Password updated successfully. Please login again.");
                setTimeout(() => {
                    sessionStorage.clear();
                    setUser(null);
                    navigate('/login', { replace: true });
                }, 1200);
            }

        } catch (err) {

            setError(
                err?.response?.data?.password?.[0] ||
                err?.response?.data?.message ||
                "Failed to update password"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                p: 3,
                maxWidth: 420,
                margin: 'auto',
                mt: 8
            }}
        >
            <Card elevation={4}>
                <CardContent>

                    <Typography variant="h5" gutterBottom>
                        Change Password
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        You must update your password before continuing
                    </Typography>

                    {/* ERROR */}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {/* PASSWORD */}
                    <TextField
                        fullWidth
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mt: 2 }}
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(p => !p)}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {/* CONFIRM PASSWORD */}
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={{ mt: 2 }}
                        disabled={loading}
                    />

                    {/* BUTTON */}
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, height: 45 }}
                        onClick={handleChangePassword}
                        disabled={loading}
                    >
                        {loading
                            ? <CircularProgress size={22} color="inherit" />
                            : 'Update Password'}
                    </Button>

                </CardContent>
            </Card>
        </Box>
    );
};

export default ChangePassword;