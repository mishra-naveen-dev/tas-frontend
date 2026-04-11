import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography,
    Chip,
    OutlinedInput,
    Checkbox,
    ListItemText,
    FormHelperText,
} from '@mui/material';
import api from 'core/services/api';

const CascadingSelect = ({
    label,
    required = false,
    error = null,
    helperText = '',
    fullWidth = true,
    size = 'small',
    disabled = false,
    onChange,
    value = null,
    level = 'state',
    excludeFields = [],
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(value);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (level) {
                case 'state':
                    endpoint = '/organization/states/';
                    break;
                case 'branch':
                    endpoint = '/organization/branches/';
                    break;
                case 'area':
                    endpoint = '/organization/areas/';
                    break;
                case 'user':
                    endpoint = '/organization/users/';
                    break;
                default:
                    endpoint = '/organization/states/';
            }
            const res = await api.get(endpoint, {}, true);
            setData(res.data);
        } catch (err) {
            console.error(`Failed to fetch ${level}:`, err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelected(newValue);
        
        if (onChange) {
            onChange(newValue, level);
        }
    };

    const getDisplayValue = () => {
        if (!selected) return '';
        if (Array.isArray(selected)) return selected;
        return selected;
    };

    const renderOptions = () => {
        if (loading) {
            return <MenuItem disabled><CircularProgress size={20} /></MenuItem>;
        }

        if (data.length === 0) {
            return <MenuItem disabled>No data available</MenuItem>;
        }

        return data.map((item) => {
            let id, name, code;
            
            switch (level) {
                case 'state':
                    id = item.id;
                    name = item.name;
                    code = item.code;
                    break;
                case 'branch':
                    id = item.id;
                    name = item.name;
                    code = item.code;
                    break;
                case 'area':
                    id = item.id;
                    name = item.name;
                    code = item.code;
                    break;
                case 'user':
                    id = item.id;
                    name = `${item.first_name} ${item.last_name} (${item.employee_id || 'No ID'})`;
                    code = item.employee_id;
                    break;
                default:
                    id = item.id;
                    name = item.name;
                    code = item.code;
            }

            return (
                <MenuItem key={id} value={id}>
                    {code ? `${code} - ${name}` : name}
                </MenuItem>
            );
        });
    };

    return (
        <FormControl
            fullWidth={fullWidth}
            size={size}
            required={required}
            error={!!error}
            disabled={disabled || loading}
        >
            <InputLabel>{label}</InputLabel>
            <Select
                value={getDisplayValue()}
                onChange={handleChange}
                label={label}
            >
                <MenuItem value="">
                    <em>Select {label}</em>
                </MenuItem>
                {renderOptions()}
            </Select>
            {(helperText || error) && (
                <FormHelperText error={!!error}>
                    {error || helperText}
                </FormHelperText>
            )}
        </FormControl>
    );
};

export default CascadingSelect;
