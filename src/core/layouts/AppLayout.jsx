import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    TextField,
    InputAdornment,
    Paper,
    Popper,
    ClickAwayListener,
} from '@mui/material';

import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    LocationOn as LocationIcon,
    Receipt as ReceiptIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    AccountCircle as AccountCircleIcon,
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Phonelink as PhonelinkIcon,
    Lock as LockIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Map as MapIcon,
    SystemUpdateAlt as UpdateIcon,
    Rule as RuleIcon,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'modules/auth/contexts/AuthContext';
import PunchButton from 'modules/attendance/components/PunchButton';

const DRAWER_WIDTH = 250;

// ================= MENU CONFIG =================
const ADMIN_MENU = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { text: 'Pending Approvals', icon: AssignmentIcon, path: '/admin/pending-approvals' },
    { text: 'Punch Details', icon: AssignmentIcon, path: '/admin/punch-details' },
    { text: 'Employee Tracking', icon: PeopleIcon, path: '/admin/employee-tracking' },
    { text: 'Route Map', icon: MapIcon, path: '/admin/route-map' },
    { text: 'Punch Corrections', icon: EditIcon, path: '/admin/punch-corrections' },
    { text: 'Correction Approval', icon: UpdateIcon, path: '/admin/correction-approval' },
    { text: 'CRM Visits', icon: LocationIcon, path: '/admin/crm-visits' },
    { text: 'Profile Approvals', icon: AssignmentIcon, path: '/admin/profile-approval' },
    { text: 'Device Management', icon: PhonelinkIcon, path: '/admin/device-management' },
    { text: 'Create User', icon: PeopleIcon, path: '/admin/create-user' },

];

const SUPER_ADMIN_MENU = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { text: 'Pending Approvals', icon: AssignmentIcon, path: '/admin/pending-approvals' },
    { text: 'Punch Details', icon: AssignmentIcon, path: '/admin/punch-details' },
    { text: 'Employee Tracking', icon: PeopleIcon, path: '/admin/employee-tracking' },
    { text: 'Route Map', icon: MapIcon, path: '/admin/route-map' },
    { text: 'Punch Corrections', icon: EditIcon, path: '/admin/punch-corrections' },
    { text: 'Correction Approval', icon: UpdateIcon, path: '/admin/correction-approval' },
    { text: 'CRM Visits', icon: LocationIcon, path: '/admin/crm-visits' },
    { text: 'Profile Approvals', icon: AssignmentIcon, path: '/admin/profile-approval' },
    { text: 'Device Management', icon: PhonelinkIcon, path: '/admin/device-management' },
    { text: 'Password Management', icon: LockIcon, path: '/admin/password-management' },
    { text: 'Correction Settings', icon: RuleIcon, path: '/admin/correction-settings' },
    { text: 'Create User', icon: PeopleIcon, path: '/admin/create-user' },
];

const EMPLOYEE_MENU = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/employee/dashboard' },
    { text: 'Punch History', icon: ReceiptIcon, path: '/employee/punch-history' },
    { text: 'Punch Corrections', icon: EditIcon, path: '/employee/punch-corrections' },
    { text: 'Create Allowance', icon: AssignmentIcon, path: '/employee/create-allowance' },
    { text: 'Allowance History', icon: LocationIcon, path: '/employee/allowance-history' },
    { text: 'Daily Summary', icon: AssignmentIcon, path: '/employee/daily-summary' },
];

const AppLayout = ({ children }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, userRole } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    // ================= SAFETY =================
    if (!user) return null;

    // ================= MENU =================
    const getMenuItems = () => {
        if (userRole === 'SUPER_ADMIN') return SUPER_ADMIN_MENU;
        if (userRole === 'ADMIN') return ADMIN_MENU;
        return EMPLOYEE_MENU;
    };

    const menuItems = getMenuItems();

    // ================= SEARCH =================
    const getSearchResults = () => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return menuItems.filter(item =>
            item.text.toLowerCase().includes(query)
        );
    };

    // ================= HANDLERS =================
    const handleDrawerToggle = () => setMobileOpen(prev => !prev);

    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        logout();
    };

    const navigateTo = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
        setMobileOpen(false);
        setSearchQuery('');
        setSearchOpen(false);
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        }
    };

    const showBackButton = ![
        '/employee/dashboard',
        '/admin/dashboard'
    ].includes(location.pathname);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setSearchOpen(true);
    };

    const handleSearchClear = () => {
        setSearchQuery('');
        setSearchOpen(false);
    };

    const handleResultClick = (path) => {
        navigateTo(path);
    };

    // ================= SIDEBAR =================
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #eee' }}>

            {/* HEADER */}
            <Box sx={{ px: 2, py: 3, textAlign: 'center', borderBottom: '1px solid #eee' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                    TAS
                </Typography>
                <Typography variant="caption" sx={{ color: '#777' }}>
                    Arman Financial Services Ltd.
                </Typography>
            </Box>

            {/* SEARCH BAR */}
            {['ADMIN', 'SUPER_ADMIN'].includes(userRole) && (
                <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #eee' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setSearchOpen(true)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'action.active', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleSearchClear}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* SEARCH RESULTS POPUP */}
                    {searchOpen && searchQuery && (
                        <Paper
                            sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                mx: 2,
                                mt: 0.5,
                                maxHeight: 300,
                                overflow: 'auto',
                                zIndex: 1000,
                            }}
                            elevation={4}
                        >
                            <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
                                <List dense>
                                    {getSearchResults().length > 0 ? (
                                        getSearchResults().map((item) => (
                                            <ListItem key={item.text} disablePadding>
                                                <ListItemButton
                                                    onClick={() => handleResultClick(item.path)}
                                                    sx={{
                                                        py: 1,
                                                        '&:hover': { backgroundColor: '#f5f5f5' },
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <item.icon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.text}
                                                        primaryTypographyProps={{ fontSize: 14 }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText
                                                primary="No results found"
                                                primaryTypographyProps={{
                                                    fontSize: 13,
                                                    color: 'text.secondary',
                                                    sx: { textAlign: 'center', py: 2 },
                                                }}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    )}
                </Box>
            )}

            {/* MENU */}
            <List sx={{ px: 1, py: 2, flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => navigateTo(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    mb: 0.5,
                                    backgroundColor: isActive ? '#d32f2f' : 'transparent',
                                    color: isActive ? '#fff' : '#333',

                                    '& .MuiListItemIcon-root': {
                                        minWidth: 32,
                                        color: isActive ? '#fff' : '#666',
                                    },

                                    '&:hover': {
                                        backgroundColor: isActive ? '#b71c1c' : '#f5f5f5',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <item.icon />
                                </ListItemIcon>

                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: isActive ? 600 : 500,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* PUNCH BUTTON */}
            {userRole === 'EMPLOYEE' && (
                <Box sx={{ p: 2 }}>
                    <PunchButton fullWidth variant="contained" />
                </Box>
            )}

        </Box>
    );

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5' }}>

            {/* ================= TOPBAR ================= */}
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: '#d32f2f',
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { sm: `${DRAWER_WIDTH}px` },
                }}
            >
                <Toolbar>

                    {/* MOBILE MENU */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* BACK BUTTON */}
                    {showBackButton && (
                        <IconButton color="inherit" onClick={handleBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Arman Financial Services Ltd.
                    </Typography>

                    {/* USER SECTION */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 2 }}>
                            <Typography>{user?.first_name || 'User'}</Typography>
                            <Typography sx={{ fontSize: 12 }}>
                                {user?.employee_id || ''}
                            </Typography>
                        </Box>

                        <IconButton onClick={handleMenuOpen} color="inherit">
                            <Avatar sx={{ bgcolor: '#fff', color: '#d32f2f' }}>
                                {user?.first_name?.[0] || 'U'}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem disabled>{userRole}</MenuItem>
                            <Divider />

                            <MenuItem onClick={() => navigate('/profile')}>
                                <AccountCircleIcon sx={{ mr: 1 }} />
                                Profile
                            </MenuItem>

                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>

                </Toolbar>
            </AppBar>

            {/* ================= SIDEBAR ================= */}
            <Box sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: 0 }}>

                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    sx={{
                        display: { sm: 'none' },
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                    }}
                >
                    {drawerContent}
                </Drawer>

                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

            </Box>

            {/* ================= MAIN ================= */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                }}
            >
                {children}
            </Box>

        </Box>
    );
};

export default AppLayout;