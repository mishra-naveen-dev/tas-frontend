import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Switch, Chip,
    Button, FormControl, InputLabel, Select, MenuItem, Alert,
    Snackbar, CircularProgress, Paper
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
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
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
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
            const adminRoles = allRoles.filter(r => 
                r.name !== 'SUPER_ADMIN' && r.name !== 'EMPLOYEE' && r.name !== 'GUEST'
            );
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
        setLoading(true);
        try {
            const res = await api.getRoleFeaturesByRole(roleId);
            const featuresData = res.data || [];
            const featureMap = {};
            featuresData.forEach(f => {
                featureMap[f.id] = f.is_enabled;
            });
            setRoleFeatures(featureMap);
            setHasChanges(false);
        } catch (err) {
            console.error('Error fetching role features:', err);
            setSnackbar({
                open: true,
                message: 'Error loading features.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleToggle = (featureId) => {
        const newState = !roleFeatures[featureId];
        setRoleFeatures(prev => ({
            ...prev,
            [featureId]: newState
        }));
        setHasChanges(true);
    };

    const handleSelectAll = (category) => {
        const categoryFeatures = allFeatures.filter(f => f.category === category);
        const newFeatures = { ...roleFeatures };
        categoryFeatures.forEach(f => {
            newFeatures[f.id] = true;
        });
        setRoleFeatures(newFeatures);
        setHasChanges(true);
    };

    const handleDeselectAll = (category) => {
        const categoryFeatures = allFeatures.filter(f => f.category === category);
        const newFeatures = { ...roleFeatures };
        categoryFeatures.forEach(f => {
            newFeatures[f.id] = false;
        });
        setRoleFeatures(newFeatures);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const enabledFeatureIds = Object.entries(roleFeatures)
                .filter(([_, enabled]) => enabled)
                .map(([id, _]) => Number(id));

            await api.bulkUpdateRoleFeatures(selectedRole, enabledFeatureIds);
            setHasChanges(false);
            setSnackbar({
                open: true,
                message: 'Features updated successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error saving features:', err);
            setSnackbar({
                open: true,
                message: 'Failed to save features.',
                severity: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRefresh = () => {
        loadRoleFeatures(selectedRole);
    };

    const groupedFeatures = allFeatures.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {});

    const selectedRoleName = roles.find(r => r.id === selectedRole)?.name || '';

    const totalFeatures = allFeatures.length;
    const enabledFeatures = Object.values(roleFeatures).filter(v => v).length;

    if (loading && allFeatures.length === 0) {
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
                    Assign or remove features for roles. Only SuperAdmin can manage features.
                </Typography>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 250 }}>
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

                        <Chip 
                            label={`${enabledFeatures}/${totalFeatures} Features Enabled`}
                            color={enabledFeatures === totalFeatures ? 'success' : 'default'}
                            variant="outlined"
                        />

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {hasChanges && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    You have unsaved changes. Click "Save Changes" to apply them.
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', width: '40%' }}>
                                        Feature Name
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', width: '15%' }}>
                                        Category
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                                        Description
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', width: '15%', textAlign: 'center' }}>
                                        Menu Path
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', width: '10%', textAlign: 'center' }}>
                                        Enabled
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
                                    const categoryEnabled = categoryFeatures.filter(f => roleFeatures[f.id]).length;
                                    const categoryTotal = categoryFeatures.length;

                                    return (
                                        <React.Fragment key={category}>
                                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                <TableCell colSpan={5} sx={{ fontWeight: 'bold', py: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ color: CATEGORY_COLORS[category] }}>
                                                            {CATEGORY_ICONS[category]}
                                                        </Box>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {category.charAt(0) + category.slice(1).toLowerCase()} ({categoryEnabled}/{categoryTotal})
                                                        </Typography>
                                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                                            <Button 
                                                                size="small" 
                                                                variant="text"
                                                                onClick={() => handleSelectAll(category)}
                                                                disabled={categoryEnabled === categoryTotal}
                                                            >
                                                                Enable All
                                                            </Button>
                                                            <Button 
                                                                size="small" 
                                                                variant="text"
                                                                color="error"
                                                                onClick={() => handleDeselectAll(category)}
                                                                disabled={categoryEnabled === 0}
                                                            >
                                                                Disable All
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                            {categoryFeatures.map(feature => (
                                                <TableRow 
                                                    key={feature.id}
                                                    hover
                                                    sx={{ 
                                                        '&:hover': { bgcolor: 'grey.50' },
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {feature.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Code: {feature.code}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={category} 
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: `${CATEGORY_COLORS[category]}20`,
                                                                color: CATEGORY_COLORS[category],
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {feature.description || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Typography variant="body2" sx={{ 
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {feature.menu_path}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Switch
                                                            checked={roleFeatures[feature.id] || false}
                                                            onChange={() => handleToggle(feature.id)}
                                                            color="success"
                                                            size="medium"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Total: {totalFeatures} features | Role: {selectedRoleName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Features are fetched automatically from the database
                </Typography>
            </Box>

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
