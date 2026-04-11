import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Tooltip,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Settings as SettingsIcon,
    AccountTree as HierarchyIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import api from 'core/services/api';

const REQUEST_TYPES = [
    { value: 'ALLOWANCE', label: 'Travel Allowance' },
    { value: 'CORRECTION', label: 'Punch Correction' },
    { value: 'PROFILE', label: 'Profile Update' },
];

const ApprovalHierarchySettings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [hierarchies, setHierarchies] = useState({});
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingHierarchy, setEditingHierarchy] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        request_type: 'ALLOWANCE',
        levels: [{ level: 1, approver_role_id: '' }],
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchHierarchies();
        fetchRoles();
    }, []);

    const fetchHierarchies = async () => {
        setLoading(true);
        try {
            const res = await api.getApprovalHierarchies();
            const grouped = {};
            res.data.forEach(h => {
                if (!grouped[h.request_type]) {
                    grouped[h.request_type] = [];
                }
                grouped[h.request_type].push(h);
            });
            Object.keys(grouped).forEach(key => {
                grouped[key].sort((a, b) => a.level - b.level);
            });
            setHierarchies(grouped);
        } catch (err) {
            console.error('Failed to fetch hierarchies:', err);
            setError('Failed to load approval hierarchies');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.getRoles();
            setRoles(res.data);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenDialog = (hierarchy = null) => {
        if (hierarchy) {
            const levels = hierarchy.levels || [{ level: 1, approver_role_id: '' }];
            setFormData({
                name: hierarchy.name,
                request_type: hierarchy.request_type,
                levels: levels,
            });
            setEditingHierarchy(hierarchy);
        } else {
            setFormData({
                name: '',
                request_type: REQUEST_TYPES[activeTab].value,
                levels: [{ level: 1, approver_role_id: '' }],
            });
            setEditingHierarchy(null);
        }
        setError('');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingHierarchy(null);
        setError('');
    };

    const handleAddLevel = () => {
        setFormData(prev => ({
            ...prev,
            levels: [
                ...prev.levels,
                { level: prev.levels.length + 1, approver_role_id: '' }
            ]
        }));
    };

    const handleRemoveLevel = (index) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.filter((_, i) => i !== index)
                .map((l, i) => ({ ...l, level: i + 1 }))
        }));
    };

    const handleLevelChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.map((l, i) =>
                i === index ? { ...l, [field]: value } : l
            )
        }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Hierarchy name is required');
            return;
        }

        const invalidLevels = formData.levels.filter(l => !l.approver_role_id);
        if (invalidLevels.length > 0) {
            setError('All levels must have an approver role');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (editingHierarchy) {
                for (const level of formData.levels) {
                    if (level.id) {
                        await api.updateApprovalHierarchy(level.id, {
                            name: formData.name,
                            approver_role: level.approver_role_id,
                            is_active: true,
                        });
                    }
                }
                setSuccess('Approval hierarchy updated successfully!');
            } else {
                await api.createApprovalHierarchy(formData);
                setSuccess('Approval hierarchy created successfully!');
            }
            handleCloseDialog();
            fetchHierarchies();
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to save hierarchy');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (hierarchy) => {
        if (!window.confirm(`Delete hierarchy "${hierarchy.name}" for ${hierarchy.request_type}?`)) {
            return;
        }

        try {
            await api.deleteApprovalHierarchy(hierarchy.id);
            setSuccess('Hierarchy deleted successfully!');
            fetchHierarchies();
        } catch (err) {
            setError('Failed to delete hierarchy');
        }
    };

    const handleToggleActive = async (hierarchy) => {
        try {
            await api.updateApprovalHierarchy(hierarchy.id, {
                ...hierarchy,
                is_active: !hierarchy.is_active
            });
            fetchHierarchies();
        } catch (err) {
            setError('Failed to update hierarchy status');
        }
    };

    const currentType = REQUEST_TYPES[activeTab].value;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Approval Hierarchy Settings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Configure multi-level approval workflows for different request types
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Create Hierarchy
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>How it works:</strong> When an employee submits a request, it goes through each approval level in sequence.
                    Level 1 approvers must approve before Level 2, and so on. Each level can be assigned to a specific role.
                </Typography>
            </Alert>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                {REQUEST_TYPES.map((type, index) => (
                    <Tab
                        key={type.value}
                        label={type.label}
                        icon={<HierarchyIcon />}
                        iconPosition="start"
                    />
                ))}
            </Tabs>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    {REQUEST_TYPES[activeTab].label} - Approval Levels
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                >
                                    Add Level
                                </Button>
                            </Box>

                            {hierarchies[currentType] && hierarchies[currentType].length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Approver Role</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {hierarchies[currentType].map((hierarchy) => (
                                                <TableRow key={hierarchy.id}>
                                                    <TableCell>
                                                        <Chip
                                                            label={`Level ${hierarchy.level}`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{hierarchy.name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={hierarchy.approver_role_name}
                                                            size="small"
                                                            color="secondary"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={hierarchy.is_active ? 'Active' : 'Inactive'}
                                                            size="small"
                                                            color={hierarchy.is_active ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenDialog(hierarchy)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={hierarchy.is_active ? 'Deactivate' : 'Activate'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleActive(hierarchy)}
                                                            >
                                                                {hierarchy.is_active ? <RejectIcon /> : <ApproveIcon />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDelete(hierarchy)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <HierarchyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography color="text.secondary">
                                        No approval hierarchy configured for {REQUEST_TYPES[activeTab].label}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleOpenDialog()}
                                        sx={{ mt: 2 }}
                                    >
                                        Create First Level
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Flow Preview
                            </Typography>

                            {hierarchies[currentType] && hierarchies[currentType].length > 0 ? (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Chip label="Employee Submits" color="default" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">→</Typography>
                                    </Box>

                                    {hierarchies[currentType].map((hierarchy, index) => (
                                        <Box key={hierarchy.id} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Chip
                                                    label={`Level ${hierarchy.level}: ${hierarchy.approver_role_name}`}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ mr: 1 }}
                                                />
                                                <Typography variant="body2" color="text.secondary">→</Typography>
                                            </Box>
                                            {index === hierarchies[currentType].length - 1 && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                                    <Chip label="Completed" color="success" />
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography color="text.secondary">
                                    Configure approval levels to see the flow preview
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Configuration Tips
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Alert severity="info">
                                    <strong>Single Level:</strong> If only one level is configured, requests are auto-approved after that level.
                                </Alert>
                                <Alert severity="warning">
                                    <strong>Multi Level:</strong> Each level must have a different approver role for proper routing.
                                </Alert>
                                <Alert severity="success">
                                    <strong>Notifications:</strong> Approvers will receive notifications when requests need their attention.
                                </Alert>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Suggested Configurations:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    • <strong>Allowance:</strong> ADMIN (L1) → SUPER_ADMIN (L2)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • <strong>Correction:</strong> ADMIN (L1) only
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • <strong>Profile:</strong> ADMIN (L1) → SUPER_ADMIN (L2)
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingHierarchy ? 'Edit Approval Level' : 'Create Approval Hierarchy'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Hierarchy Name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Standard Allowance Approval"
                                helperText="A descriptive name for this hierarchy"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Request Type</InputLabel>
                                <Select
                                    value={formData.request_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, request_type: e.target.value }))}
                                    label="Request Type"
                                    disabled={!!editingHierarchy}
                                >
                                    {REQUEST_TYPES.map(type => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Approval Levels</Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={handleAddLevel}>
                            Add Level
                        </Button>
                    </Box>

                    {formData.levels.map((level, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={2}>
                                        <Chip
                                            label={`Level ${level.level}`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <FormControl fullWidth>
                                            <InputLabel>Approver Role</InputLabel>
                                            <Select
                                                value={level.approver_role_id}
                                                onChange={(e) => handleLevelChange(index, 'approver_role_id', e.target.value)}
                                                label="Approver Role"
                                            >
                                                {roles.map(role => (
                                                    <MenuItem key={role.id} value={role.id}>
                                                        {role.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveLevel(index)}
                                            disabled={formData.levels.length === 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}

                    {formData.levels.length === 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            At least one approval level is required
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || formData.levels.length === 0}
                        startIcon={saving ? <CircularProgress size={20} /> : null}
                    >
                        {saving ? 'Saving...' : 'Save Hierarchy'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApprovalHierarchySettings;
