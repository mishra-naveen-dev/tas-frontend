import axios from 'axios';
import { RetryHandler, RateLimiter, OfflineQueue, RequestCache } from './ApiUtils';

const BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_V1 = `${BASE_URL}/api/v1`;
const AUTH_URL = `${API_V1}/auth`;

const CACHE = new RequestCache();
const OFFLINE_QUEUE = new OfflineQueue();
const RATE_LIMITER = new RateLimiter(100, 60000);

let isRefreshing = false;
let failedQueue = [];

const getAccessToken = () => sessionStorage.getItem('access_token');
const getRefreshToken = () => sessionStorage.getItem('refresh_token');

const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

class ScalableAPI {
    constructor() {
        this.api = axios.create({
            baseURL: API_V1,
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        this.api.interceptors.request.use(async (config) => {
            await RATE_LIMITER.acquire();
            
            const token = getAccessToken();
            if (token && !config.url.includes('/auth/token')) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            config.headers['X-DEVICE-ID'] = getDeviceId();
            config.headers['X-PLATFORM'] = 'WEB';
            config.headers['X-USER-AGENT'] = navigator.userAgent || '';

            return config;
        });

        this.api.interceptors.response.use(
            res => res,
            async (error) => {
                const originalRequest = error.config;

                if (!error.response) {
                    if (error.request && !navigator.onLine) {
                        OFFLINE_QUEUE.add({
                            url: originalRequest.url,
                            method: originalRequest.method,
                            data: originalRequest.data,
                            params: originalRequest.params
                        });
                    }
                    return Promise.reject({ ...error, offline: true });
                }

                if (originalRequest.url.includes('/auth/token/refresh/')) {
                    this.logout();
                    return Promise.reject(error);
                }

                if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/token/')) {
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
                        localStorage.removeItem('device_id');
                        this.logout();
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    static getInstance() {
        if (!ScalableAPI.instance) {
            ScalableAPI.instance = new ScalableAPI();
        }
        return ScalableAPI.instance;
    }

    async get(url, params = {}, options = {}) {
        const { useCache = false, retry = true } = options;
        const cacheKey = `${url}_${JSON.stringify(params)}`;

        if (useCache) {
            const cached = CACHE.get(cacheKey);
            if (cached) {
                return { data: cached, cached: true };
            }
        }

        const request = async () => {
            const res = await this.api.get(url, { params });
            if (useCache) {
                CACHE.set(cacheKey, res.data);
            }
            return res;
        };

        if (retry) {
            return RetryHandler.withRetry(request);
        }
        return request();
    }

    async post(url, data = {}, options = {}) {
        const { retry = false, offline = false } = options;

        const request = async () => {
            const res = await this.api.post(url, data);
            this.invalidateCache(url);
            return res;
        };

        if (offline && !navigator.onLine) {
            OFFLINE_QUEUE.add({ url, method: 'POST', data, params: {} });
            return { data: { queued: true }, offline: true };
        }

        if (retry) {
            return RetryHandler.withRetry(request);
        }
        return request();
    }

    async patch(url, data = {}, options = {}) {
        const { retry = false } = options;

        const request = async () => {
            const res = await this.api.patch(url, data);
            this.invalidateCache(url);
            return res;
        };

        if (retry) {
            return RetryHandler.withRetry(request);
        }
        return request();
    }

    async put(url, data = {}) {
        const res = await this.api.put(url, data);
        this.invalidateCache(url);
        return res;
    }

    async delete(url) {
        const res = await this.api.delete(url);
        this.invalidateCache(url);
        return res;
    }

    invalidateCache(prefix = null) {
        if (prefix) {
            CACHE.invalidatePrefix(prefix);
        } else {
            CACHE.invalidate();
        }
    }

    async processOfflineQueue() {
        if (navigator.onLine && OFFLINE_QUEUE.length > 0) {
            await OFFLINE_QUEUE.process(this);
        }
    }

    async login(username, password) {
        const deviceId = getDeviceId();
        
        const res = await axios.post(`${AUTH_URL}/token/`, { username, password }, {
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

        CACHE.invalidate();

        return data;
    }

    logout() {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('device_id');
        sessionStorage.removeItem('device_info');
        CACHE.invalidate();
        
        // Call logout API
        try {
            const deviceId = localStorage.getItem('device_id');
            if (deviceId) {
                axios.post(`${AUTH_URL}/logout/`, {}, {
                    headers: {
                        'X-DEVICE-ID': deviceId,
                        'X-PLATFORM': 'WEB',
                    }
                }).catch(() => {});
            }
        } catch (e) {}
        
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
        return this.get('/organization/users/me/');
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
        return this.post('/organization/users/change_my_password/', { password });
    }

    createPunchRecord(data) {
        return this.post('/attendance/punches/', data, { offline: true });
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
        return this.get('/allowance/requests/', { status: 'PENDING', ...params });
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
        return this.get('/organization/roles/', {}, { useCache: true });
    }

    getStates() {
        return this.get('/organization/states/', {}, { useCache: true });
    }

    getBranches(state) {
        return this.get('/organization/branches/', { state }, { useCache: true });
    }

    getAreas(branch) {
        return this.get('/organization/areas/', { branch }, { useCache: true });
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

    getRouteHistory(params = {}) {
        return this.get('/tracking/routes/history/', params);
    }

    getRouteDetail(sessionId) {
        return this.get(`/tracking/routes/detail/${sessionId}/`);
    }

    getDailyRoute(employeeId, params = {}) {
        return this.get(`/tracking/routes/daily/${employeeId}/`, params);
    }

    getCorrectionRequests(params = {}) {
        return this.get('/attendance/correction-requests/', params);
    }

    getMyCorrectionRequests() {
        return this.get('/attendance/correction-requests/my_requests/');
    }

    getPendingCorrections() {
        return this.get('/attendance/correction-requests/pending/');
    }

    createCorrectionRequest(data) {
        return this.post('/attendance/correction-requests/', data);
    }

    reviewCorrection(correctionId, action, comment = '') {
        return this.post(`/attendance/correction-requests/${correctionId}/review/`, { action, comment });
    }

    getCorrectionSettings() {
        return this.get('/attendance/correction-settings/', {}, { useCache: true });
    }

    updateCorrectionSettings(data) {
        return this.patch('/attendance/correction-settings/', data);
    }

    getApprovalHierarchies() {
        return this.get('/organization/approval-hierarchies/');
    }

    getApprovalHierarchiesByType(requestType) {
        return this.get('/organization/approval-hierarchies/by_type/', { type: requestType });
    }

    createApprovalHierarchy(data) {
        return this.post('/organization/approval-hierarchies/', data);
    }

    updateApprovalHierarchy(id, data) {
        return this.patch(`/organization/approval-hierarchies/${id}/`, data);
    }

    deleteApprovalHierarchy(id) {
        return this.delete(`/organization/approval-hierarchies/${id}/`);
    }

    getApprovalRoutes(params = {}) {
        return this.get('/organization/approval-routes/', params);
    }

    getPendingApprovalRoutes() {
        return this.get('/organization/approval-routes/pending/');
    }

    processApprovalRoute(routeId, action, comments = '') {
        return this.post(`/organization/approval-routes/${routeId}/process/`, { action, comments });
    }

    getNotifications(params = {}) {
        return this.get('/organization/notifications/', params);
    }

    getUnreadNotificationCount() {
        return this.get('/organization/notifications/unread_count/');
    }

    markNotificationRead(id) {
        return this.post(`/organization/notifications/${id}/mark_read/`);
    }

    markAllNotificationsRead() {
        return this.post('/organization/notifications/mark_all_read/');
    }

    clearReadNotifications() {
        return this.delete('/organization/notifications/clear_all/');
    }

    getFeatures() {
        return this.get('/organization/features/', {}, { useCache: true });
    }

    getRoleFeatures(roleId) {
        return this.get('/organization/role-features/', { role: roleId });
    }

    getRoleFeaturesByRole(roleId) {
        return this.get('/organization/role-features/by_role/', { role_id: roleId });
    }

    toggleRoleFeature(roleId, featureId, isEnabled) {
        return this.post('/organization/role-features/toggle/', {
            role_id: roleId,
            feature_id: featureId,
            is_enabled: isEnabled
        });
    }

    bulkUpdateRoleFeatures(roleId, featureIds) {
        return this.post('/organization/role-features/bulk_update/', {
            role: roleId,
            features: featureIds
        });
    }

    getUserFeaturesByUser(userId) {
        return this.get('/organization/user-features/by_user/', { user_id: userId });
    }

    getUserFeaturesByRole(roleId) {
        return this.get('/organization/user-features/by_role/', { role_id: roleId });
    }

    toggleUserFeature(userId, featureId, isEnabled) {
        return this.post('/organization/user-features/toggle/', {
            user_id: userId,
            feature_id: featureId,
            is_enabled: isEnabled
        });
    }

    bulkUpdateUserFeatures(userId, featureIds) {
        return this.post('/organization/user-features/bulk_update/', {
            user: userId,
            features: featureIds
        });
    }

    // Session Management - One User One Device
    getMySessions() {
        return this.get('/organization/sessions/my_sessions/');
    }

    getActiveSession() {
        return this.get('/organization/sessions/active_session/');
    }

    getAllSessions(params = {}) {
        return this.get('/organization/sessions/', params);
    }

    terminateSession(sessionId) {
        return this.post(`/organization/sessions/${sessionId}/terminate/`);
    }

    terminateAllUserSessions(userId) {
        return this.post('/organization/sessions/terminate_all/', { user_id: userId });
    }

    logoutCurrentSession() {
        return this.post('/organization/sessions/logout_current/');
    }

    logoutApi() {
        return this.post('/auth/logout/');
    }

    // Address Autocomplete
    getAddressSuggestions(query, limit = 5) {
        return this.get('/attendance/address/suggestions/', { q: query, limit });
    }

    getAddressDetails(placeId) {
        return this.get(`/attendance/address/details/${placeId}/`);
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        const api = ScalableAPI.getInstance();
        api.processOfflineQueue();
    });
}

export default ScalableAPI.getInstance();
