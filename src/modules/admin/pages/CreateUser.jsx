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
import { FormSkeleton } from 'shared/components/SkeletonLoader';

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
        designation: '',
        state: '',
        branch: '',
        area: ''
    });

    const [roles, setRoles] = useState([]);
    const [grades, setGrades] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [filteredDesignations, setFilteredDesignations] = useState([]);
    const [states, setStates] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (userRole) {
            fetchInitialData();
        }
    }, [userRole]);

    const fetchInitialData = async () => {
        setInitialLoading(true);
        try {
            const [rolesRes, statesRes, gradesRes, deptsRes, desigsRes] = await Promise.all([
                api.getRoles(),
                api.getStates(),
                api.getDesignationGrades(),
                api.getDesignationDepartments(),
                api.getDesignations()
            ]);

            setRoles(rolesRes.data || []);
            setStates(statesRes.data || []);
            setGrades(gradesRes.data || []);
            setDepartments(deptsRes.data || []);
            setDesignations(desigsRes.data || []);

        } catch (err) {
            console.error("FETCH ERROR:", err);
        } finally {
            setInitialLoading(false);
        }
    };

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

        if (name === 'grade_name') {
            const gradeDepts = [];
            designations.forEach(d => {
                if (d.grade_name === value && !gradeDepts.includes(d.department_name)) {
                    gradeDepts.push(d.department_name);
                }
            });
            setFilteredDepartments(gradeDepts);
            setFilteredDesignations([]);
            setForm(prev => ({ ...prev, department_name: '', designation: '' }));
        }

        if (name === 'department_name') {
            const grade = form.grade_name;
            const gradeDeptDesigs = designations.filter(d => 
                d.grade_name === grade && d.department_name === value
            );
            setFilteredDesignations(gradeDeptDesigs);
            setForm(prev => ({ ...prev, designation: '' }));
        }
    };

    const fetchBranches = async (stateId) => {
        if (!stateId) return;
        try {
            const res = await api.getBranches(stateId);
            setBranches(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAreas = async (branchId) => {
        if (!branchId) return;
        try {
            const res = await api.getAreas(branchId);
            setAreas(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

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
                grade_name: '',
                department_name: '',
                designation: '',
                state: '',
                branch: '',
                area: ''
            });

            setBranches([]);
            setAreas([]);
            setFilteredDepartments([]);
            setFilteredDesignations([]);

        } catch (err) {
            console.error(err);

            setError(JSON.stringify(err.response?.data, null, 2));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, margin: 'auto', mt: 3 }}>
            <Card>
                <CardContent>

                    <Typography variant="h5" gutterBottom>
                        Create User
                    </Typography>

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    {initialLoading ? (
                        <FormSkeleton fields={10} />
                    ) : (
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
                                type="email"
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

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Grade"
                                name="grade_name"
                                value={form.grade_name || ''}
                                onChange={handleChange}
                            >
                                <MenuItem value="">Select Grade</MenuItem>
                                {grades.map((g) => (
                                    <MenuItem key={g} value={g}>
                                        {g}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Department"
                                name="department_name"
                                value={form.department_name || ''}
                                onChange={handleChange}
                                disabled={!form.grade_name}
                            >
                                <MenuItem value="">Select Department</MenuItem>
                                {filteredDepartments.map((d) => (
                                    <MenuItem key={d} value={d}>
                                        {d}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Designation"
                                name="designation"
                                value={form.designation || ''}
                                onChange={handleChange}
                                disabled={!form.department_name}
                            >
                                <MenuItem value="">Select Designation</MenuItem>
                                {filteredDesignations.map((d) => (
                                    <MenuItem key={d.id} value={d.id}>
                                        {d.designation_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="State (Optional)"
                                name="state"
                                value={form.state || ''}
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

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Branch (Optional)"
                                name="branch"
                                value={form.branch || ''}
                                onChange={handleChange}
                                disabled={!form.state}
                            >
                                <MenuItem value="">None</MenuItem>
                                {branches.map((b) => (
                                    <MenuItem key={b.id} value={b.id}>
                                        {b.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Area (Optional)"
                                name="area"
                                value={form.area || ''}
                                onChange={handleChange}
                                disabled={!form.branch}
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
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={handleSubmit}
                        disabled={loading || initialLoading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Create User"}
                    </Button>

                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateUser;
