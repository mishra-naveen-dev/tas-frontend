import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Computer as ComputerIcon, Warning as WarningIcon } from '@mui/icons-material';
import api from 'core/services/api';
import { useAuth } from 'modules/auth/contexts/AuthContext';

const SecurityTab = () => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', onConfirm: () => {} });

    const fetchSessions = async () => {
        try {
            const res = await api.getMySessions();
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions');
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleChange = async () => {
        try {
            await api.changePassword(password);
            alert('Password updated');
        } catch {
            alert('Failed');
        }
    };

    const handleTerminateSession = async (sessionId) => {
        setConfirmDialog({
            open: true,
            title: 'Terminate Session',
            message: 'Are you sure you want to terminate this session?',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await api.terminateSession(sessionId);
                    setMessage('Session terminated successfully');
                    fetchSessions();
                } catch (err) {
                    setMessage('Failed to terminate session');
                }
                setLoading(false);
                setTimeout(() => setMessage(''), 3000);
            }
        });
    };

    const handleLogoutAll = async () => {
        setConfirmDialog({
            open: true,
            title: 'Logout Other Devices',
            message: 'Are you sure you want to logout from all other devices? This will keep only current session.',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await api.terminateAllUserSessions(user.id);
                    setMessage('All other sessions terminated');
                    fetchSessions();
                } catch (err) {
                    setMessage('Failed to terminate sessions');
                }
                setLoading(false);
                setTimeout(() => setMessage(''), 3000);
            }
        });
    };

    const getCurrentDeviceId = () => localStorage.getItem('device_id');

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6">Change Password</Typography>

                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        sx={{ mt: 2 }}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleChange}
                    >
                        Update Password
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Active Sessions
                        </Typography>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={handleLogoutAll}
                            disabled={loading}
                        >
                            Logout Others
                        </Button>
                    </Box>

                    {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

                    {sessions.length === 0 ? (
                        <Typography color="text.secondary">No active sessions</Typography>
                    ) : (
                        <List>
                            {sessions.map((session) => {
                                const isCurrentDevice = session.device_id === getCurrentDeviceId();
                                return (
                                    <React.Fragment key={session.id}>
                                        <ListItem>
                                            <ComputerIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {session.device_name || session.device_id}
                                                        {isCurrentDevice && <Chip label="Current" size="small" color="success" />}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box component="span">
                                                        <Typography variant="body2" component="span">
                                                            Platform: {session.platform}
                                                        </Typography>
                                                        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                                                            | Last Activity: {formatDate(session.last_activity)}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                {!isCurrentDevice && (
                                                    <IconButton 
                                                        edge="end" 
                                                        onClick={() => handleTerminateSession(session.id)}
                                                        disabled={loading}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}
                </CardContent>
            </Card>

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" />
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography>{confirmDialog.message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => {
                            confirmDialog.onConfirm();
                            setConfirmDialog({ ...confirmDialog, open: false });
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SecurityTab;