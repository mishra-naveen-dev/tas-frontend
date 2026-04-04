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

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError(null);

        // ✅ VALIDATION
        if (!formData.total_distance) {
            setError("Distance is required");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                travel_date: formData.travel_date,
                from_location: formData.from_location,
                to_location: formData.to_location,
                total_distance: parseFloat(formData.total_distance),
                reason: formData.reason,
            };

            console.log("PAYLOAD:", payload);

            await api.createAllowanceRequest(payload);

            setSuccessMessage("Allowance submitted successfully");

            setTimeout(() => {
                navigate('/employee/allowance-history');
            }, 1200);

        } catch (err) {

            console.error("ERROR:", err?.response?.data);

            setError(
                err?.response?.data?.total_distance ||
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                "Failed to create allowance"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5">Create Allowance</Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Card sx={{ mt: 2 }}>
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
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Distance (KM)"
                                    name="total_distance"
                                    type="number"
                                    value={formData.total_distance}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="From"
                                    name="from_location"
                                    value={formData.from_location}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="To"
                                    name="to_location"
                                    value={formData.to_location}
                                    onChange={handleChange}
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
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading
                                        ? <CircularProgress size={22} />
                                        : "Submit"}
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