import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Collapse,
    IconButton,
    Tooltip,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

const AdvancedFilter = ({
    onApply,
    onClear,
    showDateRange = true,
    showTypeFilter = false,
    typeOptions = [],
    showStatusFilter = false,
    statusOptions = [],
    showSearch = false,
    searchPlaceholder = 'Search...',
    extraFilters = null,
    compact = false,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [values, setValues] = useState({
        dateFrom: '',
        dateTo: '',
        type: '',
        status: '',
        search: '',
    });

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApply(values);
    };

    const handleClear = () => {
        const cleared = {
            dateFrom: '',
            dateTo: '',
            type: '',
            status: '',
            search: '',
        };
        setValues(cleared);
        if (onClear) onClear(cleared);
        else onApply(cleared);
    };

    const hasActiveFilters = values.dateFrom || values.dateTo || values.type || 
                           values.status || values.search || 
                           (extraFilters && Object.values(extraFilters(values)).some(v => v));

    return (
        <Paper sx={{ p: compact ? 1.5 : 2, mb: 2 }}>
            {/* ================= HEADER ROW ================= */}
            <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent="space-between"
                flexWrap="wrap"
            >
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <FilterIcon color="action" fontSize="small" />
                    
                    {showDateRange && (
                        <>
                            <TextField
                                type="date"
                                size="small"
                                label="From"
                                value={values.dateFrom}
                                onChange={(e) => handleChange('dateFrom', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 150 }}
                            />
                            <TextField
                                type="date"
                                size="small"
                                label="To"
                                value={values.dateTo}
                                onChange={(e) => handleChange('dateTo', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 150 }}
                            />
                        </>
                    )}

                    {showSearch && (
                        <TextField
                            size="small"
                            placeholder={searchPlaceholder}
                            value={values.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            sx={{ minWidth: 200 }}
                        />
                    )}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Active filters indicator */}
                    {hasActiveFilters && (
                        <Chip 
                            label="Filters Active" 
                            color="primary" 
                            size="small"
                            onDelete={handleClear}
                        />
                    )}

                    {/* Expand/Collapse button */}
                    {(showTypeFilter || showStatusFilter || extraFilters) && (
                        <Tooltip title={expanded ? 'Less filters' : 'More filters'}>
                            <IconButton 
                                size="small" 
                                onClick={() => setExpanded(!expanded)}
                                color={expanded ? 'primary' : 'default'}
                            >
                                {expanded ? <RemoveIcon /> : <AddIcon />}
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Apply button */}
                    <Button 
                        variant="contained" 
                        size="small"
                        onClick={handleApply}
                    >
                        Apply
                    </Button>

                    {/* Clear button */}
                    {hasActiveFilters && (
                        <Tooltip title="Clear all filters">
                            <Button 
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={handleClear}
                                startIcon={<ClearIcon />}
                            >
                                Clear
                            </Button>
                        </Tooltip>
                    )}
                </Stack>
            </Stack>

            {/* ================= EXPANDED FILTERS ================= */}
            <Collapse in={expanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                    <Grid container spacing={2} alignItems="center">
                        {showTypeFilter && (
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={values.type}
                                        label="Type"
                                        onChange={(e) => handleChange('type', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {typeOptions.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {showStatusFilter && (
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={values.status}
                                        label="Status"
                                        onChange={(e) => handleChange('status', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {statusOptions.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {extraFilters && extraFilters(values, handleChange)}
                    </Grid>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default AdvancedFilter;
