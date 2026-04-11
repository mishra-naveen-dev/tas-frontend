import axios from 'axios';

const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_V1 = `${BASE_URL}/api/v1`;
const AUTH_URL = `${API_V1}/auth`;

const IS_DEV = process.env.NODE_ENV === 'development';

const cache = new Map();

const getAccessToken = () => sessionStorage.getItem('access_token');
const getRefreshToken = () => sessionStorage.getItem('refresh_token');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

const logError = (...args) => {
    if (IS_DEV) console.error(...args);
};

const getDeviceId = () => {
    // Use localStorage to persist device_id across logouts
    let deviceId = localStorage.getItem('device_id');
    
    if (!deviceId) {
        deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
};

class APIService {

    constructor() {
        this.api = axios.create({
            baseURL: API_V1,
            timeout: 20000,
            headers: { 'Content-Type': 'application/json' }
        });

        this.api.interceptors.request.use((config) => {
            const token = getAccessToken();

            if (token && !config.url.includes('/auth/token')) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            config.headers['X-DEVICE-ID'] = getDeviceId();
            config.headers['X-PLATFORM'] = 'WEB';

            const userAgent = navigator.userAgent || '';
            config.headers['X-USER-AGENT'] = userAgent;

            return config;
        });

        this.api.interceptors.response.use(
            res => res,
            async (error) => {

                const originalRequest = error.config;

                if (!error.response) {
                    logError('Network error');
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

                        sessionStorage.setItem('access_token', newAccess);

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

                if (error.response?.status === 403) {
                    const errorCode = error.response?.data?.code;
                    
                    if (errorCode === 'DEVICE_NOT_BINDED' || errorCode === 'DEVICE_ID_REQUIRED') {
                        sessionStorage.removeItem('device_id');
                        console.warn('Device invalidated. Please login again.');
                        this.logout();
                    }
                    
                    if (errorCode === 'PLATFORM_NOT_ALLOWED') {
                        console.warn('This action is only available on desktop/web platform.');
                    }
                }

                logError('API Error:', error.response?.data);
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

    async login(username, password) {
        const deviceId = getDeviceId();
        
        const res = await axios.post(`${AUTH_URL}/token/`, { 
            username, 
            password 
        }, {
            headers: {
                'X-DEVICE-ID': deviceId,
                'X-PLATFORM': 'WEB',
                'X-USER-AGENT': navigator.userAgent || '',
            }
        });

        const data = res.data;

        sessionStorage.setItem('access_token', data.access);
        sessionStorage.setItem('refresh_token', data.refresh);

        if (data.user) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        if (data.device) {
            sessionStorage.setItem('device_info', JSON.stringify(data.device));
        }

        return data;
    }

    logout() {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('device_id');
        sessionStorage.removeItem('device_info');
        window.location.replace('/#/login');
    }

    getDeviceId() {
        return getDeviceId();
    }

    async getCurrentUser() {
        const token = getAccessToken();

        if (!token) {
            return Promise.reject('No token');
        }

        try {
            return await this.get('/organization/users/me/');
        } catch (err) {
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

    getEmployeeTracking() {
        return this.get('/tracking/employees/');
    }

    getEmployeeActivity(employeeId) {
        return this.get(`/tracking/employees/${employeeId}/activity/`);
    }

    getEmployeeRoute(employeeId, params = {}) {
        return this.get(`/tracking/employees/${employeeId}/route/`, params);
    }

    createAllowanceRequest(data) {
        return this.post('/allowance/requests/', data);
    }

    getAllowanceRequests(params = {}) {
        return this.get('/allowance/requests/', params);
    }

    approveAllowanceRequest(id) {
        return this.post(`/allowance/requests/${id}/approve/`);
    }

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

    getProfileRequests(params = {}) {
        return this.get('/organization/profile-update/', params);
    }

    approveProfileRequest(id, data = {}) {
        return this.post(`/organization/profile-update/${id}/approve/`, data);
    }

    rejectProfileRequest(id, data = {}) {
        return this.post(`/organization/profile-update/${id}/reject/`, data);
    }

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

    getMyDevices() {
        return this.get('/organization/devices/my_devices/');
    }

    revokeDevice(deviceId) {
        return this.post('/organization/devices/revoke_device/', { device_id: deviceId });
    }

    revokeAllOtherDevices() {
        return this.post('/organization/devices/revoke_all_other/');
    }

    setPrimaryDevice(deviceId) {
        return this.post('/organization/devices/set_primary/', { device_id: deviceId });
    }

    getAllDevices(params = {}) {
        return this.get('/organization/devices/', params);
    }

    getPasswordExpiryList(params = {}) {
        return this.get('/auth/password-expiry/', params);
    }

    resetUserPasswordExpiry(userId, type = 'expiry') {
        return this.post('/auth/password-expiry/reset/', { user_id: userId, type });
    }
}

export default APIService.getInstance();
