import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, CircularProgress, Grid, Card, CardContent, Divider, Stack, IconButton, Tooltip, Tabs, Tab
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from 'core/services/api';
import { TableSkeleton } from 'shared/components/SkeletonLoader';

const PunchCorrectionManagement = () => {
    const [corrections, setCorrections] = useState([]);
    const [newCorrections, setNewCorrections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [selected, setSelected] = useState(null);
    const [dialogType, setDialogType] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [oldRes, newRes] = await Promise.all([
                api.get('/attendance/corrections/').catch(() => ({ data: [] })),
                api.get('/attendance/correction-requests/').catch(() => ({ data: [] }))
            ]);
            
            const oldData = oldRes?.data?.results || oldRes?.data || [];
            const newData = newRes?.data?.results || newRes?.data || [];
            
            setCorrections(oldData);
            setNewCorrections(newData);
        } catch (err) {
            console.error('Error fetching corrections:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'ADD': case 'ADD_PUNCH': return 'success';
            case 'EDIT': case 'EDIT_PUNCH': return 'primary';
            case 'DELETE': case 'DELETE_PUNCH': return 'error';
            default: return 'default';
        }
    };

    const counts = useMemo(() => ({
        old: {
            pending: corrections.filter(c => c.status === 'PENDING').length,
            approved: corrections.filter(c => c.status === 'APPROVED').length,
            rejected: corrections.filter(c => c.status === 'REJECTED').length
        },
        new: {
            pending: newCorrections.filter(c => c.status === 'PENDING').length,
            approved: newCorrections.filter(c => c.status === 'APPROVED').length,
            rejected: newCorrections.filter(c => c.status === 'REJECTED').length
        }
    }), [corrections, newCorrections]);

    const filteredCorrections = useMemo(() => {
        let data = [];
        switch (activeTab) {
            case 0: data = corrections.filter(c => c.status === 'PENDING'); break;
            case 1: data = corrections.filter(c => c.status === 'APPROVED'); break;
            case 2: data = corrections.filter(c => c.status === 'REJECTED'); break;
            default: data = corrections;
        }
        return data;
    }, [activeTab, corrections]);

    const filteredNewCorrections = useMemo(() => {
        let data = [];
        switch (activeTab) {
            case 0: data = newCorrections.filter(c => c.status === 'PENDING'); break;
            case 1: data = newCorrections.filter(c => c.status === 'APPROVED'); break;
            case 2: data = newCorrections.filter(c => c.status === 'REJECTED'); break;
            default: data = newCorrections;
        }
        return data;
    }, [activeTab, newCorrections]);

    const handleAction = async (type, action) => {
        setActionLoading(true);
        try {
            if (type === 'old') {
                if (action === 'APPROVE') {
                    await api.post(`/attendance/corrections/${selected.id}/approve/`);
                } else {
                    await api.post(`/attendance/corrections/${selected.id}/reject/`, { remarks });
                }
            } else {
                await api.reviewCorrection(selected.id, action, remarks);
            }
            setDialogType(null);
            setSelected(null);
            setRemarks('');
            fetchData();
        } catch (err) {
            console.error('Error:', err);
            alert('Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const renderDetailView = () => {
        if (!selected) return null;
        const hasCoords = selected.from_latitude && selected.from_longitude;

        return (
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>Request Details</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography><strong>Employee:</strong> {selected.employee_name || `${selected.employee_details?.first_name} ${selected.employee_details?.last_name}`}</Typography>
                            <Typography><strong>Type:</strong> <Chip label={selected.correction_type || selected.correction_type} color={getTypeColor(selected.correction_type)} size="small" /></Typography>
                            <Typography><strong>Date:</strong> {selected.correction_date || selected.requested_date}</Typography>
                            <Typography><strong>Time:</strong> {selected.correction_time || selected.requested_time}</Typography>
                            <Typography><strong>Punch Type:</strong> {selected.punch_type || selected.requested_punch_type}</Typography>
                            <Typography><strong>Distance:</strong> {selected.calculated_distance || selected.distance || 0} km</Typography>
                            <Typography sx={{ mt: 1 }}><strong>Reason:</strong> {selected.reason}</Typography>
                            {selected.review_comment && (
                                <Typography sx={{ mt: 1, color: 'success.main' }}><strong>Admin Comment:</strong> {selected.review_comment}</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>Location Preview</Typography>
                            <Divider sx={{ my: 1 }} />
                            {hasCoords ? (
                                <Box sx={{ height: 200, borderRadius: 1, overflow: 'hidden' }}>
                                    <MapContainer center={[selected.from_latitude, selected.from_longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[selected.from_latitude, selected.from_longitude]}>
                                            <Popup>From: {selected.from_address}</Popup>
                                        </Marker>
                                        {selected.to_latitude && (
                                            <>
                                                <Marker position={[selected.to_latitude, selected.to_longitude]}>
                                                    <Popup>To: {selected.to_address}</Popup>
                                                </Marker>
                                                <Polyline positions={[[selected.from_latitude, selected.from_longitude], [selected.to_latitude, selected.to_longitude]]} color="blue" />
                                            </>
                                        )}
                                    </MapContainer>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">No map data available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    if (loading) {
        return <Box sx={{ p: 3 }}><Typography variant="h5" mb={3}>Punch Corrections</Typography><TableSkeleton rows={6} columns={6} /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Punch Corrections</Typography>
                    <Typography variant="caption" color="text.secondary">Review and manage employee correction requests</Typography>
                </Box>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
            </Box>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label={<Chip label={`Pending (${counts.old.pending + counts.new.pending})`} color="warning" size="small" />} />
                <Tab label={<Chip label={`Approved (${counts.old.approved + counts.new.approved})`} color="success" size="small" />} />
                <Tab label={<Chip label={`Rejected (${counts.old.rejected + counts.new.rejected})`} color="error" size="small" />} />
            </Tabs>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><strong>Employee</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Distance</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCorrections.length === 0 && filteredNewCorrections.length === 0 ? (
                            <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>No {activeTab === 0 ? 'pending' : activeTab === 1 ? 'approved' : 'rejected'} corrections</TableCell></TableRow>
                        ) : (
                            <>
                                {filteredCorrections.map((corr) => (
                                    <TableRow key={`old-${corr.id}`} hover>
                                        <TableCell>{corr.employee_details?.first_name} {corr.employee_details?.last_name}</TableCell>
                                        <TableCell><Chip label={corr.correction_type} color={getTypeColor(corr.correction_type)} size="small" /></TableCell>
                                        <TableCell>{corr.requested_date}</TableCell>
                                        <TableCell>{corr.distance ? `${corr.distance} km` : '-'}</TableCell>
                                        <TableCell><Chip label={corr.status} color={getStatusColor(corr.status)} size="small" /></TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="View"><IconButton size="small" onClick={() => { setSelected({ ...corr, type: 'old' }); setDialogType('view'); }}><ViewIcon /></IconButton></Tooltip>
                                                {corr.status === 'PENDING' && (
                                                    <>
                                                        <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => { setSelected({ ...corr, type: 'old' }); setDialogType('approve'); }}><ApproveIcon /></IconButton></Tooltip>
                                                        <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => { setSelected({ ...corr, type: 'old' }); setDialogType('reject'); }}><RejectIcon /></IconButton></Tooltip>
                                                    </>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredNewCorrections.map((corr) => (
                                    <TableRow key={`new-${corr.id}`} hover>
                                        <TableCell>{corr.employee_name}</TableCell>
                                        <TableCell><Chip label={corr.correction_type} color={getTypeColor(corr.correction_type)} size="small" /></TableCell>
                                        <TableCell>{corr.correction_date}</TableCell>
                                        <TableCell>{corr.calculated_distance ? `${corr.calculated_distance} km` : '-'}</TableCell>
                                        <TableCell><Chip label={corr.status} color={getStatusColor(corr.status)} size="small" /></TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="View"><IconButton size="small" onClick={() => { setSelected({ ...corr, type: 'new' }); setDialogType('view'); }}><ViewIcon /></IconButton></Tooltip>
                                                {corr.status === 'PENDING' && (
                                                    <>
                                                        <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => { setSelected({ ...corr, type: 'new' }); setDialogType('approve'); }}><ApproveIcon /></IconButton></Tooltip>
                                                        <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => { setSelected({ ...corr, type: 'new' }); setDialogType('reject'); }}><RejectIcon /></IconButton></Tooltip>
                                                    </>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogType === 'view'} onClose={() => { setDialogType(null); setSelected(null); }} maxWidth="md" fullWidth>
                <DialogTitle>Correction Details</DialogTitle>
                <DialogContent>{renderDetailView()}</DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialogType(null); setSelected(null); }}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogType === 'approve' || dialogType === 'reject'} onClose={() => { setDialogType(null); setSelected(null); setRemarks(''); }} maxWidth="sm" fullWidth>
                <DialogTitle>{dialogType === 'approve' ? 'Approve' : 'Reject'} Correction</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Are you sure you want to {dialogType} this correction request?</Typography>
                    <TextField fullWidth multiline rows={3} label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks..." />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDialogType(null); setSelected(null); setRemarks(''); }}>Cancel</Button>
                    <Button variant="contained" color={dialogType === 'approve' ? 'success' : 'error'} onClick={() => handleAction(selected?.type, dialogType === 'approve' ? 'APPROVE' : 'REJECT')} disabled={actionLoading}>
                        {actionLoading ? <CircularProgress size={20} /> : dialogType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PunchCorrectionManagement;
