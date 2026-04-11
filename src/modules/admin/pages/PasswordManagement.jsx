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
    Tooltip,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    LockOpen as UnlockIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Search as SearchIcon,
    AdminPanelSettings as AdminIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import api from 'core/services/api';

const PasswordManagement = () => {
    const [passwordData, setPasswordData] = useState({ users: [], total_users: 0, password_expiry_days: 90 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [resetDialog, setResetDialog] = useState({ open: false, user: null, type: 'expiry' });
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchPasswordData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getPasswordExpiryList();
            setPasswordData(res.data);
        } catch (err) {
            console.error('Failed to fetch password data:', err);
            setError('Failed to load password expiry data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPasswordData();
    }, [fetchPasswordData]);

    const handleResetPassword = async () => {
        if (!resetDialog.user) return;

        setActionLoading(true);
        setSuccessMessage(null);
        try {
            const res = await api.resetUserPasswordExpiry(resetDialog.user.id, resetDialog.type);
            setSuccessMessage(res.data.message);
            setTimeout(() => {
                setResetDialog({ open: false, user: null, type: 'expiry' });
                setSuccessMessage(null);
                fetchPasswordData();
            }, 2000);
        } catch (err) {
            console.error('Failed to reset password:', err);
            alert(err.response?.data?.error || 'Failed to reset password expiry');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = passwordData.users.filter((user) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            user.username?.toLowerCase().includes(searchLower) ||
            user.employee_id?.toLowerCase().includes(searchLower);

        let matchesTab = true;
        if (activeTab === 1) matchesTab = user.is_expired;
        else if (activeTab === 2) matchesTab = user.is_expiring_soon;
        else if (activeTab === 3) matchesTab = user.force_password_change && !user.is_expired;

        return matchesSearch && matchesTab;
    });

    const expiredCount = passwordData.users.filter(u => u.is_expired).length;
    const expiringSoonCount = passwordData.users.filter(u => u.is_expiring_soon).length;
    const forceChangeCount = passwordData.users.filter(u => u.force_password_change).length;

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Password Expiry Management
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Password expires every {passwordData.password_expiry_days} days for Admin and Employee roles
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchPasswordData}
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

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Alert
                    severity="error"
                    icon={<ErrorIcon />}
                    sx={{ flex: 1 }}
                >
                    <Typography variant="body2">
                        <strong>{expiredCount}</strong> users with expired passwords
                    </Typography>
                </Alert>
                <Alert
                    severity="warning"
                    icon={<WarningIcon />}
                    sx={{ flex: 1 }}
                >
                    <Typography variant="body2">
                        <strong>{expiringSoonCount}</strong> users expiring soon (14 days)
                    </Typography>
                </Alert>
                <Alert
                    severity="info"
                    icon={<SuccessIcon />}
                    sx={{ flex: 1 }}
                >
                    <Typography variant="body2">
                        <strong>{passwordData.total_users - expiredCount - expiringSoonCount}</strong> users with valid passwords
                    </Typography>
                </Alert>
            </Box>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label={`All (${passwordData.total_users})`} />
                <Tab label={<Chip label={`Expired (${expiredCount})`} color="error" size="small" />} />
                <Tab label={<Chip label={`Expiring Soon (${expiringSoonCount})`} color="warning" size="small" />} />
                <Tab label={<Chip label={`Force Change (${forceChangeCount})`} color="info" size="small" />} />
            </Tabs>

            <Box sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search by username or employee ID..."
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
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Last Password Change</strong></TableCell>
                            <TableCell><strong>Days Status</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                                    <Typography color="text.secondary">No users found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {user.role === 'ADMIN' ? (
                                                <AdminIcon color="action" fontSize="small" />
                                            ) : (
                                                <PersonIcon color="action" fontSize="small" />
                                            )}
                                            <Box>
                                                <Typography variant="body2">{user.username}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.employee_id || 'No ID'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            variant="outlined"
                                            color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{formatDate(user.last_password_change)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_expired ? (
                                            <Typography variant="body2" color="error">
                                                Expired {user.days_since_change} days ago
                                            </Typography>
                                        ) : user.is_expiring_soon ? (
                                            <Typography variant="body2" color="warning.main">
                                                {user.days_remaining} days remaining
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="success.main">
                                                {user.days_remaining} days remaining
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.is_expired && (
                                            <Chip label="EXPIRED" color="error" size="small" />
                                        )}
                                        {user.is_expiring_soon && !user.is_expired && (
                                            <Chip label="EXPIRING SOON" color="warning" size="small" />
                                        )}
                                        {user.force_password_change && !user.is_expired && (
                                            <Chip label="FORCE CHANGE" color="info" size="small" />
                                        )}
                                        {!user.is_expired && !user.is_expiring_soon && !user.force_password_change && (
                                            <Chip label="VALID" color="success" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Reset Expiry (Start 90 days again)">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => setResetDialog({ open: true, user, type: 'expiry' })}
                                                >
                                                    Reset Expiry
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Force Password Change on Next Login">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="warning"
                                                    onClick={() => setResetDialog({ open: true, user, type: 'force_change' })}
                                                >
                                                    Force Change
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={resetDialog.open}
                onClose={() => !actionLoading && setResetDialog({ open: false, user: null, type: 'expiry' })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UnlockIcon color="primary" />
                    {resetDialog.type === 'expiry' ? 'Reset Password Expiry' : 'Force Password Change'}
                </DialogTitle>
                <DialogContent>
                    {successMessage ? (
                        <Alert severity="success" sx={{ mt: 1 }}>
                            {successMessage}
                        </Alert>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                User: <strong>{resetDialog.user?.username}</strong> ({resetDialog.user?.employee_id || 'No ID'})
                            </Typography>

                            {resetDialog.type === 'expiry' && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        This will reset the password expiry timer. The user will have {passwordData.password_expiry_days} more days before needing to change their password again.
                                    </Typography>
                                </Alert>
                            )}

                            {resetDialog.type === 'force_change' && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        This will force the user to change their password on next login. Use this when you want the user to update their password immediately.
                                    </Typography>
                                </Alert>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setResetDialog({ open: false, user: null, type: 'expiry' })}
                        disabled={actionLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleResetPassword}
                        color={resetDialog.type === 'expiry' ? 'success' : 'warning'}
                        variant="contained"
                        disabled={actionLoading || !!successMessage}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PasswordManagement;
