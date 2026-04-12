import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Send as SendIcon,
    Place as PlaceIcon,
} from '@mui/icons-material';
import api from 'core/services/api';
import { TableSkeleton } from 'shared/components/SkeletonLoader';

const CreateCorrectionRequest = ({ open, onClose, onSuccess, editPunch = null }) => {
    const [form, setForm] = useState({
        correction_type: 'ADD',
        original_punch_id: '',
        correction_date: '',
        correction_time: '',
        punch_type: 'PUNCH_IN',
        from_address: '',
        pincode: '',
        place_id: '',
        to_address: '',
        reason: '',
    });
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (editPunch) {
            setForm(f => ({
                ...f,
                correction_type: 'EDIT',
                original_punch_id: editPunch.id,
                correction_date: editPunch.punch_date,
                correction_time: new Date(editPunch.punched_at).toTimeString().slice(0, 5),
                punch_type: editPunch.punch_type,
                from_address: `Lat: ${editPunch.latitude}, Lng: ${editPunch.longitude}`,
                pincode: editPunch.pincode || '',
                reason: '',
            }));
        } else {
            setForm({
                correction_type: 'ADD',
                original_punch_id: '',
                correction_date: '',
                correction_time: '',
                punch_type: 'PUNCH_IN',
                from_address: '',
                pincode: '',
                to_address: '',
                reason: '',
            });
        }
    }, [editPunch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Address autocomplete
        if (name === 'from_address' && value.length >= 3) {
            fetchAddressSuggestions(value);
        } else if (name === 'from_address' && value.length < 3) {
            setAddressSuggestions([]);
        }
    };

    const fetchAddressSuggestions = async (query) => {
        setAddressLoading(true);
        try {
            const res = await api.getAddressSuggestions(query, 5);
            setAddressSuggestions(res.data || []);
            setShowSuggestions(true);
        } catch (err) {
            setAddressSuggestions([]);
        }
        setAddressLoading(false);
    };

    const handleSelectAddress = async (suggestion) => {
        setForm(prev => ({
            ...prev,
            from_address: suggestion.description,
            place_id: suggestion.place_id
        }));
        setShowSuggestions(false);
        setAddressSuggestions([]);
        
        // Fetch details to get pincode
        try {
            const res = await api.getAddressDetails(suggestion.place_id);
            const details = res.data;
            if (details.pincode) {
                setForm(prev => ({ ...prev, pincode: details.pincode }));
            }
        } catch (err) {}
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        // Require either address OR pincode
        if (!form.correction_date || !form.correction_time || !form.reason) {
            setError('Date, time and reason are required');
            return;
        }

        if (!form.from_address && !form.pincode) {
            setError('Either address or pincode is required');
            return;
        }

        if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
            setError('Pincode must be 6 digits');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                original_punch_id: form.original_punch_id ? parseInt(form.original_punch_id) : null,
            };
            await api.createCorrectionRequest(payload);
            setSuccess('Correction request submitted successfully!');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            const errData = err.response?.data;
            let errMsg = errData?.error;
            if (typeof errMsg === 'object' && errMsg !== null) {
                errMsg = Object.entries(errMsg).map(([k, v]) => `${k}: ${v}`).join(', ');
            }
            setError(errMsg || errData?.detail || 'Failed to submit correction request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon color="primary" />
                    New Correction Request
                </Box>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Correction Type"
                            name="correction_type"
                            value={form.correction_type}
                            onChange={handleChange}
                        >
                            <MenuItem value="ADD">Add Punch</MenuItem>
                            <MenuItem value="EDIT">Edit Punch</MenuItem>
                            <MenuItem value="DELETE">Delete Punch</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Punch Type"
                            name="punch_type"
                            value={form.punch_type}
                            onChange={handleChange}
                        >
                            <MenuItem value="PUNCH_IN">Punch In</MenuItem>
                            <MenuItem value="PUNCH_OUT">Punch Out</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Date"
                            name="correction_date"
                            value={form.correction_date}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            type="time"
                            label="Time"
                            name="correction_time"
                            value={form.correction_time}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ position: 'relative' }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="From Address"
                            name="from_address"
                            value={form.from_address}
                            onChange={handleChange}
                            placeholder="Start typing address..."
                            onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                            InputProps={{
                                startAdornment: <PlaceIcon sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                        />
                        {showSuggestions && addressSuggestions.length > 0 && (
                            <Paper sx={{ position: 'absolute', left: 0, right: 0, zIndex: 10, maxHeight: 200, overflow: 'auto' }}>
                                {addressSuggestions.map((s, i) => (
                                    <MenuItem 
                                        key={s.place_id || i} 
                                        onClick={() => handleSelectAddress(s)}
                                        sx={{ whiteSpace: 'normal', fontSize: 14 }}
                                    >
                                        {s.description}
                                    </MenuItem>
                                ))}
                            </Paper>
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Pincode (Optional)"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            placeholder="6-digit pincode"
                            inputProps={{ maxLength: 6 }}
                            error={form.pincode.length > 0 && form.pincode.length !== 6}
                            helperText={form.pincode.length > 0 && form.pincode.length !== 6 ? '6 digits required' : 'Auto-filled from address'}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size="small"
                            label="To Address (Optional)"
                            name="to_address"
                            value={form.to_address}
                            onChange={handleChange}
                            placeholder="Enter full address or coordinates (lat, lng)"
                            InputProps={{
                                startAdornment: <PlaceIcon sx={{ mr: 1, color: 'action.active' }} />,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Reason"
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Explain why this correction is needed..."
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                    Submit Request
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const CorrectionHistory = ({ corrections }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ADD': return '+';
            case 'EDIT': return '✎';
            case 'DELETE': return '✕';
            default: return '';
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Time</strong></TableCell>
                        <TableCell><strong>Punch</strong></TableCell>
                        <TableCell><strong>From Address</strong></TableCell>
                        <TableCell><strong>Distance</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Submitted</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {corrections.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                                No correction requests found
                            </TableCell>
                        </TableRow>
                    ) : (
                        corrections.map((corr) => (
                            <TableRow key={corr.id} hover>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={`${getTypeIcon(corr.correction_type)} ${corr.correction_type}`}
                                        color={corr.correction_type === 'ADD' ? 'success' : corr.correction_type === 'DELETE' ? 'error' : 'primary'}
                                    />
                                </TableCell>
                                <TableCell>{corr.correction_date}</TableCell>
                                <TableCell>{corr.correction_time}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={corr.punch_type === 'PUNCH_IN' ? 'IN' : 'OUT'}
                                        size="small"
                                        color={corr.punch_type === 'PUNCH_IN' ? 'success' : 'warning'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={corr.from_address}>
                                        <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {corr.from_address}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{corr.calculated_distance ? `${corr.calculated_distance} km` : '-'}</TableCell>
                                <TableCell>
                                    <Chip label={corr.status} color={getStatusColor(corr.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {new Date(corr.created_at).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const PunchCorrections = () => {
    const [corrections, setCorrections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createDialog, setCreateDialog] = useState(false);
    const [editPunch, setEditPunch] = useState(null);
    const [recentPunches, setRecentPunches] = useState([]);

    const fetchCorrections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getMyCorrectionRequests();
            const data = res.data;
            setCorrections(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error('Failed to fetch corrections:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecentPunches = useCallback(async () => {
        try {
            const res = await api.getPunchRecords({ page_size: 20 });
            setRecentPunches(res.data.results || res.data || []);
        } catch (err) {
            console.error('Failed to fetch punches:', err);
        }
    }, []);

    useEffect(() => {
        fetchCorrections();
        fetchRecentPunches();
    }, [fetchCorrections, fetchRecentPunches]);

    const handleEditPunch = (punch) => {
        setEditPunch(punch);
        setCreateDialog(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Punch Corrections
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Request corrections for attendance punches
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditPunch(null);
                        setCreateDialog(true);
                    }}
                >
                    New Request
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>How it works:</strong> Submit a correction request if you need to add, edit, or delete a punch.
                    Admin will review and approve/reject your request.
                </Typography>
            </Alert>

            {loading ? (
                <TableSkeleton rows={5} columns={5} />
            ) : (
                <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Recent Punches (Available for Correction)
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Time</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Location</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentPunches.slice(0, 5).map((punch) => (
                                    <TableRow key={punch.id} hover>
                                        <TableCell>{punch.punch_date}</TableCell>
                                        <TableCell>
                                            {new Date(punch.punched_at).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={punch.punch_type === 'PUNCH_IN' ? 'IN' : 'OUT'}
                                                size="small"
                                                color={punch.punch_type === 'PUNCH_IN' ? 'success' : 'warning'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {punch.latitude?.toFixed(4)}, {punch.longitude?.toFixed(4)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleEditPunch(punch)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="h6" sx={{ mb: 2 }}>
                        My Correction Requests
                    </Typography>
                    <CorrectionHistory corrections={corrections} />
                </>
            )}

            <CreateCorrectionRequest
                open={createDialog}
                onClose={() => {
                    setCreateDialog(false);
                    setEditPunch(null);
                }}
                onSuccess={fetchCorrections}
                editPunch={editPunch}
            />
        </Box>
    );
};

export default PunchCorrections;
