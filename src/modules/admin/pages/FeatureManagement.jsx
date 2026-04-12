import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Switch, Chip,
    Button, FormControl, InputLabel, Select, MenuItem, Alert,
    Snackbar, Tabs, Tab, Accordion,
    AccordionSummary, AccordionDetails, List, ListItem,
    ListItemText, ListItemIcon, Divider
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon
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
    const [roleUsers, setRoleUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userFeatures, setUserFeatures] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
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

    const fetchRoleUsers = useCallback(async (roleId) => {
        if (!roleId) return;
        try {
            const res = await api.getUserFeaturesByRole(roleId);
            const usersData = res.data || [];
            setRoleUsers(usersData);
        } catch (err) {
            console.error('Error fetching role users:', err);
        }
    }, []);

    const fetchUserFeatures = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const res = await api.getUserFeaturesByUser(userId);
            const featuresData = res.data || [];
            const featureMap = {};
            featuresData.forEach(f => {
                featureMap[f.id] = {
                    is_enabled: f.is_enabled,
                    inherited: f.inherited,
                    user_override: f.user_override
                };
            });
            setUserFeatures(featureMap);
        } catch (err) {
            console.error('Error fetching user features:', err);
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
            fetchRoleUsers(selectedRole);
            setSelectedUser(null);
            setUserFeatures({});
        }
    }, [selectedRole, fetchRoleFeatures, fetchRoleUsers]);

    useEffect(() => {
        if (selectedUser) {
            fetchUserFeatures(selectedUser.user_id);
        }
    }, [selectedUser, fetchUserFeatures]);

    const handleRoleToggle = async (featureId, currentState) => {
        const newState = !currentState;
        setRoleFeatures(prev => ({ ...prev, [featureId]: newState }));

        try {
            await api.toggleRoleFeature(selectedRole, featureId, newState);
            setSnackbar({
                open: true,
                message: `Feature ${newState ? 'enabled' : 'disabled'} for role`,
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

    const handleUserToggle = async (featureId, currentState, inherited) => {
        const newState = !currentState;
        
        setUserFeatures(prev => ({
            ...prev,
            [featureId]: {
                ...prev[featureId],
                is_enabled: newState,
                user_override: true
            }
        }));

        try {
            await api.toggleUserFeature(selectedUser.user_id, featureId, newState);
            setSnackbar({
                open: true,
                message: `Feature ${newState ? 'enabled' : 'disabled'} for ${selectedUser.username}`,
                severity: 'success'
            });
        } catch (err) {
            fetchUserFeatures(selectedUser.user_id);
            setSnackbar({
                open: true,
                message: 'Failed to update feature',
                severity: 'error'
            });
        }
    };

    const handleSelectAllRole = async (category, enabled) => {
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
            
            await api.bulkUpdateRoleFeatures(selectedRole, [...new Set(featureIds)]);
            setSnackbar({
                open: true,
                message: `All ${category.toLowerCase()} features ${enabled ? 'enabled' : 'disabled'} for role`,
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

    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {});

    const selectedRoleName = roles.find(r => r.id === selectedRole)?.name || '';

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
                        Enable or disable features for roles and individual users
                    </Typography>
                </Box>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                        <Chip 
                            label={`${roleUsers.length} users in this role`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label={`Role Features (${selectedRoleName})`} />
                <Tab label="User-Specific Features" disabled={!selectedUser} />
            </Tabs>

            {activeTab === 0 && (
                <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Configure default features for <strong>{selectedRoleName}</strong> role. These features will be available to all users in this role.
                    </Alert>

                    {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
                        const categoryEnabled = categoryFeatures.some(f => roleFeatures[f.id]);
                        const allEnabled = categoryFeatures.every(f => roleFeatures[f.id]);

                        return (
                            <Card key={category} sx={{ mb: 2 }}>
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
                                                onClick={() => handleSelectAllRole(category, true)}
                                                disabled={allEnabled}
                                            >
                                                Enable All
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => handleSelectAllRole(category, false)}
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
                                                            <Switch
                                                                checked={roleFeatures[feature.id] || false}
                                                                onChange={() => handleRoleToggle(feature.id, roleFeatures[feature.id])}
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
                </Box>
            )}

            {activeTab === 1 && selectedUser && (
                <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Configure individual features for <strong>{selectedUser.username}</strong>. 
                        User-specific settings override role defaults.
                    </Alert>

                    {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
                        const hasAccess = categoryFeatures.some(f => 
                            userFeatures[f.id]?.is_enabled || (userFeatures[f.id]?.inherited && !userFeatures[f.id]?.user_override)
                        );

                        return (
                            <Accordion key={category} defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: CATEGORY_COLORS[category] }}>
                                            {CATEGORY_ICONS[category]}
                                        </Box>
                                        <Typography fontWeight="bold">
                                            {category.charAt(0) + category.slice(1).toLowerCase()} Features
                                        </Typography>
                                        <Chip 
                                            label={`${categoryFeatures.filter(f => userFeatures[f.id]?.is_enabled).length}/${categoryFeatures.length}`}
                                            size="small"
                                            color={hasAccess ? 'primary' : 'default'}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Feature</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {categoryFeatures.map(feature => {
                                                    const featureState = userFeatures[feature.id] || { is_enabled: false, inherited: false, user_override: false };
                                                    const isEnabled = featureState.is_enabled;
                                                    const isInherited = featureState.inherited;
                                                    const hasOverride = featureState.user_override;

                                                    return (
                                                        <TableRow key={feature.id}>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {feature.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {feature.code}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                {hasOverride ? (
                                                                    <Chip 
                                                                        label={isEnabled ? 'Custom: ON' : 'Custom: OFF'}
                                                                        size="small"
                                                                        color={isEnabled ? 'success' : 'error'}
                                                                        icon={isEnabled ? <CheckIcon /> : <CancelIcon />}
                                                                    />
                                                                ) : isInherited ? (
                                                                    <Chip 
                                                                        label="Role: ON"
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                ) : (
                                                                    <Chip 
                                                                        label="No Access"
                                                                        size="small"
                                                                        color="default"
                                                                    />
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                {isInherited || isEnabled ? (
                                                                    <Switch
                                                                        checked={isEnabled}
                                                                        onChange={() => handleUserToggle(feature.id, isEnabled, isInherited)}
                                                                        color="success"
                                                                    />
                                                                ) : (
                                                                    <Button 
                                                                        size="small" 
                                                                        variant="outlined"
                                                                        onClick={() => handleUserToggle(feature.id, false, false)}
                                                                    >
                                                                        Grant Access
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            )}

            {!selectedUser && activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Select a User</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Choose a user from the list below to configure their individual features.
                        </Typography>
                        
                        {roleUsers.length === 0 ? (
                            <Alert severity="warning">No users found in this role.</Alert>
                        ) : (
                            <List>
                                {roleUsers.map((user, index) => (
                                    <React.Fragment key={user.user_id}>
                                        <ListItem 
                                            button 
                                            onClick={() => setSelectedUser(user)}
                                            sx={{ 
                                                bgcolor: 'grey.50', 
                                                borderRadius: 1,
                                                mb: 1,
                                                '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                            }}
                                        >
                                            <ListItemIcon>
                                                <PersonIcon />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={`${user.first_name} ${user.last_name}`.trim() || user.username}
                                                secondary={`Employee ID: ${user.employee_id}`}
                                            />
                                            <Chip 
                                                label={`${user.features.filter(f => f.is_enabled).length} features`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </ListItem>
                                        {index < roleUsers.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            )}

            {selectedUser && activeTab === 0 && (
                <Button 
                    variant="outlined" 
                    onClick={() => setActiveTab(1)}
                    sx={{ mt: 2 }}
                >
                    Back to User Features
                </Button>
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
