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
        grade_name: '',
        department_name: '',
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
        setError('');
        
        const FALLBACK_DESIGNATIONS = [
            { id: 1, grade_name: 'Asst. Manager', designation_name: 'BRANCH ACCOUNTANT', department_name: 'OPERATIONS' },
            { id: 2, grade_name: 'Manager', designation_name: 'RO 1', department_name: 'Collection' },
            { id: 3, grade_name: 'Sr. Executive', designation_name: 'BRANCH CREDIT MANAGER', department_name: 'CREDIT AND MIS' },
            { id: 4, grade_name: 'Asst. Manager', designation_name: 'Operations Analyst', department_name: 'CREDIT AND MIS' },
            { id: 5, grade_name: 'Sr. Executive', designation_name: 'RECOVERY OFFICER', department_name: 'ACCOUNT' },
            { id: 6, grade_name: 'Executive', designation_name: 'Process Associate', department_name: 'OPERATIONS' },
            { id: 7, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER MIS', department_name: 'OPERATIONS' },
            { id: 8, grade_name: 'Manager', designation_name: 'State Manager - Credit', department_name: 'OPERATIONS' },
            { id: 9, grade_name: 'Sr. Manager', designation_name: 'MIS COORDINATOR', department_name: 'CREDIT AND MIS' },
            { id: 10, grade_name: 'Executive', designation_name: 'SR HR EXECUTIVE', department_name: 'OPERATIONS' },
            { id: 11, grade_name: 'Manager', designation_name: 'INSURANCE COORDINATOR', department_name: 'OPERATIONS' },
            { id: 12, grade_name: 'Executive', designation_name: 'AREA MANAGER-COLLECTIONS', department_name: 'Collection' },
            { id: 13, grade_name: 'SVP', designation_name: 'CHIEF OPERATION', department_name: 'OPERATIONS' },
            { id: 14, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER', department_name: 'OPERATIONS' },
            { id: 15, grade_name: 'Manager', designation_name: 'State Manager-Collections', department_name: 'OPERATIONS' },
            { id: 16, grade_name: 'Manager', designation_name: 'Area Credit Manager', department_name: 'OPERATIONS' },
            { id: 17, grade_name: 'Manager', designation_name: 'Finance manager', department_name: 'FINANCE & ACCOUNTS' },
            { id: 18, grade_name: 'Manager', designation_name: 'CREDIT HEAD', department_name: 'OPERATIONS' },
            { id: 19, grade_name: 'Manager', designation_name: 'State Legal Manager', department_name: 'Legal' },
            { id: 20, grade_name: 'Asst. Manager', designation_name: 'ABM - Business', department_name: 'ACCOUNT' },
            { id: 21, grade_name: 'Manager', designation_name: 'BRANCH MANAGER', department_name: 'OPERATIONS' },
            { id: 22, grade_name: 'Sr. Manager', designation_name: 'STATE HEAD', department_name: 'OPERATIONS' },
            { id: 23, grade_name: 'Manager', designation_name: 'ASST MANAGER', department_name: 'OPERATIONS' },
            { id: 24, grade_name: 'Manager', designation_name: 'Zonal Manager - Audit', department_name: 'INTERNAL AUDIT' },
            { id: 25, grade_name: 'Manager', designation_name: 'DEPUTY STATE HEAD', department_name: 'OPERATIONS' },
            { id: 26, grade_name: 'Executive', designation_name: 'ADMIN EXECUTIVE', department_name: 'INTERNAL AUDIT' },
            { id: 27, grade_name: 'Manager', designation_name: 'Collection manager', department_name: 'Collection' },
            { id: 28, grade_name: 'Asst. Manager', designation_name: 'FIELD OFFICER', department_name: 'OPERATIONS' },
            { id: 29, grade_name: 'Manager', designation_name: 'AUDIT MANAGER', department_name: 'INTERNAL AUDIT' },
            { id: 30, grade_name: 'Sr. Executive', designation_name: 'BRANCH ACCOUNTANT', department_name: 'OPERATIONS' },
            { id: 31, grade_name: 'Manager', designation_name: 'Training Manager', department_name: 'Training' },
            { id: 32, grade_name: 'Asst. Manager', designation_name: 'Executive MIS', department_name: 'CREDIT AND MIS' },
            { id: 33, grade_name: 'Manager', designation_name: 'AUDIT ASSOCIATE', department_name: 'INTERNAL AUDIT' },
            { id: 34, grade_name: 'Director', designation_name: 'EXECUTIVE DIRECTOR', department_name: 'MANAGEMENT' },
            { id: 35, grade_name: 'Director', designation_name: 'MANAGING DIRECTOR', department_name: 'MANAGEMENT' },
            { id: 36, grade_name: 'Executive', designation_name: 'ABM-COLLECTION', department_name: 'OPERATIONS' },
            { id: 37, grade_name: 'Sr. Manager', designation_name: 'DATA ENTRY OPERATOR', department_name: 'CREDIT AND MIS' },
            { id: 38, grade_name: 'Executive', designation_name: 'IT Executive', department_name: 'IT' },
            { id: 39, grade_name: 'Executive', designation_name: 'MIS COORDINATOR', department_name: 'CREDIT AND MIS' },
            { id: 40, grade_name: 'Sr. Manager', designation_name: 'SR TVR COORDINATOR', department_name: 'CREDIT AND MIS' },
            { id: 41, grade_name: 'Asst. Manager', designation_name: 'SR HR EXECUTIVE', department_name: 'HR' },
            { id: 42, grade_name: 'Asst. Manager', designation_name: 'ASST BRANCH MANAGER', department_name: 'OPERATIONS' },
            { id: 43, grade_name: 'Manager', designation_name: 'RO 2', department_name: 'Collection' },
            { id: 44, grade_name: 'Sr. Manager', designation_name: 'State Manager-Collections', department_name: 'OPERATIONS' },
            { id: 45, grade_name: 'Executive', designation_name: 'MIS - Legal', department_name: 'Legal' },
            { id: 46, grade_name: 'Executive', designation_name: 'RO 3', department_name: 'Collection' },
            { id: 47, grade_name: 'Sr. Executive', designation_name: 'DEPARTMENT HEAD', department_name: 'COMPLIANCE & LEGAL' },
            { id: 48, grade_name: 'Executive', designation_name: 'Tele Caller', department_name: 'OPERATIONS' },
            { id: 49, grade_name: 'Executive', designation_name: 'Executive MIS', department_name: 'CREDIT AND MIS' },
            { id: 50, grade_name: 'Manager', designation_name: 'MIS - Legal', department_name: 'CREDIT AND MIS' },
            { id: 51, grade_name: 'Sr. Manager', designation_name: 'OPERATION COORDINATOR', department_name: 'OPERATIONS' },
            { id: 52, grade_name: 'Sr. Manager', designation_name: 'CHIEF OPERATION', department_name: 'OPERATIONS' },
            { id: 53, grade_name: 'Executive', designation_name: 'RO 1', department_name: 'Collection' },
            { id: 54, grade_name: 'Asst. Manager', designation_name: 'Team Leader Recovery', department_name: 'Collection' },
            { id: 55, grade_name: 'Sr. Manager', designation_name: 'REGIONAL MANAGER', department_name: 'OPERATIONS' },
            { id: 56, grade_name: 'Executive', designation_name: 'OPERATION COORDINATOR', department_name: 'OPERATIONS' },
            { id: 57, grade_name: 'Manager', designation_name: 'REGIONAL HR', department_name: 'HR' },
            { id: 58, grade_name: 'Executive', designation_name: 'ACCOUNTS EXECUTIVE', department_name: 'ACCOUNT' },
            { id: 59, grade_name: 'Executive', designation_name: 'TEAM LEADER', department_name: 'CREDIT AND MIS' },
            { id: 60, grade_name: 'Sr. Manager', designation_name: 'REGIONAL MANAGER', department_name: 'INTERNAL AUDIT' },
            { id: 61, grade_name: 'Sr. Manager', designation_name: 'COLLECTION TEAM', department_name: 'CREDIT AND MIS' },
            { id: 62, grade_name: 'Manager', designation_name: 'ASST BRANCH MANAGER', department_name: 'OPERATIONS' },
            { id: 63, grade_name: 'Sr. Manager', designation_name: 'Zonal Head', department_name: 'OPERATIONS' },
            { id: 64, grade_name: 'Executive', designation_name: 'Area Credit Manager', department_name: 'OPERATIONS' },
            { id: 65, grade_name: 'Executive', designation_name: 'RO 2', department_name: 'Collection' },
            { id: 66, grade_name: 'AVP', designation_name: 'Zonal Head', department_name: 'OPERATIONS' },
            { id: 67, grade_name: 'SVP', designation_name: 'CFO', department_name: 'ACCOUNT' },
            { id: 68, grade_name: 'Executive', designation_name: 'TEAM LEADER', department_name: 'Collection' },
            { id: 69, grade_name: 'Manager', designation_name: 'BRANCH CREDIT MANAGER', department_name: 'OPERATIONS' },
            { id: 70, grade_name: 'Executive', designation_name: 'TVR TEAM', department_name: 'OPERATIONS' },
            { id: 71, grade_name: 'Sr. Executive', designation_name: 'AUDIT EXECUTIVE', department_name: 'INTERNAL AUDIT' },
            { id: 72, grade_name: 'Asst. Manager', designation_name: 'ABM-COLLECTION', department_name: 'OPERATIONS' },
            { id: 73, grade_name: 'Executive', designation_name: 'Database Administrator', department_name: 'OPERATIONS' },
            { id: 74, grade_name: 'Sr. Executive', designation_name: 'Team Leader Recovery', department_name: 'Collection' },
            { id: 75, grade_name: 'Manager', designation_name: 'REGIONAL HR', department_name: 'HR ADMIN' },
            { id: 76, grade_name: 'Executive', designation_name: 'Project Coordinator', department_name: 'OPERATIONS' },
            { id: 77, grade_name: 'Manager', designation_name: 'AREA MANAGER-COLLECTIONS', department_name: 'OPERATIONS' },
            { id: 78, grade_name: 'Sr. Executive', designation_name: 'MIS COORDINATOR', department_name: 'OPERATIONS' },
            { id: 79, grade_name: 'Sr. Executive', designation_name: 'Tele Caller', department_name: 'CREDIT AND MIS' },
            { id: 80, grade_name: 'Manager', designation_name: 'State Manager - Credit', department_name: 'INTERNAL AUDIT' },
            { id: 81, grade_name: 'Manager', designation_name: 'HR MANAGER', department_name: 'HR' },
            { id: 82, grade_name: 'Executive', designation_name: 'BRANCH CREDIT MANAGER', department_name: 'OPERATIONS' },
            { id: 83, grade_name: 'Executive', designation_name: 'BRANCH ACCOUNTANT', department_name: 'ACCOUNT' },
            { id: 84, grade_name: 'Executive', designation_name: 'State Legal Manager', department_name: 'CREDIT AND MIS' },
            { id: 85, grade_name: 'Executive', designation_name: 'Collections Executive', department_name: 'OPERATIONS' },
            { id: 86, grade_name: 'Manager', designation_name: 'Team Leader Recovery', department_name: 'OPERATIONS' },
            { id: 87, grade_name: 'Asst. Manager', designation_name: 'AREA MANAGER-COLLECTIONS', department_name: 'OPERATIONS' },
            { id: 88, grade_name: 'Manager', designation_name: 'Customer Relationship Manager', department_name: 'OPERATIONS' },
            { id: 89, grade_name: 'Executive', designation_name: 'FIELD OFFICER', department_name: 'COMPLIANCE & LEGAL' },
            { id: 90, grade_name: 'Asst. Manager', designation_name: 'SR HR EXECUTIVE', department_name: 'HR ADMIN' },
            { id: 91, grade_name: 'Sr. Manager', designation_name: 'Zonal Manager - Audit', department_name: 'INTERNAL AUDIT' },
            { id: 92, grade_name: 'Executive', designation_name: 'RECOVERY OFFICER', department_name: 'OPERATIONS' },
            { id: 93, grade_name: 'AVP', designation_name: 'TEAM LEADER', department_name: 'CREDIT AND MIS' },
            { id: 94, grade_name: 'Executive', designation_name: 'AREA MANAGER-COLLECTIONS', department_name: 'OPERATIONS' },
            { id: 95, grade_name: 'Manager', designation_name: 'Dy Regional Manager', department_name: 'OPERATIONS' },
            { id: 96, grade_name: 'Manager', designation_name: 'REGIONAL HR', department_name: 'OPERATIONS' },
            { id: 97, grade_name: 'AVP', designation_name: 'Head - MIS', department_name: 'CREDIT AND MIS' },
            { id: 98, grade_name: 'Sr. Manager', designation_name: 'REGIONAL MANAGER AUDIT', department_name: 'INTERNAL AUDIT' },
            { id: 99, grade_name: 'Executive', designation_name: 'MIS - Legal', department_name: 'OPERATIONS' },
            { id: 100, grade_name: 'Asst. Manager', designation_name: 'OPERATION COORDINATOR', department_name: 'OPERATIONS' },
            { id: 101, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER MIS', department_name: 'CREDIT AND MIS' },
            { id: 102, grade_name: 'Executive', designation_name: 'HR EXECUTIVE', department_name: 'HR' },
            { id: 103, grade_name: 'Asst. Manager', designation_name: 'Audit', department_name: 'ACCOUNT' },
            { id: 104, grade_name: 'Executive', designation_name: 'ACCOUNTS EXECUTIVE', department_name: 'FINANCE & ACCOUNTS' },
            { id: 105, grade_name: 'Manager', designation_name: 'TEAM LEADER', department_name: 'CREDIT AND MIS' },
            { id: 106, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER', department_name: 'CREDIT AND MIS' },
            { id: 107, grade_name: 'Executive', designation_name: 'MIS COORDINATOR', department_name: 'OPERATIONS' },
            { id: 108, grade_name: 'Manager', designation_name: 'REGIONAL MANAGER AUDIT', department_name: 'INTERNAL AUDIT' },
            { id: 109, grade_name: 'Manager', designation_name: 'AREA MANAGER', department_name: 'OPERATIONS' },
            { id: 110, grade_name: 'Sr. Executive', designation_name: 'REGIONAL MANAGER AUDIT', department_name: 'INTERNAL AUDIT' },
            { id: 111, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER', department_name: 'ACCOUNT' },
            { id: 112, grade_name: 'Manager', designation_name: 'STATE CREDIT HEAD', department_name: 'OPERATIONS' },
            { id: 113, grade_name: 'Sr. Manager', designation_name: 'PRODUCT MANAGER - IT', department_name: 'IT' },
            { id: 114, grade_name: 'Executive', designation_name: 'Customer Care Executive', department_name: 'OPERATIONS' },
            { id: 115, grade_name: 'Executive', designation_name: 'FIELD OFFICER', department_name: 'Collection' },
            { id: 116, grade_name: 'Executive', designation_name: 'FIELD OFFICER', department_name: 'CREDIT AND MIS' },
            { id: 117, grade_name: 'Executive', designation_name: 'ACCOUNTS EXECUTIVE', department_name: 'OPERATIONS' },
            { id: 118, grade_name: 'SVP', designation_name: 'CFO', department_name: 'FINANCE & ACCOUNTS' },
            { id: 119, grade_name: 'Manager', designation_name: 'State Manager-Collections', department_name: 'Collection' },
            { id: 120, grade_name: 'Manager', designation_name: 'PRODUCT MANAGER - IT', department_name: 'OPERATIONS' },
            { id: 121, grade_name: 'Sr. Manager', designation_name: 'AUDIT MANAGER', department_name: 'INTERNAL AUDIT' },
            { id: 122, grade_name: 'Manager', designation_name: 'Collection manager', department_name: 'OPERATIONS' },
            { id: 123, grade_name: 'VP', designation_name: 'BRANCH ACCOUNTANT', department_name: 'OPERATIONS' },
            { id: 124, grade_name: 'Executive', designation_name: 'Audit', department_name: 'OPERATIONS' },
            { id: 125, grade_name: 'Sr. Executive', designation_name: 'ACCOUNTS EXECUTIVE', department_name: 'FINANCE & ACCOUNTS' },
            { id: 126, grade_name: 'Asst. Manager', designation_name: 'ABM - Business', department_name: 'OPERATIONS' },
            { id: 127, grade_name: 'Asst. Manager', designation_name: 'TEAM LEADER', department_name: 'OPERATIONS' },
            { id: 128, grade_name: 'AVP', designation_name: 'DEPUTY STATE HEAD', department_name: 'OPERATIONS' },
            { id: 129, grade_name: 'Sr. Manager', designation_name: 'Sr Manager Process', department_name: 'MANAGEMENT' },
            { id: 130, grade_name: 'Executive', designation_name: 'TVR TEAM', department_name: 'CREDIT AND MIS' },
            { id: 131, grade_name: 'Executive', designation_name: 'AUDIT EXECUTIVE', department_name: 'OPERATIONS' },
            { id: 132, grade_name: 'Sr. Manager', designation_name: 'Group Head - Collection', department_name: 'OPERATIONS' },
            { id: 133, grade_name: 'Manager', designation_name: 'risk manager', department_name: 'OPERATIONS' },
            { id: 134, grade_name: 'Executive', designation_name: 'Team Leader Recovery', department_name: 'Collection' },
            { id: 135, grade_name: 'Manager', designation_name: 'RECOVERY OFFICER', department_name: 'OPERATIONS' },
            { id: 136, grade_name: 'VP', designation_name: 'Chief Information Officer', department_name: 'IT & PROCESS' },
            { id: 137, grade_name: 'Manager', designation_name: 'BRANCH MANAGER', department_name: 'CREDIT AND MIS' },
            { id: 138, grade_name: 'Sr. Executive', designation_name: 'RO 1', department_name: 'Collection' },
            { id: 139, grade_name: 'Manager', designation_name: 'AREA MANAGER-COLLECTIONS', department_name: 'Collection' },
            { id: 140, grade_name: 'Executive', designation_name: 'AUDIT EXECUTIVE', department_name: 'INTERNAL AUDIT' },
            { id: 141, grade_name: 'Asst. Manager', designation_name: 'AUDIT ASSOCIATE', department_name: 'INTERNAL AUDIT' },
            { id: 142, grade_name: 'Executive', designation_name: 'ASST BRANCH MANAGER', department_name: 'OPERATIONS' },
            { id: 143, grade_name: 'Executive', designation_name: 'SYS SUPPORT EXECUTIVE', department_name: 'IT' },
            { id: 144, grade_name: 'Manager', designation_name: 'BRANCH CREDIT MANAGER', department_name: 'CREDIT AND MIS' },
            { id: 145, grade_name: 'Executive', designation_name: 'BRANCH MANAGER', department_name: 'OPERATIONS' },
            { id: 146, grade_name: 'Executive', designation_name: 'Dy-Manager Process', department_name: 'OPERATIONS' },
            { id: 147, grade_name: 'Asst. Manager', designation_name: 'TVR TEAM', department_name: 'CREDIT AND MIS' },
            { id: 148, grade_name: 'Executive', designation_name: 'Executive MIS', department_name: 'OPERATIONS' },
            { id: 149, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER DATA ANALYTICS', department_name: 'OPERATIONS' },
            { id: 150, grade_name: 'Executive', designation_name: 'BRANCH ACCOUNTANT', department_name: 'OPERATIONS' },
            { id: 151, grade_name: 'Manager', designation_name: 'REGIONAL MANAGER', department_name: 'OPERATIONS' },
            { id: 152, grade_name: 'Manager', designation_name: 'Training Manager', department_name: 'OPERATIONS' },
            { id: 153, grade_name: 'Executive', designation_name: 'ACCOUNTS EXECUTIVE', department_name: 'CREDIT AND MIS' },
            { id: 154, grade_name: 'Asst. Manager', designation_name: 'ASST MANAGER', department_name: 'HR' },
            { id: 155, grade_name: 'Manager', designation_name: 'project manager', department_name: 'OPERATIONS' },
            { id: 156, grade_name: 'Executive', designation_name: 'Analyst - Internal Audit', department_name: 'INTERNAL AUDIT' },
            { id: 157, grade_name: 'Sr. Executive', designation_name: 'RO 2', department_name: 'Collection' },
            { id: 158, grade_name: 'Manager', designation_name: 'ABM - Business', department_name: 'OPERATIONS' },
            { id: 159, grade_name: 'Executive', designation_name: 'RECOVERY OFFICER', department_name: 'Collection' },
            { id: 160, grade_name: 'Executive', designation_name: 'AREA MANAGER', department_name: 'OPERATIONS' },
            { id: 161, grade_name: 'Sr. Executive', designation_name: 'FIELD OFFICER', department_name: 'OPERATIONS' },
            { id: 162, grade_name: 'Executive', designation_name: 'Tele caller', department_name: 'CREDIT AND MIS' },
            { id: 163, grade_name: 'Manager', designation_name: 'Area Credit Manager', department_name: 'CREDIT AND MIS' },
            { id: 164, grade_name: 'Manager', designation_name: 'DEPARTMENT HEAD', department_name: 'FINANCE & ACCOUNTS' },
            { id: 165, grade_name: 'Executive', designation_name: 'Legal Associate', department_name: 'COMPLIANCE & LEGAL' },
            { id: 166, grade_name: 'Executive', designation_name: 'Management Trainee', department_name: 'OPERATIONS' },
            { id: 167, grade_name: 'Manager', designation_name: 'REGIONAL MANAGER AUDIT', department_name: 'OPERATIONS' },
            { id: 168, grade_name: 'Asst. Manager', designation_name: 'MIS COORDINATOR', department_name: 'CREDIT AND MIS' },
            { id: 169, grade_name: 'Asst. Manager', designation_name: 'AREA MANAGER', department_name: 'OPERATIONS' },
            { id: 170, grade_name: 'Executive', designation_name: 'REGIONAL MANAGER', department_name: 'OPERATIONS' },
            { id: 171, grade_name: 'Executive', designation_name: 'BRANCH CREDIT MANAGER', department_name: 'CREDIT AND MIS' },
            { id: 172, grade_name: 'Sr. Manager', designation_name: 'Sr Manager - Audit', department_name: 'INTERNAL AUDIT' },
            { id: 173, grade_name: 'Manager', designation_name: 'risk manager', department_name: 'INTERNAL AUDIT' },
            { id: 174, grade_name: 'Executive', designation_name: 'Tele Caller', department_name: 'Collection' },
            { id: 175, grade_name: 'Sr. Manager', designation_name: 'AREA MANAGER', department_name: 'OPERATIONS' },
            { id: 176, grade_name: 'Executive', designation_name: 'INSURANCE COORDINATOR', department_name: 'OPERATIONS' },
            { id: 177, grade_name: 'Sr. Manager', designation_name: 'Collection manager', department_name: 'OPERATIONS' },
            { id: 178, grade_name: 'Manager', designation_name: 'BRANCH ACCOUNTANT', department_name: 'OPERATIONS' },
            { id: 179, grade_name: 'Manager', designation_name: 'FIELD OFFICER', department_name: 'OPERATIONS' },
            { id: 180, grade_name: 'Executive', designation_name: 'Training Manager', department_name: 'OPERATIONS' },
            { id: 181, grade_name: 'Executive', designation_name: 'RO 1', department_name: 'OPERATIONS' },
            { id: 182, grade_name: 'Asst. Manager', designation_name: 'BRANCH MANAGER', department_name: 'OPERATIONS' },
            { id: 183, grade_name: 'Executive', designation_name: 'Business Analyst', department_name: 'OPERATIONS' },
            { id: 184, grade_name: 'Executive', designation_name: 'AUDIT ASSOCIATE', department_name: 'INTERNAL AUDIT' },
            { id: 185, grade_name: 'AVP', designation_name: 'STATE HEAD', department_name: 'OPERATIONS' },
            { id: 186, grade_name: 'Executive', designation_name: 'Audit', department_name: 'INTERNAL AUDIT' },
            { id: 187, grade_name: 'Executive', designation_name: 'AUDIT MANAGER', department_name: 'INTERNAL AUDIT' },
            { id: 188, grade_name: 'Manager', designation_name: 'MIS Manager', department_name: 'CREDIT AND MIS' },
            { id: 189, grade_name: 'Sr. Manager', designation_name: 'INTERNAL AUDIT HEAD', department_name: 'INTERNAL AUDIT' },
            { id: 190, grade_name: 'Executive', designation_name: 'RO 3', department_name: 'OPERATIONS' },
            { id: 191, grade_name: 'Sr. Manager', designation_name: 'Area Credit Manager', department_name: 'CREDIT AND MIS' },
            { id: 192, grade_name: 'Manager', designation_name: 'Team Leader Recovery', department_name: 'Collection' },
            { id: 193, grade_name: 'Executive', designation_name: 'RO 2', department_name: 'OPERATIONS' },
            { id: 194, grade_name: 'Manager', designation_name: 'Zonal Head', department_name: 'OPERATIONS' },
        ];

        try {
            let desigsRes = { data: [] };
            try {
                desigsRes = await api.getDesignations();
            } catch (e) {
                console.warn('Designation API failed, using fallback data');
            }

            const [rolesRes, statesRes] = await Promise.all([
                api.getRoles(),
                api.getStates()
            ]);

            setRoles(rolesRes.data || []);
            setStates(statesRes.data || []);
            
            const allDesignations = (desigsRes.data && desigsRes.data.length > 0) 
                ? desigsRes.data 
                : FALLBACK_DESIGNATIONS;
            
            setDesignations(allDesignations);

            if (allDesignations.length > 0) {
                const uniqueGrades = [...new Set(allDesignations.map(d => d.grade_name))];
                const uniqueDepts = [...new Set(allDesignations.map(d => d.department_name))];
                setGrades(uniqueGrades);
                setDepartments(uniqueDepts);
            }

        } catch (err) {
            console.error("FETCH ERROR:", err);
            setError("Failed to load data: " + (err.message || err.response?.statusText || 'Unknown error'));
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
                designation: '',
                grade_name: '',
                department_name: '',
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
                                label="Zone / State"
                                name="state"
                                value={form.state || ''}
                                onChange={handleChange}
                            >
                                <MenuItem value="">None</MenuItem>
                                {states.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.zone_name ? `${s.zone_name} / ${s.name}` : s.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Branch"
                                name="branch"
                                value={form.branch || ''}
                                onChange={handleChange}
                                disabled={!form.state}
                            >
                                <MenuItem value="">None</MenuItem>
                                {branches.map((b) => (
                                    <MenuItem key={b.id} value={b.id}>
                                        {b.name} ({b.region} - {b.center})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Area"
                                name="area"
                                value={form.area || ''}
                                onChange={handleChange}
                                disabled={!form.branch}
                            >
                                <MenuItem value="">None</MenuItem>
                                {areas.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>
                                        {a.name} {a.unit ? `(${a.unit})` : ''}
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
