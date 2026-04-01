import React, { useEffect, useState } from 'react';
import {
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import api from '../services/api';

const CreateUser = () => {

    const [form, setForm] = useState({
        username: '',
        email: '',
        role: '',
        state: '',
        branch: '',
        area: ''
    });

    const [roles, setRoles] = useState([]);
    const [states, setStates] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);

    // ================= LOAD INITIAL DATA =================
    useEffect(() => {
        loadRoles();
        loadStates();
    }, []);

    const loadRoles = async () => {
        try {
            const res = await api.getRoles();
            setRoles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadStates = async () => {
        try {
            const res = await api.getStates();
            setStates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= STATE CHANGE =================
    const handleStateChange = async (stateId) => {
        setForm({
            ...form,
            state: stateId,
            branch: '',
            area: ''
        });

        setAreas([]);

        if (!stateId) {
            setBranches([]);
            return;
        }

        try {
            const res = await api.getBranches(stateId);
            setBranches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= BRANCH CHANGE =================
    const handleBranchChange = async (branchId) => {
        setForm({
            ...form,
            branch: branchId,
            area: ''
        });

        if (!branchId) {
            setAreas([]);
            return;
        }

        try {
            const res = await api.getAreas(branchId);
            setAreas(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {

        const payload = {
            ...form,
            state: form.state || null,
            branch: form.branch || null,
            area: form.area || null,
        };

        try {
            await api.createUser(payload);
            alert("User created");

            // reset form
            setForm({
                username: '',
                email: '',
                role: '',
                state: '',
                branch: '',
                area: ''
            });

            setBranches([]);
            setAreas([]);

        } catch (err) {
            console.error(err);
            alert("Error creating user");
        }
    };

    return (
        <Grid container spacing={2}>

            {/* USERNAME */}
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Username"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />
            </Grid>

            {/* EMAIL */}
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />
            </Grid>

            {/* ROLE */}
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={form.role || ''}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                        }
                    >
                        <MenuItem value="">
                            <em>Select Role</em>
                        </MenuItem>

                        {roles.map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                                {r.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* STATE */}
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select
                        value={form.state || ''}
                        onChange={(e) => handleStateChange(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Select State</em>
                        </MenuItem>

                        {states.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* BRANCH */}
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Branch</InputLabel>
                    <Select
                        value={form.branch || ''}
                        onChange={(e) => handleBranchChange(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Select Branch</em>
                        </MenuItem>

                        {branches.map((b) => (
                            <MenuItem key={b.id} value={b.id}>
                                {b.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* AREA */}
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Area</InputLabel>
                    <Select
                        value={form.area || ''}
                        onChange={(e) =>
                            setForm({ ...form, area: e.target.value })
                        }
                    >
                        <MenuItem value="">
                            <em>Select Area</em>
                        </MenuItem>

                        {areas.map((a) => (
                            <MenuItem key={a.id} value={a.id}>
                                {a.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* SUBMIT */}
            <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={handleSubmit}>
                    Create User
                </Button>
            </Grid>

        </Grid>
    );
};

export default CreateUser;