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
    DialogActions
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔥 Forgot password state
    const [openForgot, setOpenForgot] = useState(false);
    const [email, setEmail] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const { login } = useAuth();

    // ================= LOGIN =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    // ================= FORGOT PASSWORD =================
    const handleForgotPassword = async () => {
        setForgotLoading(true);
        setForgotMsg('');

        try {
            await api.post('/auth/forgot-password/', { email });

            setForgotMsg('Reset link sent to your email');
        } catch (err) {
            setForgotMsg(
                err.response?.data?.error || 'Something went wrong'
            );
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Traveling Allowance System
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Field Officer Management System
                        </Typography>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Login'}
                        </Button>
                    </form>

                    {/* 🔥 FORGOT PASSWORD LINK */}
                    <Typography
                        variant="body2"
                        sx={{
                            mt: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: 'primary.main'
                        }}
                        onClick={() => setOpenForgot(true)}
                    >
                        Forgot Password?
                    </Typography>
                </Paper>

                {/* 🔥 FORGOT PASSWORD DIALOG */}
                <Dialog open={openForgot} onClose={() => setOpenForgot(false)}>
                    <DialogTitle>Reset Password</DialogTitle>

                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                        />

                        {forgotMsg && (
                            <Alert sx={{ mt: 2 }}>
                                {forgotMsg}
                            </Alert>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpenForgot(false)}>
                            Cancel
                        </Button>

                        <Button
                            onClick={handleForgotPassword}
                            disabled={forgotLoading}
                            variant="contained"
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