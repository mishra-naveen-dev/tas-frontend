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
    Chip,
    Box,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    Tabs,
    Tab
} from '@mui/material';

import {
    Check as ApproveIcon,
    Close as RejectIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';

import api from 'core/services/api';

const PunchCorrectionManagement = () => {
    const [corrections, setCorrections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [selectedCorrection, setSelectedCorrection] = useState(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState('approve');
    const [reviewNotes, setReviewNotes] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchCorrections();
    }, []);

    const fetchCorrections = async () => {
        try {
            const response = await api.get('/attendance/corrections/');
            setCorrections(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || []
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

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleReviewDialogOpen = (correction, action) => {
        setSelectedCorrection(correction);
        setReviewAction(action);
        setReviewNotes('');
        setReviewDialogOpen(true);
    };

    const handleReviewDialogClose = () => {
        setReviewDialogOpen(false);
        setSelectedCorrection(null);
        setReviewNotes('');
    };

    const handleReviewSubmit = async () => {
        if (!selectedCorrection) return;

        try {
            const endpoint = reviewAction === 'approve' ? 'approve' : 'reject';
            await api.post(`/attendance/corrections/${selectedCorrection.id}/${endpoint}/`, {
                review_notes: reviewNotes
            });

            setSnackbar({
                open: true,
                message: `Correction request ${reviewAction}d successfully`,
                severity: 'success'
            });

            handleReviewDialogClose();
            fetchCorrections();
        } catch (error) {
            console.error(`Error ${reviewAction}ing correction:`, error);
            setSnackbar({
                open: true,
                message: `Failed to ${reviewAction} correction request`,
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

    const filteredCorrections = corrections.filter(correction => {
        if (tabValue === 0) return correction.status === 'PENDING';
        if (tabValue === 1) return correction.status === 'APPROVED';
        if (tabValue === 2) return correction.status === 'REJECTED';
        return true;
    });

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Punch Correction Management
            </Typography>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="correction status tabs">
                    <Tab label={`Pending (${corrections.filter(c => c.status === 'PENDING').length})`} />
                    <Tab label={`Approved (${corrections.filter(c => c.status === 'APPROVED').length})`} />
                    <Tab label={`Rejected (${corrections.filter(c => c.status === 'REJECTED').length})`} />
                </Tabs>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Requested Date</TableCell>
                            <TableCell>Requested Time</TableCell>
                            <TableCell>Punch Type</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Submitted</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCorrections.map((correction) => (
                            <TableRow key={correction.id}>
                                <TableCell>
                                    {correction.employee_details.employee_id} - {correction.employee_details.first_name} {correction.employee_details.last_name}
                                </TableCell>
                                <TableCell>{getCorrectionTypeLabel(correction.correction_type)}</TableCell>
                                <TableCell>{correction.requested_date}</TableCell>
                                <TableCell>{correction.requested_time}</TableCell>
                                <TableCell>{correction.requested_punch_type}</TableCell>
                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {correction.reason}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={correction.status}
                                        color={getStatusColor(correction.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(correction.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {correction.status === 'PENDING' && (
                                        <Box>
                                            <Tooltip title="Approve">
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleReviewDialogOpen(correction, 'approve')}
                                                >
                                                    <ApproveIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleReviewDialogOpen(correction, 'reject')}
                                                >
                                                    <RejectIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                    {correction.status !== 'PENDING' && (
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => setSelectedCorrection(correction)}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onClose={handleReviewDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {reviewAction === 'approve' ? 'Approve' : 'Reject'} Correction Request
                </DialogTitle>
                <DialogContent>
                    {selectedCorrection && (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Request Details
                            </Typography>
                            <Typography><strong>Employee:</strong> {selectedCorrection.employee_details.employee_id} - {selectedCorrection.employee_details.first_name} {selectedCorrection.employee_details.last_name}</Typography>
                            <Typography><strong>Type:</strong> {getCorrectionTypeLabel(selectedCorrection.correction_type)}</Typography>
                            <Typography><strong>Requested:</strong> {selectedCorrection.requested_date} at {selectedCorrection.requested_time}</Typography>
                            <Typography><strong>Punch Type:</strong> {selectedCorrection.requested_punch_type}</Typography>
                            <Typography sx={{ mb: 2 }}><strong>Reason:</strong> {selectedCorrection.reason}</Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Review Notes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder={`Add notes for ${reviewAction === 'approve' ? 'approval' : 'rejection'}...`}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReviewDialogClose}>Cancel</Button>
                    <Button
                        onClick={handleReviewSubmit}
                        variant="contained"
                        color={reviewAction === 'approve' ? 'success' : 'error'}
                    >
                        {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Details Dialog for approved/rejected requests */}
            <Dialog
                open={!!selectedCorrection && !reviewDialogOpen}
                onClose={() => setSelectedCorrection(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Correction Request Details</DialogTitle>
                <DialogContent>
                    {selectedCorrection && (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="h6" gutterBottom>Request Information</Typography>
                            <Typography><strong>Employee:</strong> {selectedCorrection.employee_details.employee_id} - {selectedCorrection.employee_details.first_name} {selectedCorrection.employee_details.last_name}</Typography>
                            <Typography><strong>Type:</strong> {getCorrectionTypeLabel(selectedCorrection.correction_type)}</Typography>
                            <Typography><strong>Requested:</strong> {selectedCorrection.requested_date} at {selectedCorrection.requested_time}</Typography>
                            <Typography><strong>Punch Type:</strong> {selectedCorrection.requested_punch_type}</Typography>
                            <Typography sx={{ mb: 2 }}><strong>Reason:</strong> {selectedCorrection.reason}</Typography>

                            <Typography variant="h6" gutterBottom>Review Information</Typography>
                            <Typography><strong>Status:</strong> <Chip label={selectedCorrection.status} color={getStatusColor(selectedCorrection.status)} size="small" /></Typography>
                            {selectedCorrection.reviewed_by_details && (
                                <Typography><strong>Reviewed By:</strong> {selectedCorrection.reviewed_by_details.employee_id} - {selectedCorrection.reviewed_by_details.first_name} {selectedCorrection.reviewed_by_details.last_name}</Typography>
                            )}
                            {selectedCorrection.reviewed_at && (
                                <Typography><strong>Reviewed At:</strong> {new Date(selectedCorrection.reviewed_at).toLocaleString()}</Typography>
                            )}
                            {selectedCorrection.review_notes && (
                                <Typography><strong>Review Notes:</strong> {selectedCorrection.review_notes}</Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCorrection(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default PunchCorrectionManagement;
