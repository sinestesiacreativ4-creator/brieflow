import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const baseURL = isProduction ? 'https://brieflow.onrender.com/api' : 'http://localhost:3001/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API functions
export const projectsApi = {
    getAll: (params?: Record<string, any>) => api.get('/projects', { params }),
    getOne: (id: string) => api.get(`/projects/${id}`),
    create: (data: any) => api.post('/projects', data),
    update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
    delete: (id: string) => api.delete(`/projects/${id}`),
};

export const clientsApi = {
    getAll: (params?: Record<string, any>) => api.get('/clients', { params }),
    getOne: (id: string) => api.get(`/clients/${id}`),
    create: (data: any) => api.post('/clients', data),
    update: (id: string, data: any) => api.patch(`/clients/${id}`, data),
    delete: (id: string) => api.delete(`/clients/${id}`),
};

export const briefsApi = {
    getByProject: (projectId: string) => api.get(`/briefs/project/${projectId}`),
    update: (id: string, data: any) => api.patch(`/briefs/${id}`, data),
    submit: (id: string) => api.post(`/briefs/${id}/submit`),
    approve: (id: string) => api.post(`/briefs/${id}/approve`),
    requestChanges: (id: string, message?: string) => api.post(`/briefs/${id}/request-changes`, { message }),
};

export const teamApi = {
    getAll: () => api.get('/team'),
    invite: (data: any) => api.post('/team/invite', data),
    update: (id: string, data: any) => api.patch(`/team/${id}`, data),
    remove: (id: string) => api.delete(`/team/${id}`),
};

export const dashboardApi = {
    getMetrics: () => api.get('/dashboard/metrics'),
    getStatusDistribution: () => api.get('/dashboard/status-distribution'),
};

export const statsApi = {
    getDashboard: () => api.get('/dashboard/metrics'),
    getStatusDistribution: () => api.get('/dashboard/status-distribution'),
};

export const filesApi = {
    getByProject: (projectId: string) => api.get(`/files/project/${projectId}`),
    upload: (projectId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/files/project/${projectId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    delete: (id: string) => api.delete(`/files/${id}`),
};

export const notificationsApi = {
    getAll: (params?: Record<string, any>) => api.get('/notifications', { params }),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.post('/notifications/mark-all-read'),
};


export const agencyApi = {
    get: () => api.get('/agency'),
    update: (data: any) => api.patch('/agency', data),
};

export const authApi = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/me'),
};

export const contractsApi = {
    generate: (projectId: string, data?: { terms?: string; agencySignature?: string }) =>
        api.post(`/contracts/${projectId}/generate`, data),
    get: (projectId: string) => api.get(`/contracts/${projectId}`),
    sign: (contractId: string, signature: string) =>
        api.post(`/contracts/${contractId}/sign`, { signature }),
    update: (contractId: string, data: { terms?: string; agencySignature?: string }) =>
        api.patch(`/contracts/${contractId}`, data),
};
