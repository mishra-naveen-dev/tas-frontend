import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Badge,
    Tabs,
    Tab,
    Autocomplete,
} from '@mui/material';
import {
    Search as SearchIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Block as BlockIcon,
    LockOpen as UnlockIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    Phonelink as PhoneIcon,
    Web as WebIcon,
    Pending as PendingIcon,
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    DeleteSweep as ResetIcon,
    PersonOff as ResetUserIcon,
} from '@mui/icons-material';
import api from 'core/services/api';
import { TableSkeleton } from 'shared/components/SkeletonLoader';

const getPlatformIcon = (platform) => {
    switch (platform) {
        case 'ANDROID':
        case 'IOS':
            return <PhoneIcon color="primary" />;
        case 'WEB':
        default:
            return <WebIcon color="action" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'REJECTED':
            return 'error';
        case 'BLOCKED':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'APPROVED':
            return <ApprovedIcon fontSize="small" />;
        case 'PENDING':
            return <PendingIcon fontSize="small" />;
        case 'REJECTED':
        case 'BLOCKED':
            return <RejectedIcon fontSize="small" />;
        default:
            return null;
    }
};

const AdminDeviceManagement = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [platformFilter, setPlatformFilter] = useState('ALL');
    const [viewDialog, setViewDialog] = useState({ open: false, device: null });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, device: null, action: null });
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [users, setUsers] = useState([]);
    const [resetDialog, setResetDialog] = useState({ open: false, user: null });
    const [resetSuccess, setResetSuccess] = useState(null);

    const fetchDevices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }
            const res = await api.getAllDevices(params);
            const data = res.data;
            // Handle paginated or non-paginated response
            const devicesData = data?.results || data || [];
            setDevices(Array.isArray(devicesData) ? devicesData : []);
        } catch (err) {
            console.error('Failed to fetch devices:', err);
            setError(err?.response?.data?.detail || err?.response?.data?.error || 'Failed to load devices. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const handleAction = async (action, device) => {
        setActionLoading(true);
        try {
            let endpoint;
            switch (action) {
                case 'approve':
                    endpoint = `/organization/devices/${device.id}/approve/`;
                    break;
                case 'reject':
                    endpoint = `/organization/devices/${device.id}/reject/`;
                    break;
                case 'block':
                    endpoint = `/organization/devices/${device.id}/block/`;
                    break;
                case 'unblock':
                    endpoint = `/organization/devices/${device.id}/unblock/`;
                    break;
                default:
                    return;
            }
            
            await api.post(endpoint);
            setConfirmDialog({ open: false, device: null, action: null });
            fetchDevices();
        } catch (err) {
            console.error(`Failed to ${action} device:`, err);
            alert(`Failed to ${action} device`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveAllPending = async () => {
        setActionLoading(true);
        try {
            await api.post('/organization/devices/approve_all_pending/');
            setConfirmDialog({ open: false, device: null, action: null });
            fetchDevices();
        } catch (err) {
            console.error('Failed to approve all pending devices:', err);
            alert('Failed to approve all pending devices');
        } finally {
            setActionLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/organization/users/', { params: { page_size: 100 } });
            setUsers(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleResetUserDevices = async () => {
        if (!resetDialog.user) return;
        
        setActionLoading(true);
        setResetSuccess(null);
        try {
            const res = await api.post('/organization/devices/reset_user_devices/', {
                user_id: resetDialog.user.id
            });
            setResetSuccess(res.data.message);
            setTimeout(() => {
                setResetDialog({ open: false, user: null });
                setResetSuccess(null);
                fetchDevices();
            }, 2000);
        } catch (err) {
            console.error('Failed to reset user devices:', err);
            alert(err.response?.data?.error || 'Failed to reset user devices');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredDevices = devices.filter((device) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            device.username?.toLowerCase().includes(searchLower) ||
            device.employee_id?.toLowerCase().includes(searchLower) ||
            device.device_name?.toLowerCase().includes(searchLower) ||
            device.device_id?.toLowerCase().includes(searchLower);
        
        const matchesPlatform = platformFilter === 'ALL' || device.platform === platformFilter;
        
        let matchesStatus = true;
        if (activeTab === 1) matchesStatus = device.status === 'PENDING';
        else if (activeTab === 2) matchesStatus = device.status === 'APPROVED';
        else if (activeTab === 3) matchesStatus = device.status === 'BLOCKED' || device.status === 'REJECTED';
        
        return matchesSearch && matchesPlatform && matchesStatus;
    });

    const pendingCount = devices.filter(d => d.status === 'PENDING').length;

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Device Management
                    </Typography>
                </Box>
                <TableSkeleton rows={8} columns={7} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    Device Management (Super Admin Only)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        startIcon={<ResetUserIcon />}
                        onClick={() => {
                            fetchUsers();
                            setResetDialog({ open: true, user: null });
                        }}
                        variant="outlined"
                        size="small"
                        color="warning"
                    >
                        Reset User Devices
                    </Button>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={fetchDevices}
                        variant="outlined"
                        size="small"
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label={`All (${devices.length})`} />
                <Tab
                    label={
                        <Badge badgeContent={pendingCount} color="warning">
                            Pending
                        </Badge>
                    }
                />
                <Tab label={`Approved (${devices.filter(d => d.status === 'APPROVED').length})`} />
                <Tab label={`Blocked (${devices.filter(d => d.status === 'BLOCKED' || d.status === 'REJECTED').length})`} />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search by username, employee ID, device..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Platform</InputLabel>
                    <Select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        label="Platform"
                    >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="WEB">Web</MenuItem>
                        <MenuItem value="ANDROID">Android</MenuItem>
                        <MenuItem value="IOS">iOS</MenuItem>
                    </Select>
                </FormControl>
                {activeTab === 1 && pendingCount > 1 && (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => setConfirmDialog({ open: true, device: null, action: 'approve_all' })}
                    >
                        Approve All ({pendingCount})
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Device</strong></TableCell>
                            <TableCell><strong>Platform</strong></TableCell>
                            <TableCell><strong>Browser / OS</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Last Active</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDevices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                                    <Typography color="text.secondary">No devices found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDevices.map((device) => (
                                <TableRow key={device.id} hover>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {device.username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {device.employee_id || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getPlatformIcon(device.platform)}
                                            <Box>
                                                <Typography variant="body2">
                                                    {device.device_name || 'Unknown'}
                                                </Typography>
                                                {device.is_primary && (
                                                    <Chip label="Primary" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={device.platform}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {device.browser} {device.browser_version}
                                        </Typography>
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            {device.os} {device.os_version}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getStatusIcon(device.status)}
                                            label={device.status}
                                            color={getStatusColor(device.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {formatDate(device.last_active)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setViewDialog({ open: true, device })}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {device.status === 'PENDING' && (
                                                <>
                                                    <Tooltip title="Approve">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => setConfirmDialog({ open: true, device, action: 'approve' })}
                                                        >
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => setConfirmDialog({ open: true, device, action: 'reject' })}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}

                                            {device.status === 'APPROVED' && (
                                                <Tooltip title="Block">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => setConfirmDialog({ open: true, device, action: 'block' })}
                                                    >
                                                        <BlockIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {(device.status === 'BLOCKED' || device.status === 'REJECTED') && (
                                                <Tooltip title="Unblock">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => setConfirmDialog({ open: true, device, action: 'unblock' })}
                                                    >
                                                        <UnlockIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Total: {filteredDevices.length} devices
            </Typography>

            <Dialog
                open={viewDialog.open}
                onClose={() => setViewDialog({ open: false, device: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Device Details</DialogTitle>
                <DialogContent>
                    {viewDialog.device && (
                        <Box sx={{ pt: 1 }}>
                            <Box sx={{ display: 'grid', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">User</Typography>
                                    <Typography variant="body1">{viewDialog.device.username}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                                    <Typography variant="body1">{viewDialog.device.employee_id || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Device ID</Typography>
                                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                        {viewDialog.device.device_id}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            icon={getStatusIcon(viewDialog.device.status)}
                                            label={viewDialog.device.status}
                                            color={getStatusColor(viewDialog.device.status)}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Device Name</Typography>
                                    <Typography variant="body1">{viewDialog.device.device_name || 'Unknown'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Platform</Typography>
                                    <Typography variant="body1">{viewDialog.device.platform}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Browser</Typography>
                                    <Typography variant="body1">
                                        {viewDialog.device.browser} {viewDialog.device.browser_version}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Operating System</Typography>
                                    <Typography variant="body1">
                                        {viewDialog.device.os} {viewDialog.device.os_version}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">IP Address</Typography>
                                    <Typography variant="body1">{viewDialog.device.ip_address || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Last Active</Typography>
                                    <Typography variant="body1">{formatDate(viewDialog.device.last_active)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Created</Typography>
                                    <Typography variant="body1">{formatDate(viewDialog.device.created_at)}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialog({ open: false, device: null })}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDialog.open}
                onClose={() => !actionLoading && setConfirmDialog({ open: false, device: null, action: null })}
            >
                <DialogTitle>
                    {confirmDialog.action === 'approve' && 'Approve Device'}
                    {confirmDialog.action === 'reject' && 'Reject Device'}
                    {confirmDialog.action === 'block' && 'Block Device'}
                    {confirmDialog.action === 'unblock' && 'Unblock Device'}
                    {confirmDialog.action === 'approve_all' && 'Approve All Pending Devices'}
                </DialogTitle>
                <DialogContent>
                    {confirmDialog.action === 'approve' && (
                        <Typography>
                            Are you sure you want to approve device <strong>{confirmDialog.device?.device_name}</strong> for user <strong>{confirmDialog.device?.username}</strong>?
                        </Typography>
                    )}
                    {confirmDialog.action === 'reject' && (
                        <Typography>
                            Are you sure you want to reject device <strong>{confirmDialog.device?.device_name}</strong> for user <strong>{confirmDialog.device?.username}</strong>?
                        </Typography>
                    )}
                    {confirmDialog.action === 'block' && (
                        <Typography>
                            Are you sure you want to block device <strong>{confirmDialog.device?.device_name}</strong> for user <strong>{confirmDialog.device?.username}</strong>?
                        </Typography>
                    )}
                    {confirmDialog.action === 'unblock' && (
                        <Typography>
                            Are you sure you want to unblock device <strong>{confirmDialog.device?.device_name}</strong> for user <strong>{confirmDialog.device?.username}</strong>?
                        </Typography>
                    )}
                    {confirmDialog.action === 'approve_all' && (
                        <Typography>
                            Are you sure you want to approve all {pendingCount} pending devices? This will allow all users with pending devices to log in.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({ open: false, device: null, action: null })}
                        disabled={actionLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (confirmDialog.action === 'approve_all') {
                                handleApproveAllPending();
                            } else {
                                handleAction(confirmDialog.action, confirmDialog.device);
                            }
                        }}
                        color={
                            confirmDialog.action === 'approve' || confirmDialog.action === 'unblock'
                                ? 'success'
                                : confirmDialog.action === 'approve_all'
                                ? 'success'
                                : 'error'
                        }
                        variant="contained"
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={resetDialog.open}
                onClose={() => !actionLoading && setResetDialog({ open: false, user: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ResetIcon color="warning" />
                    Reset User Devices
                </DialogTitle>
                <DialogContent>
                    {resetSuccess ? (
                        <Alert severity="success" sx={{ mt: 1 }}>
                            {resetSuccess}
                        </Alert>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Select a user to reset all their devices. After reset, the user will be able to login from a new device (first device is auto-approved).
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                Use this when an employee loses their device and needs to login from a new device.
                            </Typography>
                            <Autocomplete
                                options={users}
                                getOptionLabel={(option) => `${option.username} (${option.employee_id || 'No ID'})`}
                                value={resetDialog.user}
                                onChange={(e, newValue) => setResetDialog({ ...resetDialog, user: newValue })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select User"
                                        placeholder="Search by username or employee ID"
                                        size="small"
                                    />
                                )}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setResetDialog({ open: false, user: null })}
                        disabled={actionLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleResetUserDevices}
                        color="warning"
                        variant="contained"
                        disabled={actionLoading || !resetDialog.user || !!resetSuccess}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Reset Devices'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminDeviceManagement;
