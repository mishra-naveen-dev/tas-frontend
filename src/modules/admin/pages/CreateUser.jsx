import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    Alert,
    Card,
    CardContent,
    Grid,
    CircularProgress
} from '@mui/material';

import api from 'core/services/api';
import { useAuth } from 'modules/auth/contexts/AuthContext.jsx';

const CreateUser = () => {

    const { userRole } = useAuth();

    const [form, setForm] = useState({
        username: '',
        email: '',
        employee_id: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: '',
        state: '',
        branch: '',
        area: ''
    });

    const [roles, setRoles] = useState([]);
    const [states, setStates] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // ================= FETCH INITIAL DATA =================
    useEffect(() => {
        if (userRole) {
            fetchInitialData();
        }
    }, [userRole]);

    const fetchInitialData = async () => {
        try {
            const [rolesRes, statesRes] = await Promise.all([
                api.getRoles(),
                api.getStates()
            ]);



            setRoles(rolesRes.data || []);
            setStates(statesRes.data || []);

        } catch (err) {
            console.error("FETCH ERROR:", err);
            setRoles([]);
        }
    };

    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'state') {
            fetchBranches(value);
            setForm(prev => ({ ...prev, branch: '', area: '' }));
        }

        if (name === 'branch') {
            fetchAreas(value);
            setForm(prev => ({ ...prev, area: '' }));
        }
    };

    // ================= FETCH BRANCH =================
    const fetchBranches = async (stateId) => {
        if (!stateId) return;
        try {
            const res = await api.getBranches(stateId);
            setBranches(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= FETCH AREA =================
    const fetchAreas = async (branchId) => {
        if (!branchId) return;
        try {
            const res = await api.getAreas(branchId);
            setAreas(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!form.username || !form.email || !form.role) {
            setError("Username, Email and Role are required");
            return;
        }

        setLoading(true);

        try {
            await api.createUser(form);

            setSuccess("User created successfully. Default password: Temp@123");

            setForm({
                username: '',
                email: '',
                employee_id: '',
                first_name: '',
                last_name: '',
                phone: '',
                role: '',
                state: '',
                branch: '',
                area: ''
            });

            setBranches([]);
            setAreas([]);

        } catch (err) {
            console.error(err);

            setError(JSON.stringify(err.response?.data, null, 2));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', mt: 3 }}>
            <Card>
                <CardContent>

                    <Typography variant="h5" gutterBottom>
                        Create User
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    <Grid container spacing={2} sx={{ mt: 1 }}>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Employee ID"
                                name="employee_id"
                                value={form.employee_id}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* ROLE */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                {roles.length === 0 ? (
                                    <MenuItem disabled>No roles available</MenuItem>
                                ) : (
                                    roles.map((r) => (
                                        <MenuItem key={r.id} value={r.id}>
                                            {r.name}
                                        </MenuItem>
                                    ))
                                )}
                            </TextField>
                        </Grid>

                        {/* STATE */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="State (Optional)"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {states.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* BRANCH */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Branch (Optional)"
                                name="branch"
                                value={form.branch}
                                onChange={handleChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {branches.map((b) => (
                                    <MenuItem key={b.id} value={b.id}>
                                        {b.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* AREA */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Area (Optional)"
                                name="area"
                                value={form.area}
                                onChange={handleChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {areas.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>
                                        {a.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                    </Grid>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Create User"}
                    </Button>

                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateUser;