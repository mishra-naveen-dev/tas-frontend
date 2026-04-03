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

import api from 'core/services/api';
import { useNotification } from 'shared/components/NotificationContext';

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
        upi_ref: '',
        cheque_no: '',
        customer_name: '',
        travel_with: 'ALONE',
        co_employee_id: '',
        co_employee_name: '',
        vehicle_number: ''
    });

    // ================= LOCATION =================
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

    // ================= OPEN =================
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
                upi_ref: '',
                cheque_no: '',
                customer_name: '',
                travel_with: 'ALONE',
                co_employee_id: '',
                co_employee_name: '',
                vehicle_number: ''
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

            await api.createPunchRecord({
                punch_type: 'PUNCH_IN',
                ...data,
                notes: data.reason
            });

            showNotification("Punch successful", 'success');

            if (onSuccess) onSuccess();

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

                    {/* REASON */}
                    <TextField
                        fullWidth
                        label="Reason"
                        sx={{ mt: 2 }}
                        value={data.reason}
                        onChange={(e) => setData({ ...data, reason: e.target.value })}
                    />

                    {/* VISIT TYPE */}
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
                                loan_id: '',
                                amount: '',
                                payment_mode: ''
                            })
                        }
                    >
                        <MenuItem value="COLLECTION">Collection</MenuItem>
                        <MenuItem value="DISBURSEMENT">Disbursement</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </TextField>

                    {/* ================= FINANCIAL SECTION ================= */}
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

                            {/* PAYMENT MODE */}
                            {data.visit_type === 'COLLECTION' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Payment Mode *"
                                            value={data.payment_mode}
                                            onChange={(e) =>
                                                setData({ ...data, payment_mode: e.target.value })
                                            }
                                        >
                                            <MenuItem value="CASH">Cash</MenuItem>
                                            <MenuItem value="UPI">UPI</MenuItem>
                                            <MenuItem value="CHEQUE">Cheque</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {data.payment_mode === 'UPI' && (
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="UPI Reference ID"
                                                value={data.upi_ref}
                                                onChange={(e) =>
                                                    setData({ ...data, upi_ref: e.target.value })
                                                }
                                            />
                                        </Grid>
                                    )}

                                    {data.payment_mode === 'CHEQUE' && (
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Cheque Number"
                                                value={data.cheque_no}
                                                onChange={(e) =>
                                                    setData({ ...data, cheque_no: e.target.value })
                                                }
                                            />
                                        </Grid>
                                    )}
                                </>
                            )}

                        </Grid>
                    )}

                    {/* ADDRESS */}
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

                    {/* TRAVEL */}
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
                                co_employee_id: '',
                                co_employee_name: '',
                                vehicle_number: ''
                            })
                        }
                    >
                        <MenuItem value="ALONE">Alone</MenuItem>
                        <MenuItem value="WITH_EMPLOYEE">With Employee</MenuItem>
                    </TextField>

                    {data.travel_with === 'WITH_EMPLOYEE' && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Employee ID"
                                    value={data.co_employee_id}
                                    onChange={(e) =>
                                        setData({ ...data, co_employee_id: e.target.value })
                                    }
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Employee Name"
                                    value={data.co_employee_name}
                                    onChange={(e) =>
                                        setData({ ...data, co_employee_name: e.target.value })
                                    }
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* ACTION */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                !data.visit_type ||
                                (
                                    (data.visit_type === 'COLLECTION' || data.visit_type === 'DISBURSEMENT') &&
                                    (!data.loan_id || !data.amount)
                                ) ||
                                (data.visit_type === 'COLLECTION' && !data.payment_mode)
                            }
                        >
                            Submit
                        </Button>
                    </Box>

                </Box>
            </Dialog>
        </>
    );

};

export default PunchButton;