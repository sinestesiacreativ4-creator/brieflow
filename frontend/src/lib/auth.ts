import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'AGENCY_ADMIN' | 'AGENCY_MEMBER' | 'CLIENT';
    company?: string;
}

interface Agency {
    id: string;
    name: string;
    subdomain: string;
    logo?: string;
    primaryColor: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    agency: Agency | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string, password: string, isClient?: boolean) => Promise<void>;
    signup: (data: {
        agencyName: string;
        subdomain: string;
        name: string;
        email: string;
        password: string;
    }) => Promise<void>;
    logout: () => void;
    verifyToken: () => Promise<boolean>;
    setLoading: (loading: boolean) => void;
    setAuth: (token: string, user: User, agency: Agency | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            agency: null,
            isAuthenticated: false,
            isLoading: true,

            setAuth: (token, user, agency) => {
                localStorage.setItem('token', token);
                set({
                    token,
                    user,
                    agency,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            login: async (email: string, password: string, isClient = false) => {
                try {
                    const endpoint = isClient ? '/auth/client/login' : '/auth/login';
                    const response = await api.post(endpoint, { email, password });
                    const { token, user, agency } = response.data;

                    localStorage.setItem('token', token);

                    set({
                        token,
                        user,
                        agency,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
                }
            },

            signup: async (data) => {
                try {
                    const response = await api.post('/auth/signup', data);
                    const { token, user, agency } = response.data;

                    localStorage.setItem('token', token);

                    set({
                        token,
                        user,
                        agency,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    throw new Error(error.response?.data?.error || 'Error al crear la cuenta');
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({
                    token: null,
                    user: null,
                    agency: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            verifyToken: async () => {
                const token = localStorage.getItem('token');

                if (!token) {
                    set({ isLoading: false, isAuthenticated: false });
                    return false;
                }

                try {
                    const response = await api.get('/auth/verify');

                    if (response.data.valid) {
                        set({
                            token,
                            user: response.data.user,
                            agency: response.data.agency,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                        return true;
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                }

                set({ isLoading: false, isAuthenticated: false });
                return false;
            },

            setLoading: (loading: boolean) => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                agency: state.agency,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
