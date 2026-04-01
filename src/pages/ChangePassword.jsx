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
import api from '../services/api';

const ChangePassword = () => {

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async () => {

        setError('');
        setSuccess('');

        // 🔥 VALIDATION
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
            await api.changePassword(password);

            setSuccess("Password updated successfully");

            // 🔥 optional delay before redirect
            setTimeout(() => {
                sessionStorage.clear();
                window.location.href = "/login";
            }, 1000);

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
                        onClick={handleChangePassword}   // ✅ FIXED
                    >
                        Update Password
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ChangePassword;