import { api } from './api-client';
import { AuthResponse } from '@/types';

export const authApi = {
  login: (tenantSlug: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { tenantSlug, email, password }, { auth: false }),

  register: (payload: {
    tenantSlug: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', payload, { auth: false }),
};
