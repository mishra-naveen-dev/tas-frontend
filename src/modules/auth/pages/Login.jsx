import React, { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment
} from '@mui/material';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'modules/auth/contexts/AuthContext';
import api from 'core/services/api';

const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [openForgot, setOpenForgot] = useState(false);
    const [email, setEmail] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    // ================= INPUT =================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ================= PASSWORD TOGGLE =================
    const handleTogglePassword = () => {
        setShowPassword(true);
        setTimeout(() => setShowPassword(false), 3000);
    };

    // ================= LOGIN =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError('');

        if (!form.username || !form.password) {
            setError('Username and Password are required');
            return;
        }

        setLoading(true);

        try {
            const res = await login(form.username, form.password);


            if (!res.success) {
                setError(res.message);
                return;
            }

            // 🔥 FORCE PASSWORD CHANGE
            if (res.force_password_change === true) {
                navigate('/change-password', { replace: true });
                return;
            }

            const role = String(res.role).toUpperCase();

            if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/employee/dashboard', { replace: true });
            }

        } catch (err) {

            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // ================= FORGOT PASSWORD =================
    const handleForgotPassword = async () => {
        if (!email) {
            setForgotMsg('Email is required');
            return;
        }

        setForgotLoading(true);
        setForgotMsg('');

        try {
            await api.post('/accounts/forgot-password/', { email });
            setForgotMsg('Reset link sent to your email');
        } catch (err) {
            setForgotMsg(err?.response?.data?.error || 'Something went wrong');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 3 }}>

                    <Typography variant="h4" align="center" sx={{ fontWeight: 600, mb: 1 }}>
                        TAS Login
                    </Typography>

                    <Typography align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                        Traveling Allowance System
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>

                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            margin="normal"
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            margin="normal"
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, height: 45 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={22} /> : 'Login'}
                        </Button>

                    </form>

                    <Typography
                        sx={{
                            mt: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: 'primary.main',
                            fontWeight: 500
                        }}
                        onClick={() => setOpenForgot(true)}
                    >
                        Forgot Password?
                    </Typography>

                </Paper>

                {/* FORGOT PASSWORD DIALOG */}
                <Dialog open={openForgot} onClose={() => setOpenForgot(false)}>
                    <DialogTitle>Reset Password</DialogTitle>

                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mt: 1 }}
                        />

                        {forgotMsg && <Alert sx={{ mt: 2 }}>{forgotMsg}</Alert>}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpenForgot(false)}>Cancel</Button>

                        <Button
                            onClick={handleForgotPassword}
                            variant="contained"
                            disabled={forgotLoading}
                        >
                            {forgotLoading ? <CircularProgress size={20} /> : 'Send'}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Container>
    );
};

export default Login;