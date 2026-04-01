import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,

} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import ProfileInfo from './ProfileTabs/ProfileInfo';
import ActivityTab from './ProfileTabs/ActivityTab';
import AllowanceTab from './ProfileTabs/AllowanceTab';
import SecurityTab from './ProfileTabs/SecurityTab';
import AppLayout from '../components/AppLayout';

const Profile = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState(0);


    return (
        <AppLayout>
            <Box sx={{ p: 3 }}>

                {/* HEADER */}
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ width: 70, height: 70, bgcolor: '#d32f2f' }}>
                            {user?.first_name?.[0]}
                        </Avatar>

                        <Box>
                            <Typography variant="h5">
                                {user?.first_name} {user?.last_name}
                            </Typography>
                            <Typography color="text.secondary">
                                {user?.employee_id}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* TABS */}
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                    <Tab label="Profile Info" />
                    <Tab label="Activity" />
                    <Tab label="Allowance" />
                    <Tab label="Security" />
                </Tabs>

                {/* TAB CONTENT */}
                <Box sx={{ mt: 3 }}>
                    {tab === 0 && <ProfileInfo />}
                    {tab === 1 && <ActivityTab />}
                    {tab === 2 && <AllowanceTab />}
                    {tab === 3 && <SecurityTab />}
                </Box>
            </Box>
        </AppLayout>
    );
};

export default Profile;