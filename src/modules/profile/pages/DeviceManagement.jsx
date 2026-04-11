import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Phonelink as PhoneIcon,
    Web as WebIcon,
    CheckCircle as ApprovedIcon,
    Pending as PendingIcon,
    Cancel as RejectedIcon,
    Block as BlockedIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import api from 'core/services/api';

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

const getPlatformColor = (platform) => {
    switch (platform) {
        case 'ANDROID':
            return 'success';
        case 'IOS':
            return 'info';
        case 'WEB':
        default:
            return 'default';
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

const DeviceManagement = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    const [pendingDevices, setPendingDevices] = useState([]);

    const fetchDevices = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getMyDevices();
            setDevices(res.data);
            const storedDeviceId = api.getDeviceId();
            setCurrentDeviceId(storedDeviceId);
            setPendingDevices(res.data.filter(d => d.status === 'PENDING'));
        } catch (err) {
            console.error('Failed to fetch devices:', err);
            setError('Failed to load devices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const approvedDevices = devices.filter(d => d.status === 'APPROVED');
    const currentDevice = devices.find(d => d.device_id === currentDeviceId);
    const currentDeviceStatus = currentDevice?.status;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                        Device Management
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchDevices}
                    variant="outlined"
                    size="small"
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {currentDeviceStatus === 'PENDING' && (
                <Alert severity="warning" sx={{ mb: 3 }} icon={<PendingIcon />}>
                    <Typography variant="body2" fontWeight="bold">
                        Your current device is pending approval
                    </Typography>
                    <Typography variant="body2">
                        You will be able to use the application once the administrator approves your device.
                    </Typography>
                </Alert>
            )}

            {currentDeviceStatus === 'REJECTED' && (
                <Alert severity="error" sx={{ mb: 3 }} icon={<RejectedIcon />}>
                    <Typography variant="body2" fontWeight="bold">
                        Your current device has been rejected
                    </Typography>
                    <Typography variant="body2">
                        Please contact your administrator to request device approval.
                    </Typography>
                </Alert>
            )}

            {currentDeviceStatus === 'BLOCKED' && (
                <Alert severity="error" sx={{ mb: 3 }} icon={<BlockedIcon />}>
                    <Typography variant="body2" fontWeight="bold">
                        Your current device has been blocked
                    </Typography>
                    <Typography variant="body2">
                        Please contact your administrator to unblock your device.
                    </Typography>
                </Alert>
            )}

            {currentDeviceStatus === 'APPROVED' && (
                <Alert severity="success" sx={{ mb: 3 }} icon={<ApprovedIcon />}>
                    <Typography variant="body2">
                        Your current device is approved and active.
                    </Typography>
                </Alert>
            )}

            {pendingDevices.length > 1 && (
                <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
                    You have {pendingDevices.length} device(s) pending approval. You will need administrator approval for each new device.
                </Alert>
            )}

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Your Devices ({approvedDevices.length} approved)
            </Typography>

            <Grid container spacing={2}>
                {devices.map((device) => (
                    <Grid item xs={12} sm={6} md={4} key={device.id}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderColor: device.device_id === currentDeviceId ? 'primary.main' : 'divider',
                                borderWidth: device.device_id === currentDeviceId ? 2 : 1,
                                opacity: device.status === 'BLOCKED' || device.status === 'REJECTED' ? 0.6 : 1,
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getPlatformIcon(device.platform)}
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {device.device_name || 'Unknown Device'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {device.browser} {device.browser_version} on {device.os} {device.os_version}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Chip
                                        icon={getStatusIcon(device.status)}
                                        label={device.status}
                                        color={getStatusColor(device.status)}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={device.platform}
                                        color={getPlatformColor(device.platform)}
                                        size="small"
                                        variant="outlined"
                                    />
                                    {device.device_id === currentDeviceId && (
                                        <Chip
                                            label="Current"
                                            color="primary"
                                            size="small"
                                        />
                                    )}
                                    {device.is_primary && (
                                        <Chip
                                            label="Primary"
                                            color="primary"
                                            size="small"
                                        />
                                    )}
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Last active: {formatDate(device.last_active)}
                                    </Typography>
                                    {device.ip_address && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            IP: {device.ip_address}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Created: {formatDate(device.created_at)}
                                    </Typography>
                                </Box>

                                {(device.status === 'REJECTED' || device.status === 'BLOCKED') && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="error">
                                            Contact administrator to resolve this issue.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {devices.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                        No devices registered.
                    </Typography>
                </Box>
            )}

            <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Device Registration Policy:
                </Typography>
                <Typography variant="caption" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                    <li>All new devices require approval from Super Administrator</li>
                    <li>You can only punch from mobile application (Android/iOS)</li>
                    <li>Web login is allowed but punching is restricted to mobile only</li>
                    <li>Contact your administrator if your device is rejected or blocked</li>
                </Typography>
            </Box>
        </Box>
    );
};

export default DeviceManagement;
