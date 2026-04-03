import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from 'core/services/api';
import { useAuth } from 'modules/auth/contexts/AuthContext';

const ChangePassword = () => {

    const navigate = useNavigate();
    const { setUser } = useAuth(); // ✅ IMPORTANT

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async () => {

        setError('');
        setSuccess('');

        // ================= VALIDATION =================
        if (!password) {
            setError("Password is required");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            // 🔥 Step 1: change password
            await api.changePassword(password);

            // 🔥 Step 2: fetch updated user (VERY IMPORTANT)
            const res = await api.getCurrentUser();
            const updatedUser = res.data;

            // 🔥 Step 3: update global state
            setUser(updatedUser);

            setSuccess("Password updated successfully");

            // 🔥 Step 4: redirect properly
            setTimeout(() => {

                if (updatedUser.role_name === 'ADMIN' || updatedUser.role_name === 'SUPER_ADMIN') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/employee/dashboard', { replace: true });
                }

            }, 800);

        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                error?.response?.data?.password ||
                "Password change failed"
            );
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 400, margin: 'auto' }}>
            <Card>
                <CardContent>

                    <Typography variant="h5" gutterBottom>
                        Change Password
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={{ mt: 2 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={handleChangePassword}
                    >
                        Update Password
                    </Button>

                </CardContent>
            </Card>
        </Box>
    );
};

export default ChangePassword;