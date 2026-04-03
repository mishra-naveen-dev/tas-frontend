import axios from 'axios';

// ================= BASE URL =================
const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_V1 = `${BASE_URL}/api/v1`;
const AUTH_URL = `${API_V1}/auth`;

// ================= CACHE =================
const cache = new Map();

// ================= REFRESH CONTROL =================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
    failedQueue = [];
};

class APIService {

    constructor() {
        this.api = axios.create({
            baseURL: API_V1,
            timeout: 20000,
            headers: { 'Content-Type': 'application/json' }
        });

        // ================= REQUEST =================
        this.api.interceptors.request.use((config) => {
            const token = sessionStorage.getItem('access_token');

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

                if (!error.response) {
                    console.error('Network error');
                    this.logout();
                    return Promise.reject(error);
                }

                if (originalRequest.url.includes('/auth/token/refresh/')) {
                    this.logout();
                    return Promise.reject(error);
                }

                if (
                    error.response.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url.includes('/auth/token/')
                ) {
                    originalRequest._retry = true;

                    const refresh = sessionStorage.getItem('refresh_token');
                    if (!refresh) return this.logout();

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
                        sessionStorage.setItem('access_token', newAccess);

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

                return Promise.reject(error);
            }
        );
    }

    static getInstance() {
        if (!APIService.instance) {
            APIService.instance = new APIService();
        }
        return APIService.instance;
    }

    // ================= COMMON =================
    get(url, params = {}, useCache = false) {
        const key = `${url}_${JSON.stringify(params)}`;

        if (useCache && cache.has(key)) {
            return Promise.resolve({ data: cache.get(key) });
        }

        return this.api.get(url, { params }).then(res => {
            if (useCache) {
                cache.set(key, res.data);
                setTimeout(() => cache.delete(key), 30000);
            }
            return res;
        });
    }

    post(url, data = {}) { return this.api.post(url, data); }
    patch(url, data = {}) { return this.api.patch(url, data); }
    put(url, data = {}) { return this.api.put(url, data); }
    delete(url) { return this.api.delete(url); }

    // ================= AUTH =================
    async login(username, password) {
        const res = await axios.post(`${AUTH_URL}/token/`, { username, password });

        sessionStorage.setItem('access_token', res.data.access);
        sessionStorage.setItem('refresh_token', res.data.refresh);

        return res.data;
    }

    logout() {
        sessionStorage.clear();
        window.location.replace('/#/login');
    }

    // ================= USERS =================
    getCurrentUser() { return this.get('/organization/users/me/'); }
    getUsers(params = {}) { return this.get('/organization/users/', params); }
    createUser(data) { return this.post('/organization/users/', data); }
    updateUser(id, data) { return this.patch(`/organization/users/${id}/`, data); }
    deleteUser(id) { return this.post(`/organization/users/${id}/soft_delete/`); }

    // ================= MASTER =================
    getStates() { return this.get('/organization/states/', {}, true); }
    getBranches(state) { return this.get('/organization/branches/', { state }, true); }
    getAreas(branch) { return this.get('/organization/areas/', { branch }, true); }
    getRoles() { return this.get('/organization/roles/', {}, true); }

    // ================= PASSWORD =================
    changePassword(password) {
        return this.post('/organization/users/change_my_password/', { password });
    }

    // ================= ATTENDANCE =================
    getDailySummary() { return this.get('/attendance/punches/daily_summary/', {}, true); }
    getTodayPunches() { return this.get('/attendance/punches/today_punches/'); }
    getPunchRecords(params = {}) { return this.get('/attendance/punches/', params); }
    createPunchRecord(data) { return this.post('/attendance/punches/', data); }

    // ================= ALLOWANCE =================
    getAllowanceRequests(params = {}) { return this.get('/allowance/requests/', params); }
    createAllowanceRequest(data) { return this.post('/allowance/requests/', data); }

    // ================= CORRECTIONS =================
    getCorrections(params = {}) { return this.get('/attendance/corrections/', params); }
    createCorrection(data) { return this.post('/attendance/corrections/', data); }

    // ================= APPROVAL =================
    getPendingApprovals(params = {}) {
        return this.get('/allowance/requests/', { status: 'PENDING', ...params });
    }

    approveAllowanceRequest(id) {
        return this.post(`/allowance/requests/${id}/approve/`);
    }

    rejectAllowanceRequest(id, data) {
        return this.post(`/allowance/requests/${id}/reject/`, data);
    }

    // ================= LOAN =================
    getLoanVisits(params = {}) { return this.get('/loans/visits/', params); }
    createLoanVisit(data) { return this.post('/loans/visits/', data); }
    updateLoanVisit(id, data) { return this.patch(`/loans/visits/${id}/`, data); }

}

export default APIService.getInstance();