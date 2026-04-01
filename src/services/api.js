import axios from 'axios';

// ================= BASE URL =================
// ENV handles local vs production automatically
const BASE_URL = process.env.REACT_APP_API_URL;

// VERSIONED API
const API_V1 = `${BASE_URL}/api/v1`;

// ================= CACHE =================
const cache = new Map();

// ================= REFRESH CONTROL =================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ================= AXIOS SERVICE =================
class APIService {
    constructor() {
        this.api = axios.create({
            baseURL: API_V1,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // ================= REQUEST INTERCEPTOR =================
        this.api.interceptors.request.use(
            (config) => {
                const token = sessionStorage.getItem('access_token');

                if (token && !config.url.includes('/token/')) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // ================= RESPONSE INTERCEPTOR =================
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (!error.response) {
                    console.error('Network Error');
                    return Promise.reject(error);
                }

                // ================= TOKEN REFRESH =================
                if (
                    error.response.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url.includes('/token/')
                ) {
                    originalRequest._retry = true;

                    const refresh = sessionStorage.getItem('refresh_token');

                    if (!refresh) {
                        this.logout();
                        return Promise.reject(error);
                    }

                    // 🔥 IF ALREADY REFRESHING → QUEUE REQUEST
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.api(originalRequest);
                        });
                    }

                    isRefreshing = true;

                    try {
                        const res = await axios.post(
                            `${BASE_URL}/api/token/refresh/`,
                            { refresh }
                        );

                        const newAccess = res.data.access;

                        sessionStorage.setItem('access_token', newAccess);

                        // update headers
                        this.api.defaults.headers.Authorization = `Bearer ${newAccess}`;
                        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                        processQueue(null, newAccess);

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

    // ================= SINGLETON =================
    static getInstance() {
        if (!APIService.instance) {
            APIService.instance = new APIService();
        }
        return APIService.instance;
    }

    // ================= CACHE =================
    getCacheKey(url, params) {
        return `${url}_${JSON.stringify(params)}`;
    }

    async get(url, params = {}, useCache = false) {
        const key = this.getCacheKey(url, params);

        if (useCache && cache.has(key)) {
            return Promise.resolve({ data: cache.get(key) });
        }

        const res = await this.api.get(url, { params });

        if (useCache) {
            cache.set(key, res.data);
            setTimeout(() => cache.delete(key), 30000);
        }

        return res;
    }

    post(url, data = {}) {
        return this.api.post(url, data);
    }

    patch(url, data = {}) {
        return this.api.patch(url, data);
    }

    put(url, data = {}) {
        return this.api.put(url, data);
    }

    delete(url) {
        return this.api.delete(url);
    }

    // ================= AUTH =================
    async login(username, password) {
        const res = await axios.post(`${BASE_URL}/api/token/`, {
            username,
            password,
        });

        sessionStorage.setItem('access_token', res.data.access);
        sessionStorage.setItem('refresh_token', res.data.refresh);

        return res.data;
    }

    logout() {
        sessionStorage.clear();
        window.location.href = '/login';
    }

    // ================= USER =================
    getCurrentUser() {
        return this.get('/organization/users/me/');
    }

    getUsers(params = {}) {
        return this.get('/organization/users/', params);
    }

    createUser(data) {
        return this.post('/organization/users/', data);
    }

    updateUser(id, data) {
        return this.patch(`/organization/users/${id}/`, data);
    }

    deleteUser(id) {
        return this.delete(`/organization/users/${id}/soft_delete/`);
    }

    // ================= MASTER =================
    getStates() {
        return this.get('/organization/states/', {}, true);
    }

    getBranches(state) {
        return this.get('/organization/branches/', { state }, true);
    }

    getAreas(branch) {
        return this.get('/organization/areas/', { branch }, true);
    }

    getRoles() {
        return this.get('/organization/roles/', {}, true);
    }

    // ================= PASSWORD =================
    changePassword(password) {
        return this.post('/organization/users/change_my_password/', { password });
    }

    // ================= ATTENDANCE =================
    getDailySummary() {
        return this.get('/attendance/punches/daily_summary/', {}, true);
    }

    getTodayPunches() {
        return this.get('/attendance/punches/today_punches/');
    }

    getPunchRecords(params = {}) {
        return this.get('/attendance/punches/', params);
    }

    createPunchRecord(data) {
        return this.post('/attendance/punches/', data);
    }

    // ================= ALLOWANCE =================
    getAllowanceRequests(params = {}) {
        return this.get('/allowance/requests/', params);
    }

    createAllowanceRequest(data) {
        return this.post('/allowance/requests/', data);
    }

    // ================= DASHBOARD =================
    getDashboardStats() {
        return this.get('/attendance/dashboard/admin/', {}, true);
    }
}

export default APIService.getInstance();