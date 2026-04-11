import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography,
    Chip,
    Paper,
    Divider,
    IconButton,
    Tooltip,
    Button,
    TextField,
} from '@mui/material';
import {
    Place as PlaceIcon,
    Business as BranchIcon,
    LocationCity as AreaIcon,
    Clear as ClearIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import api from 'core/services/api';

const CascadingFilter = ({
    onApply,
    initialValues = {},
    showUserFilter = false,
    compact = false,
}) => {
    const [state, setState] = useState(initialValues.state || '');
    const [branch, setBranch] = useState(initialValues.branch || '');
    const [area, setArea] = useState(initialValues.area || '');
    const [employee, setEmployee] = useState(initialValues.employee || '');
    const [dateFrom, setDateFrom] = useState(initialValues.dateFrom || '');
    const [dateTo, setDateTo] = useState(initialValues.dateTo || '');

    const [states, setStates] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState({
        state: false,
        branch: false,
        area: false,
        employee: false,
    });

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        if (state) {
            fetchBranches(state);
            setBranch('');
            setArea('');
        } else {
            setBranches([]);
            setAreas([]);
        }
    }, [state]);

    useEffect(() => {
        if (branch) {
            fetchAreas(branch);
            setArea('');
        } else {
            setAreas([]);
        }
    }, [branch]);

    useEffect(() => {
        if ((branch || state) && showUserFilter) {
            fetchEmployees();
        }
    }, [branch, state]);

    const fetchStates = async () => {
        setLoading(prev => ({ ...prev, state: true }));
        try {
            const res = await api.get('/organization/states/', {}, true);
            setStates(res.data);
        } catch (err) {
            console.error('Failed to fetch states:', err);
        } finally {
            setLoading(prev => ({ ...prev, state: false }));
        }
    };

    const fetchBranches = async (stateId) => {
        setLoading(prev => ({ ...prev, branch: true }));
        try {
            const res = await api.get('/organization/branches/', { state: stateId }, true);
            setBranches(res.data);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
        } finally {
            setLoading(prev => ({ ...prev, branch: false }));
        }
    };

    const fetchAreas = async (branchId) => {
        setLoading(prev => ({ ...prev, area: true }));
        try {
            const res = await api.get('/organization/areas/', { branch: branchId }, true);
            setAreas(res.data);
        } catch (err) {
            console.error('Failed to fetch areas:', err);
        } finally {
            setLoading(prev => ({ ...prev, area: false }));
        }
    };

    const fetchEmployees = async () => {
        setLoading(prev => ({ ...prev, employee: true }));
        try {
            const params = {};
            if (branch) params.branch = branch;
            if (state && !branch) params.state = state;
            
            const res = await api.get('/organization/users/', { ...params, role: 'EMPLOYEE', page_size: 100 });
            setEmployees(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        } finally {
            setLoading(prev => ({ ...prev, employee: false }));
        }
    };

    const handleClear = () => {
        setState('');
        setBranch('');
        setArea('');
        setEmployee('');
        setDateFrom('');
        setDateTo('');
    };

    const handleApply = () => {
        if (onApply) {
            onApply({
                state,
                branch,
                area,
                employee,
                dateFrom,
                dateTo,
            });
        }
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (state) count++;
        if (branch) count++;
        if (area) count++;
        if (employee) count++;
        if (dateFrom) count++;
        if (dateTo) count++;
        return count;
    };

    const renderSelect = (
        label,
        value,
        onChange,
        options,
        loadingKey,
        icon,
        disabled = false
    ) => (
        <FormControl size={compact ? 'small' : 'medium'} fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={label}
                disabled={disabled || loading[loadingKey]}
                startAdornment={
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {disabled ? <LockIcon sx={{ fontSize: 18, color: 'action.disabled' }} /> : icon}
                    </Box>
                }
            >
                <MenuItem value="">
                    <em>All {label}s</em>
                </MenuItem>
                {loading[loadingKey] ? (
                    <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading...
                    </MenuItem>
                ) : (
                    options.map((opt) => (
                        <MenuItem key={opt.id} value={opt.id}>
                            {opt.code ? `${opt.code} - ${opt.name}` : opt.name}
                        </MenuItem>
                    ))
                )}
            </Select>
        </FormControl>
    );

    if (compact) {
        return (
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterIcon color="primary" />
                        <Typography variant="subtitle2">Filters</Typography>
                        {getActiveFiltersCount() > 0 && (
                            <Chip label={getActiveFiltersCount()} size="small" color="primary" />
                        )}
                    </Box>
                    <Box>
                        {getActiveFiltersCount() > 0 && (
                            <Button size="small" startIcon={<ClearIcon />} onClick={handleClear}>
                                Clear
                            </Button>
                        )}
                        <Button size="small" variant="contained" onClick={handleApply}>
                            Apply
                        </Button>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        {renderSelect('State', state, setState, states, 'state', <PlaceIcon />)}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        {renderSelect('Branch', branch, setBranch, branches, 'branch', <BranchIcon />, !state)}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        {renderSelect('Area', area, setArea, areas, 'area', <AreaIcon />, !branch)}
                    </Grid>
                    {showUserFilter && (
                        <Grid item xs={12} sm={6} md={3}>
                            {renderSelect('Employee', employee, setEmployee, employees, 'employee', <BranchIcon />, !state && !branch)}
                        </Grid>
                    )}
                </Grid>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon color="primary" />
                    <Typography variant="h6">Filter By Location</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {getActiveFiltersCount() > 0 && (
                        <Chip
                            label={`${getActiveFiltersCount()} active`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {getActiveFiltersCount() > 0 && (
                        <Tooltip title="Clear all filters">
                            <IconButton onClick={handleClear} size="small">
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PlaceIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" color="text.secondary">
                            Step 1: Select State
                        </Typography>
                    </Box>
                    {renderSelect('State', state, setState, states, 'state', <PlaceIcon />)}
                    {!state && (
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                            Select state to unlock next step
                        </Typography>
                    )}
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {state ? <UnlockIcon color="primary" fontSize="small" /> : <LockIcon color="disabled" fontSize="small" />}
                        <Typography variant="subtitle2" color={state ? 'text.secondary' : 'text.disabled'}>
                            Step 2: Select Branch
                        </Typography>
                    </Box>
                    {renderSelect('Branch', branch, setBranch, branches, 'branch', <BranchIcon />, !state)}
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {branch ? <UnlockIcon color="primary" fontSize="small" /> : <LockIcon color="disabled" fontSize="small" />}
                        <Typography variant="subtitle2" color={branch ? 'text.secondary' : 'text.disabled'}>
                            Step 3: Select Area
                        </Typography>
                    </Box>
                    {renderSelect('Area', area, setArea, areas, 'area', <AreaIcon />, !branch)}
                </Grid>

                {showUserFilter && (
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {(state || branch) ? <UnlockIcon color="primary" fontSize="small" /> : <LockIcon color="disabled" fontSize="small" />}
                            <Typography variant="subtitle2" color={(state || branch) ? 'text.secondary' : 'text.disabled'}>
                                Step 4: Select Employee
                            </Typography>
                        </Box>
                        <FormControl size="medium" fullWidth>
                            <InputLabel>Employee</InputLabel>
                            <Select
                                value={employee}
                                onChange={(e) => setEmployee(e.target.value)}
                                label="Employee"
                                disabled={loading.employee || (!state && !branch)}
                            >
                                <MenuItem value="">
                                    <em>All Employees</em>
                                </MenuItem>
                                {loading.employee ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Loading...
                                    </MenuItem>
                                ) : (
                                    employees.map((emp) => (
                                        <MenuItem key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} ({emp.employee_id || 'No ID'})
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleClear}>
                    Clear All
                </Button>
                <Button variant="contained" onClick={handleApply} startIcon={<FilterIcon />}>
                    Apply Filters
                </Button>
            </Box>

            {(state || branch || area || employee) && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Active Filters:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {state && (
                            <Chip
                                size="small"
                                label={`State: ${states.find(s => s.id === state)?.name || state}`}
                                onDelete={() => setState('')}
                            />
                        )}
                        {branch && (
                            <Chip
                                size="small"
                                label={`Branch: ${branches.find(b => b.id === branch)?.name || branch}`}
                                onDelete={() => setBranch('')}
                            />
                        )}
                        {area && (
                            <Chip
                                size="small"
                                label={`Area: ${areas.find(a => a.id === area)?.name || area}`}
                                onDelete={() => setArea('')}
                            />
                        )}
                        {employee && (
                            <Chip
                                size="small"
                                label={`Employee: ${employees.find(e => e.id === employee)?.first_name || employee}`}
                                onDelete={() => setEmployee('')}
                            />
                        )}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default CascadingFilter;
