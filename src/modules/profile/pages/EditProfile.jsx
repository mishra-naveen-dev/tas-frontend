import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography
} from '@mui/material';
import api from 'core/services/api';


const EditProfile = ({ onClose }) => {

    const [form, setForm] = useState({
        phone: '',
        designation: ''
    });

    const handleSubmit = async () => {
        try {
            await api.createProfileUpdateRequest(form);
            alert('Request sent for approval');
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6">Edit Profile</Typography>

            <TextField
                fullWidth
                label="Phone"
                sx={{ mt: 2 }}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <TextField
                fullWidth
                label="Designation"
                sx={{ mt: 2 }}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />

            <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={handleSubmit}
            >
                Submit for Approval
            </Button>
        </Box>
    );
};

export default EditProfile;