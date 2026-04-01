import React, { useState } from 'react';
import {
    Button,
    Dialog,
    Box,
    Typography,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const PunchButton = ({ onSuccess }) => {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState('');

    const { showNotification } = useNotification();

    const [data, setData] = useState({
        latitude: null,
        longitude: null,
        current_address: '',
        customer_address: '',
        reason: '',
        visit_type: '',
        loan_id: '',
        amount: '',
        payment_mode: '',
        customer_name: '',
        travel_with: 'ALONE',
        co_employee_id: '',
        co_employee_name: ''
    });

    // ================= LOCATION HANDLER =================
    const getLocation = () => {
        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {
                reject("Geolocation not supported");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    switch (error.code) {
                        case 1:
                            reject("Permission denied. Enable location.");
                            break;
                        case 2:
                            reject("Location unavailable. Turn on GPS.");
                            break;
                        case 3:
                            reject("Location timeout.");
                            break;
                        default:
                            reject("Failed to get location");
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // ================= ADDRESS =================
    const getAddressFromLatLng = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const result = await res.json();
            return result.display_name || '';
        } catch {
            return '';
        }
    };

    // ================= PUNCH CLICK =================
    const handlePunchClick = async () => {
        try {
            setLoading(true);
            setLocationError('');

            const location = await getLocation();

            const address = await getAddressFromLatLng(
                location.latitude,
                location.longitude
            );

            setData({
                latitude: location.latitude,
                longitude: location.longitude,
                current_address: address,
                customer_address: '',
                reason: '',
                visit_type: '',
                loan_id: '',
                amount: '',
                payment_mode: '',
                customer_name: '',
                travel_with: 'ALONE',
                co_employee_id: '',
                co_employee_name: ''
            });

            setOpen(true);

        } catch (err) {
            setLocationError(err);
            showNotification(err, 'error');
        } finally {
            setLoading(false);
        }
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        try {
            setLoading(true);

            const res = await api.createPunchRecord({
                punch_type: 'PUNCH_IN',
                ...data,
                notes: data.reason
            });

            showNotification("Punch successful", 'success');

            if (onSuccess) onSuccess(res.data);

            setOpen(false);

        } catch (err) {
            showNotification("Punch failed", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="contained" onClick={handlePunchClick} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Punch Now'}
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <Box sx={{ p: 3 }}>

                    <Typography variant="h6">Punch Details</Typography>

                    {locationError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {locationError}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Reason"
                        sx={{ mt: 2 }}
                        value={data.reason}
                        onChange={(e) => setData({ ...data, reason: e.target.value })}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Visit Type"
                        sx={{ mt: 2 }}
                        value={data.visit_type}
                        onChange={(e) =>
                            setData({
                                ...data,
                                visit_type: e.target.value,
                                // reset fields when changing type
                                loan_id: '',
                                amount: ''
                            })
                        }
                    >
                        <MenuItem value="COLLECTION">Collection</MenuItem>
                        <MenuItem value="DISBURSEMENT">Disbursement</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </TextField>

                    {/* ✅ CONDITIONAL FIELDS */}
                    {(data.visit_type === 'COLLECTION' || data.visit_type === 'DISBURSEMENT') && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Loan ID *"
                                    value={data.loan_id}
                                    onChange={(e) =>
                                        setData({ ...data, loan_id: e.target.value })
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Amount *"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData({ ...data, amount: e.target.value })
                                    }
                                />
                            </Grid>

                        </Grid>
                    )}

                    <TextField
                        fullWidth
                        label="Current Address"
                        sx={{ mt: 2 }}
                        value={data.current_address}
                    />

                    <TextField
                        fullWidth
                        label="Customer Address"
                        sx={{ mt: 2 }}
                        value={data.customer_address}
                        onChange={(e) =>
                            setData({ ...data, customer_address: e.target.value })
                        }
                    />
                    {/* ================= TRAVEL TYPE ================= */}
                    <TextField
                        select
                        fullWidth
                        label="Travel With"
                        sx={{ mt: 2 }}
                        value={data.travel_with}
                        onChange={(e) =>
                            setData({
                                ...data,
                                travel_with: e.target.value,

                                // reset fields when switching
                                co_employee_id: '',
                                co_employee_name: '',
                                vehicle_number: ''
                            })
                        }
                    >
                        <MenuItem value="ALONE">Alone</MenuItem>
                        <MenuItem value="WITH_EMPLOYEE">With Employee</MenuItem>
                    </TextField>

                    {/* ================= CONDITIONAL FIELDS ================= */}
                    {data.travel_with === 'WITH_EMPLOYEE' && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Employee ID *"
                                    value={data.co_employee_id}
                                    onChange={(e) =>
                                        setData({ ...data, co_employee_id: e.target.value })
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Employee Name *"
                                    value={data.co_employee_name}
                                    onChange={(e) =>
                                        setData({ ...data, co_employee_name: e.target.value })
                                    }
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Vehicle Number (Optional)"
                                    value={data.vehicle_number || ''}
                                    onChange={(e) =>
                                        setData({ ...data, vehicle_number: e.target.value })
                                    }
                                />
                            </Grid>

                        </Grid>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>

                        <Button variant="contained" onClick={handleSubmit} disabled={
                            loading ||
                            !data.visit_type ||
                            (
                                (data.visit_type === 'COLLECTION' || data.visit_type === 'DISBURSEMENT') &&
                                (!data.loan_id || !data.amount)
                            )
                        }>
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
};

export default PunchButton;