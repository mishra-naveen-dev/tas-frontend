import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    MenuItem,
    Card,
    CardContent,
    Alert,
    CircularProgress
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        employee_id: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: '',
        branch: '',
        area: ''
    });

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchDropdowns = async () => {
        try {
            const [roleRes, branchRes, areaRes] = await Promise.all([
                api.getRoles(),
                api.getBranches(),
                api.getAreas()
            ]);

            setRoles(roleRes.data.results || roleRes.data);
            setBranches(branchRes.data.results || branchRes.data);
            setAreas(areaRes.data.results || areaRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load dropdown data');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            await api.createUser(formData);

            setSuccess('User created successfully (Temp password: Temp@123)');

            setTimeout(() => {
                navigate('/admin/users');
            }, 2000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Create Employee
            </Typography>

            {error && <Alert severity="error">{JSON.stringify(error)}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Username" name="username" onChange={handleChange} required />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email" name="email" onChange={handleChange} required />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Employee ID" name="employee_id" onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Phone" name="phone" onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="First Name" name="first_name" onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Last Name" name="last_name" onChange={handleChange} />
                            </Grid>

                            {/* ROLE */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Role"
                                    name="role"
                                    onChange={handleChange}
                                    required
                                >
                                    {roles.map((r) => (
                                        <MenuItem key={r.id} value={r.id}>
                                            {r.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* BRANCH */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Branch"
                                    name="branch"
                                    onChange={handleChange}
                                >
                                    {branches.map((b) => (
                                        <MenuItem key={b.id} value={b.id}>
                                            {b.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* AREA */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Area"
                                    name="area"
                                    onChange={handleChange}
                                >
                                    {areas.map((a) => (
                                        <MenuItem key={a.id} value={a.id}>
                                            {a.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Create User'}
                                </Button>
                            </Grid>

                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateUser;