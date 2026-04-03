import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Alert,
    Snackbar,
    IconButton,

} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from 'core/services/api';

const PunchCorrections = () => {
    const [corrections, setCorrections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingCorrection, setEditingCorrection] = useState(null);

    const [formData, setFormData] = useState({
        correction_type: 'ADD_PUNCH',
        existing_punch: '',
        requested_date: new Date(),
        requested_time: new Date(),
        requested_punch_type: 'PUNCH_IN',
        reason: ''
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchCorrections();
    }, []);

    // ✅ FIXED FUNCTION
    const fetchCorrections = async () => {
        try {
            const response = await api.getCorrections();

            const data = response.data;

            setCorrections(
                Array.isArray(data) ? data : data.results || []
            );

        } catch (error) {
            console.error('Error fetching corrections:', error);

            setSnackbar({
                open: true,
                message: 'Failed to load correction requests',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (correction) => {
        if (correction) {
            setEditingCorrection(correction);

            setFormData({
                correction_type: correction.correction_type,
                existing_punch: correction.existing_punch?.id?.toString() || '',
                requested_date: new Date(correction.requested_date),
                requested_time: new Date(`1970-01-01T${correction.requested_time}`),
                requested_punch_type: correction.requested_punch_type,
                reason: correction.reason
            });
        } else {
            setEditingCorrection(null);

            setFormData({
                correction_type: 'ADD_PUNCH',
                existing_punch: '',
                requested_date: new Date(),
                requested_time: new Date(),
                requested_punch_type: 'PUNCH_IN',
                reason: ''
            });
        }

        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setEditingCorrection(null);
    };

    const handleSubmit = async () => {
        try {
            const data = {
                correction_type: formData.correction_type,
                existing_punch: formData.existing_punch || null,
                requested_date: formData.requested_date.toISOString().split('T')[0],
                requested_time: formData.requested_time.toTimeString().split(' ')[0],
                requested_punch_type: formData.requested_punch_type,
                reason: formData.reason
            };

            if (editingCorrection) {
                await api.updateCorrection(editingCorrection.id, data);

                setSnackbar({
                    open: true,
                    message: 'Correction updated successfully',
                    severity: 'success'
                });

            } else {
                await api.createCorrection(data);

                setSnackbar({
                    open: true,
                    message: 'Correction submitted successfully',
                    severity: 'success'
                });
            }

            handleCloseDialog();
            fetchCorrections();

        } catch (error) {
            console.error('Error submitting correction:', error);

            setSnackbar({
                open: true,
                message: 'Failed to submit correction',
                severity: 'error'
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const getCorrectionTypeLabel = (type) => {
        switch (type) {
            case 'ADD_PUNCH': return 'Add Punch';
            case 'EDIT_PUNCH': return 'Edit Punch';
            case 'DELETE_PUNCH': return 'Delete Punch';
            default: return type;
        }
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container sx={{ mt: 4 }}>

                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h4">
                        Punch Correction Requests
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        New Request
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {corrections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No correction requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                corrections.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{getCorrectionTypeLabel(c.correction_type)}</TableCell>
                                        <TableCell>{c.requested_date}</TableCell>
                                        <TableCell>{c.requested_time}</TableCell>

                                        <TableCell>
                                            <Chip
                                                label={c.status}
                                                color={getStatusColor(c.status)}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {c.status === 'PENDING' && (
                                                <IconButton onClick={() => handleOpenDialog(c)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Dialog */}
                <Dialog open={open} onClose={handleCloseDialog}>
                    <DialogTitle>
                        {editingCorrection ? 'Edit Request' : 'New Request'}
                    </DialogTitle>

                    <DialogContent>

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Correction Type</InputLabel>
                            <Select
                                value={formData.correction_type}
                                onChange={(e) =>
                                    setFormData({ ...formData, correction_type: e.target.value })
                                }
                            >
                                <MenuItem value="ADD_PUNCH">Add Punch</MenuItem>
                                <MenuItem value="EDIT_PUNCH">Edit Punch</MenuItem>
                                <MenuItem value="DELETE_PUNCH">Delete Punch</MenuItem>
                            </Select>
                        </FormControl>

                        <DatePicker
                            label="Date"
                            value={formData.requested_date}
                            onChange={(d) =>
                                setFormData({ ...formData, requested_date: d || new Date() })
                            }
                            slotProps={{ textField: { fullWidth: true, sx: { mt: 2 } } }}
                        />

                        <TimePicker
                            label="Time"
                            value={formData.requested_time}
                            onChange={(t) =>
                                setFormData({ ...formData, requested_time: t || new Date() })
                            }
                            slotProps={{ textField: { fullWidth: true, sx: { mt: 2 } } }}
                        />

                        <TextField
                            fullWidth
                            label="Reason"
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                            value={formData.reason}
                            onChange={(e) =>
                                setFormData({ ...formData, reason: e.target.value })
                            }
                        />

                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </Container>
        </LocalizationProvider>
    );
};

export default PunchCorrections;