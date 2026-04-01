import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Dialog,
    Box,
    Avatar,
    Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import EditProfile from '../EditProfile';


const ProfileInfo = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    return (

        <Box sx={{ p: 5 }}>

            {/* HEADER */}
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            {/* PROFILE CARD */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent>

                    {/* USER HEADER */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: '#d32f2f', width: 60, height: 60 }}>
                            {user?.first_name?.[0]}
                        </Avatar>

                        <Box>
                            <Typography variant="h6">
                                {user?.first_name} {user?.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.employee_id}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* DETAILS GRID */}
                    <Grid container spacing={3}>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Email</Typography>
                            <Typography>{user?.email}</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Phone</Typography>
                            <Typography>{user?.phone || '-'}</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Designation</Typography>
                            <Typography>{user?.designation || '-'}</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Department</Typography>
                            <Typography>{user?.department || '-'}</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Area</Typography>
                            <Typography>{user?.area_name || '-'}</Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2">Branch</Typography>
                            <Typography>{user?.branch_name || '-'}</Typography>
                        </Grid>

                    </Grid>

                    {/* ACTION BUTTON */}
                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            onClick={() => setOpen(true)}
                        >
                            Edit Profile
                        </Button>
                    </Box>

                </CardContent>
            </Card>

            {/* EDIT DIALOG */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <EditProfile onClose={() => setOpen(false)} />
            </Dialog>

        </Box>

    );
};

export default ProfileInfo;