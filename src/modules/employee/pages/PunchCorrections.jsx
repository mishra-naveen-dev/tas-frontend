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
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Send as SendIcon,
    Place as PlaceIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
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
        visit_type: 'OFFICE',
        loan_id: '',
        amount: '',
        payment_method: 'CASH',
        from_address: '',
        pincode: '',
        place_id: '',
        to_address: '',
        punchMode: 'single', // 'single' or 'sequence'
        punch_sequence: [],
        reason: '',
    });
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Validation functions
    const validateField = (name, value) => {
        const errors = {};
        
        if (name === 'correction_date') {
            if (!value) errors.correction_date = 'Date is required';
            else if (new Date(value) > new Date()) errors.correction_date = 'Date cannot be in future';
        }
        
        if (name === 'correction_time') {
            if (form.punchMode === 'single' && !value) errors.correction_time = 'Time is required';
        }
        
        if (name === 'from_address') {
            if (form.punchMode === 'single' && !value && !form.pincode) {
                errors.from_address = 'Address or pincode is required';
            }
        }
        
        if (name === 'pincode') {
            if (value && !/^\d{6}$/.test(value)) {
                errors.pincode = 'Pincode must be 6 digits';
            }
        }
        
        if (name === 'reason') {
            if (!value || value.trim().length < 10) {
                errors.reason = 'Reason must be at least 10 characters';
            }
        }
        
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear related field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        
        // Address autocomplete
        if (name === 'from_address' && value.length >= 3) {
            fetchAddressSuggestions(value);
        } else if (name === 'from_address' && value.length < 3) {
            setAddressSuggestions([]);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errors = validateField(name, value);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(prev => ({ ...prev, ...errors }));
        }
    };

    // Punch sequence handlers
    const handleAddPunchPoint = () => {
        const newPoint = {
            sequence: form.punch_sequence.length + 1,
            address: '',
            pincode: '',
            latitude: null,
            longitude: null,
            time: '',
            punch_type: 'PUNCH_IN',  // System defaults to PUNCH_IN
            visit_type: 'OFFICE'
        };
        setForm(prev => ({
            ...prev,
            punch_sequence: [...prev.punch_sequence, newPoint]
        }));
    };

    const handleUpdatePunchPoint = (index, field, value) => {
        const updated = [...form.punch_sequence];
        updated[index] = { ...updated[index], [field]: value };
        setForm(prev => ({ ...prev, punch_sequence: updated }));
    };

    const handleRemovePunchPoint = (index) => {
        const updated = form.punch_sequence.filter((_, i) => i !== index);
        // Re-sequence
        updated.forEach((p, i) => p.sequence = i + 1);
        setForm(prev => ({ ...prev, punch_sequence: updated }));
    };

    const handleMovePunchPoint = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === form.punch_sequence.length - 1) return;
        
        const updated = [...form.punch_sequence];
        const swapIdx = direction === 'up' ? index - 1 : index + 1;
        const temp = updated[index];
        updated[index] = updated[swapIdx];
        updated[swapIdx] = temp;
        updated.forEach((p, i) => p.sequence = i + 1);
        setForm(prev => ({ ...prev, punch_sequence: updated }));
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
        setFieldErrors({});

        const allErrors = {};

        // Validate correction_date
        if (!form.correction_date) {
            allErrors.correction_date = 'Date is required';
        } else if (new Date(form.correction_date) > new Date()) {
            allErrors.correction_date = 'Date cannot be in future';
        }

        // Validate reason
        if (!form.reason || form.reason.trim().length < 10) {
            allErrors.reason = 'Reason must be at least 10 characters';
        }

        if (form.punchMode === 'sequence') {
            if (form.punch_sequence.length < 2) {
                allErrors.general = 'Add at least 2 punch points for sequence';
            }
            // Validate each point
            for (let i = 0; i < form.punch_sequence.length; i++) {
                const point = form.punch_sequence[i];
                if (!point.address && !point.pincode) {
                    allErrors[`point_${i}`] = 'Address or pincode required';
                }
            }
        } else {
            if (!form.correction_time) {
                allErrors.correction_time = 'Time is required';
            }
            if (!form.from_address && !form.pincode) {
                allErrors.from_address = 'Address or pincode is required';
            }
            if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
                allErrors.pincode = 'Pincode must be 6 digits';
            }
        }

        if (Object.keys(allErrors).length > 0) {
            setFieldErrors(allErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                correction_type: form.correction_type,
                correction_date: form.correction_date,
                correction_time: form.correction_time || '09:00',
                punch_type: form.punch_type,
                visit_type: form.visit_type,
                loan_id: form.loan_id,
                amount: form.amount ? parseFloat(form.amount) : null,
                payment_method: form.payment_method,
                from_address: form.from_address,
                pincode: form.pincode,
                punch_sequence: form.punchMode === 'sequence' ? form.punch_sequence : [],
                reason: form.reason,
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
                {fieldErrors.general && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.general}</Alert>}
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
                            onChange={(e) => {
                                const val = e.target.value;
                                setForm(prev => ({
                                    ...prev,
                                    correction_type: val,
                                    punchMode: val === 'ADD' ? 'sequence' : 'single'
                                }));
                            }}
                        >
                            <MenuItem value="ADD">Add Punch</MenuItem>
                            <MenuItem value="EDIT">Edit Punch</MenuItem>
                            <MenuItem value="DELETE">Delete Punch</MenuItem>
                        </TextField>
                    </Grid>

                    {form.correction_type === 'ADD' && (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Button
                                    variant={form.punchMode === 'single' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setForm(prev => ({ ...prev, punchMode: 'single' }))}
                                >
                                    Single Punch
                                </Button>
                                <Button
                                    variant={form.punchMode === 'sequence' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setForm(prev => ({ ...prev, punchMode: 'sequence' }))}
                                >
                                    Punch Sequence
                                </Button>
                            </Box>
                        </Grid>
                    )}

                    {form.punchMode === 'sequence' && (
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Punch Sequence Points
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        size="small" 
                                        startIcon={<AddIcon />}
                                        onClick={handleAddPunchPoint}
                                    >
                                        Add Point
                                    </Button>
                                </Box>
                                
                                {form.punch_sequence.length === 0 ? (
                                    <Typography color="text.secondary">
                                        Click "Add Point" to add punch locations in sequence order
                                    </Typography>
                                ) : (
                                    form.punch_sequence.map((point, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: fieldErrors[`point_${index}`] ? '1px solid red' : 'none' }}>
                                            <Typography fontWeight="bold" minWidth={30}>{index + 1}.</Typography>
                                            <TextField
                                                size="small"
                                                placeholder="Address or Location"
                                                value={point.address || ''}
                                                onChange={(e) => handleUpdatePunchPoint(index, 'address', e.target.value)}
                                                error={!!fieldErrors[`point_${index}`]}
                                                helperText={fieldErrors[`point_${index}`]}
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                size="small"
                                                placeholder="Pincode"
                                                value={point.pincode || ''}
                                                onChange={(e) => handleUpdatePunchPoint(index, 'pincode', e.target.value)}
                                                inputProps={{ maxLength: 6 }}
                                                sx={{ width: 100 }}
                                            />
                                            <TextField
                                                size="small"
                                                type="time"
                                                value={point.time || ''}
                                                onChange={(e) => handleUpdatePunchPoint(index, 'time', e.target.value)}
                                                sx={{ width: 120 }}
                                            />
                                            <Chip label="PUNCH IN" color="success" size="small" />
                                            <IconButton size="small" onClick={() => handleMovePunchPoint(index, 'up')} disabled={index === 0}>
                                                <ArrowUpIcon />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleMovePunchPoint(index, 'down')} disabled={index === form.punch_sequence.length - 1}>
                                                <ArrowDownIcon />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleRemovePunchPoint(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))
                                )}
                            </Paper>
                        </Grid>
                    )}

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
                            select
                            fullWidth
                            size="small"
                            label="Visit Type"
                            name="visit_type"
                            value={form.visit_type}
                            onChange={handleChange}
                        >
                            <MenuItem value="OFFICE">Office Visit</MenuItem>
                            <MenuItem value="CLIENT">Client Visit</MenuItem>
                            <MenuItem value="FIELD">Field Visit</MenuItem>
                            <MenuItem value="MEETING">Meeting</MenuItem>
                            <MenuItem value="DISBURSEMENT">Disbursement</MenuItem>
                            <MenuItem value="COLLECTION">Collection</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                        </TextField>
                    </Grid>

                    {(form.visit_type === 'DISBURSEMENT' || form.visit_type === 'COLLECTION') && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Loan ID"
                                    name="loan_id"
                                    value={form.loan_id}
                                    onChange={handleChange}
                                    placeholder="Enter Loan ID"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Amount"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    placeholder="Enter Amount"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    label="Payment Method"
                                    name="payment_method"
                                    value={form.payment_method}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="CASH">Cash</MenuItem>
                                    <MenuItem value="ONLINE">Online Transfer</MenuItem>
                                    <MenuItem value="CHEQUE">Cheque</MenuItem>
                                    <MenuItem value="UPI">UPI</MenuItem>
                                    <MenuItem value="OTHER">Other</MenuItem>
                                </TextField>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Date"
                            name="correction_date"
                            value={form.correction_date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!fieldErrors.correction_date}
                            helperText={fieldErrors.correction_date}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                max: new Date().toISOString().split('T')[0]
                            }}
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
                            onBlur={handleBlur}
                            error={!!fieldErrors.correction_time}
                            helperText={fieldErrors.correction_time}
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
                            onBlur={handleBlur}
                            error={!!fieldErrors.from_address}
                            helperText={fieldErrors.from_address}
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
                            onBlur={handleBlur}
                            error={!!fieldErrors.pincode}
                            helperText={fieldErrors.pincode || (form.pincode.length > 0 && form.pincode.length !== 6 ? '6 digits required' : 'Auto-filled from address')}
                            placeholder="6-digit pincode"
                            inputProps={{ maxLength: 6 }}
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
                            onBlur={handleBlur}
                            error={!!fieldErrors.reason}
                            helperText={fieldErrors.reason || `${form.reason?.length || 0}/10 characters minimum`}
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
