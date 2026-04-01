import React, { useState } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography
} from '@mui/material';
import api from '../../services/api';

const SecurityTab = () => {
    const [password, setPassword] = useState('');

    const handleChange = async () => {
        try {
            await api.changePassword(password);
            alert('Password updated');
        } catch {
            alert('Failed');
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Change Password</Typography>

                <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    sx={{ mt: 2 }}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={handleChange}
                >
                    Update Password
                </Button>
            </CardContent>
        </Card>
    );
};

export default SecurityTab;