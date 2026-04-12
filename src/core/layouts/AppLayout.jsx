import React, { useState, useEffect } from 'react';
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
    ClickAwayListener,
    Badge,
    Button,
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
    Rule as RuleIcon,
    AccountTree as HierarchyIcon,
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'modules/auth/contexts/AuthContext';
import PunchButton from 'modules/attendance/components/PunchButton';
import api from 'core/services/api';

const DRAWER_WIDTH = 250;

const ADMIN_MENU = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard', feature: 'ADMIN_DASHBOARD' },
    { text: 'Pending Approvals', icon: AssignmentIcon, path: '/admin/pending-approvals', feature: 'PENDING_APPROVALS' },
    { text: 'Punch Details', icon: AssignmentIcon, path: '/admin/punch-details', feature: 'PUNCH_DETAILS' },
    { text: 'Employee Tracking', icon: PeopleIcon, path: '/admin/employee-tracking', feature: 'EMPLOYEE_TRACKING' },
    { text: 'Route Map', icon: MapIcon, path: '/admin/route-map', feature: 'ROUTE_MAP' },
    { text: 'Punch Corrections', icon: EditIcon, path: '/admin/punch-corrections', feature: 'PUNCH_CORRECTIONS' },
    { text: 'CRM Visits', icon: LocationIcon, path: '/admin/crm-visits', feature: 'CRM_VISITS' },
    { text: 'Profile Approvals', icon: AssignmentIcon, path: '/admin/profile-approval', feature: 'PROFILE_APPROVALS' },
    { text: 'Create User', icon: PeopleIcon, path: '/admin/create-user', feature: 'CREATE_USER' },
];

const SUPER_ADMIN_MENU = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard', feature: 'ADMIN_DASHBOARD' },
    { text: 'Pending Approvals', icon: AssignmentIcon, path: '/admin/pending-approvals', feature: 'PENDING_APPROVALS' },
    { text: 'Punch Details', icon: AssignmentIcon, path: '/admin/punch-details', feature: 'PUNCH_DETAILS' },
    { text: 'Employee Tracking', icon: PeopleIcon, path: '/admin/employee-tracking', feature: 'EMPLOYEE_TRACKING' },
    { text: 'Route Map', icon: MapIcon, path: '/admin/route-map', feature: 'ROUTE_MAP' },
    { text: 'Punch Corrections', icon: EditIcon, path: '/admin/punch-corrections', feature: 'PUNCH_CORRECTIONS' },
    { text: 'CRM Visits', icon: LocationIcon, path: '/admin/crm-visits', feature: 'CRM_VISITS' },
    { text: 'Profile Approvals', icon: AssignmentIcon, path: '/admin/profile-approval', feature: 'PROFILE_APPROVALS' },
    { text: 'Device Management', icon: PhonelinkIcon, path: '/admin/device-management', feature: 'DEVICE_MANAGEMENT' },
    { text: 'Password Management', icon: LockIcon, path: '/admin/password-management', feature: 'PASSWORD_MANAGEMENT' },
    { text: 'Correction Settings', icon: RuleIcon, path: '/admin/correction-settings', feature: 'CORRECTION_SETTINGS' },
    { text: 'Approval Hierarchy', icon: HierarchyIcon, path: '/admin/approval-hierarchy', feature: 'APPROVAL_HIERARCHY' },
    { text: 'Feature Management', icon: SettingsIcon, path: '/admin/feature-management', feature: 'FEATURE_MANAGEMENT' },
    { text: 'Create User', icon: PeopleIcon, path: '/admin/create-user', feature: 'CREATE_USER' },
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
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [enabledFeatures, setEnabledFeatures] = useState({});

    // ================= FEATURES =================
    useEffect(() => {
        if (!user || userRole === 'EMPLOYEE') return;

        const fetchFeatures = async () => {
            try {
                const cacheKey = `features_${user.id}`;
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < 300000) {
                        setEnabledFeatures(parsed.features);
                        return;
                    }
                }

                const res = await api.getUserFeaturesByUser(user.id);
                const featuresData = res.data || [];
                const featureMap = {};
                featuresData.forEach(f => {
                    featureMap[f.code] = f.is_enabled;
                });
                setEnabledFeatures(featureMap);
                sessionStorage.setItem(cacheKey, JSON.stringify({
                    features: featureMap,
                    timestamp: Date.now()
                }));
            } catch (err) {
                console.error('Failed to fetch features:', err);
            }
        };

        fetchFeatures();
    }, [user, userRole]);

    // ================= NOTIFICATIONS =================
    useEffect(() => {
        if (!user) return;
        
        const fetchNotifications = async () => {
            try {
                const [countRes, notifRes] = await Promise.all([
                    api.getUnreadNotificationCount(),
                    api.getNotifications({ page_size: 10 })
                ]);
                setUnreadCount(countRes.data.unread_count);
                setNotifications(notifRes.data.results || notifRes.data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // ================= SAFETY =================
    if (!user) return null;

    // ================= MENU =================
    const filterMenuByFeatures = (menu) => {
        if (userRole === 'SUPER_ADMIN') return menu;
        if (userRole === 'EMPLOYEE') return menu;
        
        return menu.filter(item => {
            if (!item.feature) return true;
            return enabledFeatures[item.feature] !== false;
        });
    };

    const getMenuItems = () => {
        if (userRole === 'SUPER_ADMIN') return SUPER_ADMIN_MENU;
        if (userRole === 'ADMIN') return filterMenuByFeatures(ADMIN_MENU);
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

    const handleNotificationOpen = (e) => setNotificationAnchor(e.currentTarget);
    const handleNotificationClose = () => setNotificationAnchor(null);

    const handleMarkAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

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
                        {/* NOTIFICATION BELL */}
                        <IconButton color="inherit" onClick={handleNotificationOpen}>
                            <Badge badgeContent={unreadCount} color="warning">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        {/* NOTIFICATION DROPDOWN */}
                        <Menu
                            anchorEl={notificationAnchor}
                            open={Boolean(notificationAnchor)}
                            onClose={handleNotificationClose}
                            PaperProps={{
                                sx: { width: 360, maxHeight: 400 }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                                {unreadCount > 0 && (
                                    <Button size="small" onClick={handleMarkAllRead}>
                                        Mark all read
                                    </Button>
                                )}
                            </Box>
                            <Divider />
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <MenuItem
                                        key={notif.id}
                                        onClick={handleNotificationClose}
                                        sx={{
                                            backgroundColor: notif.is_read ? 'transparent' : 'rgba(211, 47, 47, 0.08)',
                                            whiteSpace: 'normal',
                                            py: 1.5
                                        }}
                                    >
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                {!notif.is_read && (
                                                    <CircleIcon sx={{ fontSize: 8, color: '#d32f2f', mr: 1 }} />
                                                )}
                                                <Typography variant="subtitle2" sx={{ fontWeight: notif.is_read ? 'normal' : 'bold' }}>
                                                    {notif.title}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: notif.is_read ? 0 : 2 }}>
                                                {notif.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: notif.is_read ? 0 : 2 }}>
                                                {new Date(notif.created_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No notifications</Typography>
                                </Box>
                            )}
                        </Menu>

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