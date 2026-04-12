import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Divider,
    Card,
    CardContent,
} from '@mui/material';
import {
    Save as SaveIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationIcon,
    EventNote as WindowIcon,
} from '@mui/icons-material';
import api from 'core/services/api';
import { FormSkeleton } from 'shared/components/SkeletonLoader';

const CorrectionSettings = () => {
    const [settings, setSettings] = useState({
        correction_window_days: 7,
        allow_month_end_corrections: false,
        require_geolocation: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.getCorrectionSettings();
            setSettings(res.data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await api.updateCorrectionSettings(settings);
            setSuccess('Settings saved successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, maxWidth: 600 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>Correction Settings</Typography>
                <FormSkeleton fields={4} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Correction Settings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Configure backdate correction window rules for all employees
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    Save Settings
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Note:</strong> Employees can make unlimited corrections, but ALL corrections must be made within the correction window period before it closes.
                </Typography>
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TimeIcon color="primary" />
                                <Typography variant="h6">Time Window</Typography>
                            </Box>

                            <TextField
                                fullWidth
                                type="number"
                                label="Correction Window (Days)"
                                value={settings.correction_window_days}
                                onChange={(e) => handleChange('correction_window_days', parseInt(e.target.value) || 0)}
                                helperText="Days allowed for backdate corrections from punch date"
                                inputProps={{ min: 1, max: 365 }}
                                sx={{ mb: 2 }}
                            />

                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Example: If set to 7 days, employees can only correct punches within 7 days of the original punch.
                            </Alert>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <WindowIcon color="primary" />
                                <Typography variant="h6">Window Closing</Typography>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.allow_month_end_corrections}
                                        onChange={(e) => handleChange('allow_month_end_corrections', e.target.checked)}
                                    />
                                }
                                label="Allow corrections after window closes"
                            />

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                When disabled: Corrections MUST be made before window closes.
                                When enabled: Employees can correct anytime (overrides window).
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationIcon color="primary" />
                                <Typography variant="h6">Location Validation</Typography>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.require_geolocation}
                                        onChange={(e) => handleChange('require_geolocation', e.target.checked)}
                                    />
                                }
                                label="Require valid location for corrections"
                            />

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                When enabled, corrections must have valid latitude/longitude coordinates
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ backgroundColor: '#f5f5f5' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Current Settings Summary
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Correction Window
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {settings.correction_window_days} days after punch
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Window Closing Rule
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {settings.allow_month_end_corrections ? 'Can correct anytime' : 'Must correct before window closes'}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Max Corrections
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="success.main">
                                        Unlimited
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Geolocation Required
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {settings.require_geolocation ? 'Yes' : 'No'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CorrectionSettings;
