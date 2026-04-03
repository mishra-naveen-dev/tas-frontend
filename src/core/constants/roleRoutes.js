import {
    Dashboard, People, Assignment, LocationOn, Receipt, Edit
} from '@mui/icons-material';

export const ROLE_ROUTES = {
    ADMIN: [
        { text: 'Dashboard', icon: Dashboard, path: '/admin/dashboard' },
        { text: 'Pending Approvals', icon: Assignment, path: '/admin/pending-approvals' },
        { text: 'Punch Details', icon: Assignment, path: '/admin/punch-details' },
        { text: 'Employee Tracking', icon: People, path: '/admin/employee-tracking' },
        { text: 'CRM Visits', icon: LocationOn, path: '/admin/crm-visits' },
        { text: 'Punch Corrections', icon: Edit, path: '/admin/punch-corrections' },
        { text: 'Profile Approvals', icon: Assignment, path: '/admin/profile-approval' },
        { text: 'Create User', icon: People, path: '/admin/create-user' },
    ],

    EMPLOYEE: [
        { text: 'Dashboard', icon: Dashboard, path: '/employee/dashboard' },
        { text: 'Punch History', icon: Receipt, path: '/employee/punch-history' },
        { text: 'Punch Corrections', icon: Edit, path: '/employee/punch-corrections' },
        { text: 'Create Allowance', icon: Assignment, path: '/employee/create-allowance' },
        { text: 'Allowance History', icon: LocationOn, path: '/employee/allowance-history' },
        { text: 'Daily Summary', icon: Assignment, path: '/employee/daily-summary' },
    ]
};