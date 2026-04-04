import axios from 'axios';

// ================= ENV =================
const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_V1 = `${BASE_URL}/api/v1`;
const AUTH_URL = `${API_V1}/auth`;

const IS_DEV = process.env.NODE_ENV === 'development';

// ================= CACHE =================
const cache = new Map();

// ================= TOKEN =================
const getAccessToken = () => sessionStorage.getItem('access_token');
const getRefreshToken = () => sessionStorage.getItem('refresh_token');

// ================= REFRESH CONTROL =================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ================= LOGGER =================
const logError = (...args) => {
    if (IS_DEV) console.error(...args);
};

// ================= SERVICE =================
class APIService {

    constructor() {
        this.api = axios.create({
            baseURL: API_V1,
            timeout: 20000,
            headers: { 'Content-Type': 'application/json' }
        });

        // ================= REQUEST =================
        this.api.interceptors.request.use((config) => {
            const token = getAccessToken();

            if (token && !config.url.includes('/auth/token')) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        });

        // ================= RESPONSE =================
        this.api.interceptors.response.use(
            res => res,
            async (error) => {

                const originalRequest = error.config;

                // 🌐 Network issue
                if (!error.response) {
                    logError('Network error');
                    return Promise.reject(error);
                }

                // 🔥 Refresh failed → logout
                if (originalRequest.url.includes('/auth/token/refresh/')) {
                    this.logout();
                    return Promise.reject(error);
                }

                // 🔥 Token expired → refresh
                if (
                    error.response.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url.includes('/auth/token/')
                ) {
                    originalRequest._retry = true;

                    const refresh = getRefreshToken();

                    if (!refresh) {
                        this.logout();
                        return Promise.reject(error);
                    }

                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.api(originalRequest);
                        });
                    }

                    isRefreshing = true;

                    try {
                        const res = await axios.post(`${AUTH_URL}/token/refresh/`, { refresh });

                        const newAccess = res.data.access;

                        // ✅ SAVE TOKEN
                        sessionStorage.setItem('access_token', newAccess);

                        // ✅ UPDATE DEFAULT HEADER
                        this.api.defaults.headers.Authorization = `Bearer ${newAccess}`;

                        processQueue(null, newAccess);

                        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                        return this.api(originalRequest);

                    } catch (err) {
                        processQueue(err, null);
                        this.logout();
                        return Promise.reject(err);

                    } finally {
                        isRefreshing = false;
                    }
                }

                logError('API Error:', error.response?.data);
                return Promise.reject(error);
            }
        );
    }

    // ================= SINGLETON =================
    static getInstance() {
        if (!APIService.instance) {
            APIService.instance = new APIService();
        }
        return APIService.instance;
    }

    // ================= COMMON =================
    async get(url, params = {}, useCache = false) {
        try {
            const key = `${url}_${JSON.stringify(params)}`;

            if (useCache && cache.has(key)) {
                return { data: cache.get(key) };
            }

            const res = await this.api.get(url, { params });

            if (useCache) {
                cache.set(key, res.data);
                setTimeout(() => cache.delete(key), 30000);
            }

            return res;

        } catch (err) {
            logError('GET ERROR:', url);
            throw err;
        }
    }

    async post(url, data = {}) {
        return this.api.post(url, data);
    }

    async patch(url, data = {}) {
        return this.api.patch(url, data);
    }

    async put(url, data = {}) {
        return this.api.put(url, data);
    }

    async delete(url) {
        return this.api.delete(url);
    }

    // ================= AUTH =================
    async login(username, password) {
        const res = await axios.post(`${AUTH_URL}/token/`, { username, password });

        const data = res.data;

        sessionStorage.setItem('access_token', data.access);
        sessionStorage.setItem('refresh_token', data.refresh);

        if (data.user) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    logout() {
        sessionStorage.clear();
        window.location.replace('/#/login');
    }

    // ================= USER =================
    async getCurrentUser() {
        const token = getAccessToken();

        // 🔥 BLOCK CALL IF NO TOKEN
        if (!token) {
            return Promise.reject('No token');
        }

        try {
            return await this.get('/organization/users/me/');
        } catch (err) {
            // 🔥 DO NOT CALL AGAIN (avoid loop)
            throw err;
        }
    }

    createUser(data) {
        return this.post('/organization/users/', data);
    }

    updateUser(id, data) {
        return this.patch(`/organization/users/${id}/`, data);
    }

    deleteUser(id) {
        return this.post(`/organization/users/${id}/soft_delete/`);
    }

    getUsers(params = {}) {
        return this.get('/organization/users/', params);
    }

    changePassword(password) {
        return this.post('/organization/users/change_my_password/', {
            password
        });
    }

    // ================= ATTENDANCE =================
    createPunchRecord(data) {
        return this.post('/attendance/punches/', data);
    }

    getDailySummary() {
        return this.get('/attendance/punches/daily_summary/');
    }

    getTodayPunches() {
        return this.get('/attendance/punches/today_punches/');
    }

    getPunchRecords(params = {}) {
        return this.get('/attendance/punches/', params);
    }

    getCorrections(params = {}) {
        return this.get('/attendance/corrections/', params);
    }

    createCorrection(data) {
        return this.post('/attendance/corrections/', data);
    }

    // ================= TRACKING =================
    getEmployeeTracking() {
        return this.get('/tracking/employees/');
    }

    getEmployeeActivity(employeeId) {
        return this.get(`/tracking/employees/${employeeId}/activity/`);
    }

    getEmployeeRoute(employeeId, params = {}) {
        return this.get(`/tracking/employees/${employeeId}/route/`, params);
    }

    // ================= ALLOWANCE =================
    createAllowanceRequest(data) {
        return this.post('/allowance/requests/', data);
    }

    getAllowanceRequests(params = {}) {
        return this.get('/allowance/requests/', params);
    }

    approveAllowanceRequest(id) {
        return this.post(`/allowance/requests/${id}/approve/`);
    }
    // ================= APPROVAL =================
    getPendingApprovals(params = {}) {
        return this.get('/allowance/requests/', {
            status: 'PENDING',
            ...params
        });
    }
    rejectAllowanceRequest(id, data) {
        return this.post(`/allowance/requests/${id}/reject/`, data);
    }

    getLoanVisits(params = {}) {
        return this.get('/loans/visits/', params);
    }
    // ================= PROFILE =================
    getProfileRequests(params = {}) {
        return this.get('/organization/profile-update/', params);
    }

    approveProfileRequest(id, data = {}) {
        return this.post(`/organization/profile-update/${id}/approve/`, data);
    }

    rejectProfileRequest(id, data = {}) {
        return this.post(`/organization/profile-update/${id}/reject/`, data);
    }

    // ================= MASTER =================
    getRoles() {
        return this.get('/organization/roles/', {}, true);
    }

    getStates() {
        return this.get('/organization/states/', {}, true);
    }

    getBranches(state) {
        return this.get('/organization/branches/', { state }, true);
    }

    getAreas(branch) {
        return this.get('/organization/areas/', { branch }, true);
    }
}

export default APIService.getInstance();