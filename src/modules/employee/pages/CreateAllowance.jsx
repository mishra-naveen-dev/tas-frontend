import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Typography,
    Alert,
    Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from 'core/services/api';



const CreateAllowance = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        travel_date: new Date().toISOString().split('T')[0],
        from_location: '',
        to_location: '',
        total_distance: '',
        reason: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const distance = parseFloat(formData.total_distance);

            if (!distance || distance <= 0) {
                setError('Distance must be greater than 0');
                setLoading(false);
                return;
            }

            const payload = {
                travel_date: formData.travel_date,
                from_location: formData.from_location,
                to_location: formData.to_location,
                total_distance: distance,

                reason: formData.reason,
            };

            await api.createAllowanceRequest(payload);

            setSuccessMessage('Allowance request created successfully');

            setTimeout(() => {
                navigate('/employee/allowance-history');
            }, 1500);

        } catch (err) {
            console.log("BACKEND ERROR:", err.response?.data);

            setError(
                JSON.stringify(err.response?.data) ||
                'Failed to create allowance request'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Create Allowance Request</Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="travel_date"
                                    value={formData.travel_date}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Distance (km)"
                                    name="total_distance"
                                    value={formData.total_distance}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="From"
                                    name="from_location"
                                    value={formData.from_location}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="To"
                                    name="to_location"
                                    value={formData.to_location}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Submit'}
                                </Button>
                            </Grid>

                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateAllowance;