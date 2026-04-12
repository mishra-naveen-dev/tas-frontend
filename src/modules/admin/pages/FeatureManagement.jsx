import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Switch, Chip,
    Button, FormControl, InputLabel, Select, MenuItem, Alert,
    Snackbar, CircularProgress
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import api from 'core/services/api';

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
    const [allFeatures, setAllFeatures] = useState([]);
    const [roleFeatures, setRoleFeatures] = useState({});
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const rolesRes = await api.get('/organization/roles/');
            const featuresRes = await api.getFeatures();

            const allRoles = rolesRes.data || [];
            const adminRoles = allRoles.filter(r => r.name !== 'SUPER_ADMIN' && r.name !== 'EMPLOYEE' && r.name !== 'GUEST');
            setRoles(adminRoles);

            const features = featuresRes.data || [];
            setAllFeatures(features);

            if (adminRoles.length > 0) {
                setSelectedRole(adminRoles[0].id);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setSnackbar({
                open: true,
                message: 'Error loading data. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedRole) return;
        loadRoleFeatures(selectedRole);
    }, [selectedRole]);

    const loadRoleFeatures = async (roleId) => {
        setFetching(true);
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
            setSnackbar({
                open: true,
                message: 'Error loading features.',
                severity: 'error'
            });
        } finally {
            setFetching(false);
        }
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleToggle = async (featureId, currentState) => {
        const newState = !currentState;
        
        setRoleFeatures(prev => ({
            ...prev,
            [featureId]: newState
        }));

        try {
            await api.toggleRoleFeature(selectedRole, featureId, newState);
            setSnackbar({
                open: true,
                message: `Feature ${newState ? 'enabled' : 'disabled'} successfully`,
                severity: 'success'
            });
        } catch (err) {
            setRoleFeatures(prev => ({
                ...prev,
                [featureId]: currentState
            }));
            setSnackbar({
                open: true,
                message: 'Failed to update feature',
                severity: 'error'
            });
        }
    };

    const handleEnableAll = async (category) => {
        const categoryFeatures = allFeatures.filter(f => f.category === category);
        const categoryIds = categoryFeatures.map(f => f.id);
        
        const newFeatures = { ...roleFeatures };
        categoryIds.forEach(id => {
            newFeatures[id] = true;
        });
        setRoleFeatures(newFeatures);

        try {
            await api.bulkUpdateRoleFeatures(selectedRole, Object.keys(newFeatures).filter(k => newFeatures[k]).map(Number));
            setSnackbar({
                open: true,
                message: `All ${category.toLowerCase()} features enabled`,
                severity: 'success'
            });
        } catch (err) {
            loadRoleFeatures(selectedRole);
            setSnackbar({
                open: true,
                message: 'Failed to update features',
                severity: 'error'
            });
        }
    };

    const handleDisableAll = async (category) => {
        const categoryFeatures = allFeatures.filter(f => f.category === category);
        
        const newFeatures = { ...roleFeatures };
        categoryFeatures.forEach(f => {
            newFeatures[f.id] = false;
        });
        setRoleFeatures(newFeatures);

        try {
            const enabledIds = Object.keys(newFeatures).filter(k => newFeatures[k]).map(Number);
            await api.bulkUpdateRoleFeatures(selectedRole, enabledIds);
            setSnackbar({
                open: true,
                message: `All ${category.toLowerCase()} features disabled`,
                severity: 'success'
            });
        } catch (err) {
            loadRoleFeatures(selectedRole);
            setSnackbar({
                open: true,
                message: 'Failed to update features',
                severity: 'error'
            });
        }
    };

    const groupedFeatures = allFeatures.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {});

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Feature Management</Typography>
                <Typography variant="body2" color="text.secondary">
                    Enable or disable features for each role
                </Typography>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <FormControl fullWidth sx={{ maxWidth: 400 }}>
                        <InputLabel>Select Role</InputLabel>
                        <Select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            label="Select Role"
                        >
                            {roles.length === 0 ? (
                                <MenuItem value="">No roles found</MenuItem>
                            ) : (
                                roles.map(role => (
                                    <MenuItem key={role.id} value={role.id}>
                                        {role.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
                    const enabledCount = categoryFeatures.filter(f => roleFeatures[f.id]).length;
                    const allEnabled = enabledCount === categoryFeatures.length;

                    return (
                        <Card key={category} sx={{ mb: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: CATEGORY_COLORS[category] }}>
                                            {CATEGORY_ICONS[category]}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {category.charAt(0) + category.slice(1).toLowerCase()} Features
                                        </Typography>
                                        <Chip 
                                            label={`${enabledCount}/${categoryFeatures.length}`}
                                            size="small"
                                            color={allEnabled ? 'success' : 'default'}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleEnableAll(category)}
                                            disabled={allEnabled}
                                            startIcon={<CheckIcon />}
                                        >
                                            Enable All
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDisableAll(category)}
                                            disabled={enabledCount === 0}
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
                                                <TableCell sx={{ fontWeight: 'bold', width: '15%', textAlign: 'center' }}>Menu</TableCell>
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
                })
            )}

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
