import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Switch, Chip,
    Button, FormControl, InputLabel, Select, MenuItem, Alert,
    CircularProgress, Snackbar
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import api from 'core/services/api';
import { FormSkeleton, CardSkeleton } from 'shared/components/SkeletonLoader';

const CATEGORY_ICONS = {
    DASHBOARD: <DashboardIcon />,
    MANAGEMENT: <PeopleIcon />,
    REPORTS: <AssessmentIcon />,
    SETTINGS: <SettingsIcon />,
};

const CATEGORY_COLORS = {
    DASHBOARD: '#1976d2',
    MANAGEMENT: '#2e7d32',
    REPORTS: '#f57c00',
    SETTINGS: '#7b1fa2',
};

const FeatureManagement = () => {
    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]);
    const [roleFeatures, setRoleFeatures] = useState({});
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchRoles = useCallback(async () => {
        try {
            const res = await api.get('/organization/roles/');
            const allRoles = res.data || [];
            const adminRoles = allRoles.filter(r => r.name !== 'SUPER_ADMIN' && r.name !== 'EMPLOYEE' && r.name !== 'GUEST');
            setRoles(adminRoles);
            if (adminRoles.length > 0 && !selectedRole) {
                setSelectedRole(adminRoles[0].id);
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    }, [selectedRole]);

    const fetchFeatures = useCallback(async () => {
        try {
            const res = await api.getFeatures();
            const allFeatures = res.data || [];
            setFeatures(allFeatures);
        } catch (err) {
            console.error('Error fetching features:', err);
        }
    }, []);

    const fetchRoleFeatures = useCallback(async (roleId) => {
        if (!roleId) return;
        try {
            const res = await api.getRoleFeaturesByRole(roleId);
            const featuresData = res.data || [];
            const featureMap = {};
            featuresData.forEach(f => {
                featureMap[f.id] = f.is_enabled;
            });
            setRoleFeatures(featureMap);
        } catch (err) {
            console.error('Error fetching role features:', err);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchRoles(), fetchFeatures()]);
            setLoading(false);
        };
        loadData();
    }, [fetchRoles, fetchFeatures]);

    useEffect(() => {
        if (selectedRole) {
            fetchRoleFeatures(selectedRole);
        }
    }, [selectedRole, fetchRoleFeatures]);

    const handleToggle = async (featureId, currentState) => {
        const newState = !currentState;
        setRoleFeatures(prev => ({ ...prev, [featureId]: newState }));

        try {
            await api.toggleRoleFeature(selectedRole, featureId, newState);
            setSnackbar({
                open: true,
                message: `Feature ${newState ? 'enabled' : 'disabled'} successfully`,
                severity: 'success'
            });
        } catch (err) {
            setRoleFeatures(prev => ({ ...prev, [featureId]: currentState }));
            setSnackbar({
                open: true,
                message: 'Failed to update feature',
                severity: 'error'
            });
        }
    };

    const handleSelectAll = async (category, enabled) => {
        const categoryFeatures = features.filter(f => f.category === category);
        const newRoleFeatures = { ...roleFeatures };
        
        categoryFeatures.forEach(f => {
            newRoleFeatures[f.id] = enabled;
        });
        setRoleFeatures(newRoleFeatures);

        try {
            const featureIds = enabled 
                ? [...Object.keys(roleFeatures).map(Number), ...categoryFeatures.map(f => f.id)]
                : Object.keys(roleFeatures).filter(id => !categoryFeatures.some(f => f.id === Number(id))).map(Number);
            
            await api.bulkUpdateRoleFeatures(selectedRole, enabled ? [...new Set(featureIds)] : featureIds);
            setSnackbar({
                open: true,
                message: `All ${category.toLowerCase()} features ${enabled ? 'enabled' : 'disabled'}`,
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to update features',
                severity: 'error'
            });
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const enabledFeatures = Object.entries(roleFeatures)
                .filter(([_, enabled]) => enabled)
                .map(([id, _]) => Number(id));
            
            await api.bulkUpdateRoleFeatures(selectedRole, enabledFeatures);
            setSnackbar({
                open: true,
                message: 'All changes saved successfully',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Failed to save changes',
                severity: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {});

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>Feature Management</Typography>
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <FormSkeleton />
                    </CardContent>
                </Card>
                <CardSkeleton count={3} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Feature Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enable or disable features for each role
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleSaveAll}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <FormControl fullWidth sx={{ maxWidth: 300 }}>
                        <InputLabel>Select Role</InputLabel>
                        <Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            label="Select Role"
                        >
                            {roles.map(role => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
                const categoryEnabled = categoryFeatures.some(f => roleFeatures[f.id]);
                const allEnabled = categoryFeatures.every(f => roleFeatures[f.id]);

                return (
                    <Card key={category} sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ 
                                        color: CATEGORY_COLORS[category],
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {CATEGORY_ICONS[category]}
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {category.charAt(0) + category.slice(1).toLowerCase()} Features
                                    </Typography>
                                    <Chip 
                                        label={`${categoryFeatures.filter(f => roleFeatures[f.id]).length}/${categoryFeatures.length} enabled`}
                                        size="small"
                                        color={allEnabled ? 'success' : categoryEnabled ? 'warning' : 'default'}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        onClick={() => handleSelectAll(category, true)}
                                        disabled={allEnabled}
                                    >
                                        Enable All
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => handleSelectAll(category, false)}
                                        disabled={!categoryEnabled}
                                    >
                                        Disable All
                                    </Button>
                                </Box>
                            </Box>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                                            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Feature</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: '15%', textAlign: 'center' }}>Menu Path</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: '10%', textAlign: 'center' }}>Enabled</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categoryFeatures.map(feature => (
                                            <TableRow key={feature.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {feature.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {feature.code}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {feature.description || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Chip 
                                                        label={feature.menu_text} 
                                                        size="small" 
                                                        variant="outlined"
                                                        icon={<LockIcon sx={{ fontSize: 14 }} />}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Switch
                                                        checked={roleFeatures[feature.id] || false}
                                                        onChange={() => handleToggle(feature.id, roleFeatures[feature.id])}
                                                        color="success"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                );
            })}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeatureManagement;
