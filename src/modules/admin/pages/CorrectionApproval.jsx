import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon,
    Map as MapIcon,
    Place as PlaceIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    DirectionsWalk as WalkIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from 'core/services/api';

const CorrectionApproval = () => {
    const [corrections, setCorrections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedCorrection, setSelectedCorrection] = useState(null);
    const [detailDialog, setDetailDialog] = useState(false);
    const [reviewDialog, setReviewDialog] = useState(false);
    const [reviewComment, setReviewComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCorrections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getCorrectionRequests({ page_size: 100 });
            setCorrections(res.data.results || res.data || []);
        } catch (err) {
            console.error('Failed to fetch corrections:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCorrections();
    }, [fetchCorrections]);

    const handleReview = async (action) => {
        if (!selectedCorrection) return;

        setActionLoading(true);
        try {
            await api.reviewCorrection(selectedCorrection.id, action, reviewComment);
            setReviewDialog(false);
            setDetailDialog(false);
            setSelectedCorrection(null);
            setReviewComment('');
            fetchCorrections();
        } catch (err) {
            console.error('Failed to review correction:', err);
            alert(err.response?.data?.error || 'Failed to process correction');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'ADD': return 'success';
            case 'EDIT': return 'primary';
            case 'DELETE': return 'error';
            default: return 'default';
        }
    };

    const filteredCorrections = corrections.filter(corr => {
        if (activeTab === 0) return corr.status === 'PENDING';
        if (activeTab === 1) return corr.status === 'APPROVED';
        if (activeTab === 2) return corr.status === 'REJECTED';
        return true;
    });

    const renderDetailView = () => {
        if (!selectedCorrection) return null;

        const hasCoordinates = selectedCorrection.from_latitude && selectedCorrection.from_longitude;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Request Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Employee
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCorrection.employee_name}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Correction Type
                                </Typography>
                                <Chip
                                    label={selectedCorrection.correction_type}
                                    color={getTypeColor(selectedCorrection.correction_type)}
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Date & Time
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCorrection.correction_date} at {selectedCorrection.correction_time}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Punch Type
                                </Typography>
                                <Chip
                                    label={selectedCorrection.punch_type === 'PUNCH_IN' ? 'PUNCH IN' : 'PUNCH OUT'}
                                    color={selectedCorrection.punch_type === 'PUNCH_IN' ? 'success' : 'warning'}
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    From Address
                                </Typography>
                                <Typography variant="body1">
                                    {selectedCorrection.from_address}
                                </Typography>
                                {hasCoordinates && (
                                    <Typography variant="caption" color="text.secondary">
                                        Coords: {selectedCorrection.from_latitude?.toFixed(6)}, {selectedCorrection.from_longitude?.toFixed(6)}
                                    </Typography>
                                )}
                            </Grid>

                            {selectedCorrection.to_address && (
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        To Address
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedCorrection.to_address}
                                    </Typography>
                                    {selectedCorrection.to_latitude && (
                                        <Typography variant="caption" color="text.secondary">
                                            Coords: {selectedCorrection.to_latitude?.toFixed(6)}, {selectedCorrection.to_longitude?.toFixed(6)}
                                        </Typography>
                                    )}
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Calculated Distance
                                </Typography>
                                <Typography variant="h5" color="primary">
                                    {selectedCorrection.calculated_distance || 0} km
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                    Reason
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {selectedCorrection.reason}
                                </Typography>
                            </Grid>

                            {selectedCorrection.review_comment && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Admin Comment
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                                        {selectedCorrection.review_comment}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Location Preview
                        </Typography>

                        {hasCoordinates ? (
                            <Box sx={{ height: 300, borderRadius: 1, overflow: 'hidden' }}>
                                <MapContainer
                                    center={[selectedCorrection.from_latitude, selectedCorrection.from_longitude]}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap'
                                    />
                                    <Marker
                                        position={[selectedCorrection.from_latitude, selectedCorrection.from_longitude]}
                                    >
                                        <Popup>
                                            From: {selectedCorrection.from_address}
                                        </Popup>
                                    </Marker>
                                    {selectedCorrection.to_latitude && selectedCorrection.to_longitude && (
                                        <>
                                            <Marker
                                                position={[selectedCorrection.to_latitude, selectedCorrection.to_longitude]}
                                            >
                                                <Popup>
                                                    To: {selectedCorrection.to_address}
                                                </Popup>
                                            </Marker>
                                            <Polyline
                                                positions={[
                                                    [selectedCorrection.from_latitude, selectedCorrection.from_longitude],
                                                    [selectedCorrection.to_latitude, selectedCorrection.to_longitude]
                                                ]}
                                                color="blue"
                                                weight={3}
                                            />
                                        </>
                                    )}
                                </MapContainer>
                            </Box>
                        ) : (
                            <Alert severity="warning">
                                No valid coordinates available for map preview
                            </Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Correction Requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Review and approve/reject employee punch corrections
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={fetchCorrections}
                >
                    Refresh
                </Button>
            </Box>

            <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{ mb: 3 }}
            >
                <Tab label={
                    <Chip
                        label={`Pending (${corrections.filter(c => c.status === 'PENDING').length})`}
                        color="warning"
                        size="small"
                    />
                } />
                <Tab label={
                    <Chip
                        label={`Approved (${corrections.filter(c => c.status === 'APPROVED').length})`}
                        color="success"
                        size="small"
                    />
                } />
                <Tab label={
                    <Chip
                        label={`Rejected (${corrections.filter(c => c.status === 'REJECTED').length})`}
                        color="error"
                        size="small"
                    />
                } />
            </Tabs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell><strong>Employee</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>From Address</strong></TableCell>
                                <TableCell><strong>Distance</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Submitted</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCorrections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                        No {activeTab === 0 ? 'pending' : activeTab === 1 ? 'approved' : 'rejected'} corrections
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCorrections.map((corr) => (
                                    <TableRow key={corr.id} hover>
                                        <TableCell>{corr.employee_name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={corr.correction_type}
                                                color={getTypeColor(corr.correction_type)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {corr.correction_date}<br />
                                            <Typography variant="caption">{corr.correction_time}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={corr.from_address}>
                                                <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {corr.from_address}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {corr.calculated_distance ? `${corr.calculated_distance} km` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={corr.status}
                                                color={getStatusColor(corr.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(corr.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedCorrection(corr);
                                                            setDetailDialog(true);
                                                        }}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {corr.status === 'PENDING' && (
                                                    <>
                                                        <Tooltip title="Approve">
                                                            <IconButton
                                                                size="small"
                                                                color="success"
                                                                onClick={() => {
                                                                    setSelectedCorrection(corr);
                                                                    setReviewDialog(true);
                                                                }}
                                                            >
                                                                <ApproveIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Reject">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => {
                                                                    setSelectedCorrection(corr);
                                                                    setReviewDialog(true);
                                                                }}
                                                            >
                                                                <RejectIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Detail Dialog */}
            <Dialog
                open={detailDialog}
                onClose={() => setDetailDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Correction Request Details
                </DialogTitle>
                <DialogContent>
                    {renderDetailView()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog(false)}>Close</Button>
                    {selectedCorrection?.status === 'PENDING' && (
                        <>
                            <Button
                                color="error"
                                variant="outlined"
                                startIcon={<RejectIcon />}
                                onClick={() => {
                                    setDetailDialog(false);
                                    setReviewDialog(true);
                                }}
                            >
                                Reject
                            </Button>
                            <Button
                                color="success"
                                variant="contained"
                                startIcon={<ApproveIcon />}
                                onClick={() => {
                                    setDetailDialog(false);
                                    setReviewDialog(true);
                                }}
                            >
                                Approve
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Review Dialog */}
            <Dialog
                open={reviewDialog}
                onClose={() => setReviewDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Review Correction Request
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Are you sure you want to {selectedCorrection?.status === 'PENDING' ? 'approve' : 'reject'} this correction request?
                    </Alert>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Comment (Optional)"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Add a comment for the employee..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewDialog(false)} disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="outlined"
                        onClick={() => handleReview('REJECT')}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={20} /> : <RejectIcon />}
                    >
                        Reject
                    </Button>
                    <Button
                        color="success"
                        variant="contained"
                        onClick={() => handleReview('APPROVE')}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={20} /> : <ApproveIcon />}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CorrectionApproval;
