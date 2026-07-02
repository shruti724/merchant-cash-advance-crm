import { api } from './api-client';
import { Lead, LeadStatus, Paginated } from '@/types';

export const leadsApi = {
  list: (params: { status?: string; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    qs.set('page', String(params.page ?? 1));
    qs.set('pageSize', String(params.pageSize ?? 20));
    return api.get<Paginated<Lead>>(`/leads?${qs.toString()}`);
  },
  get: (id: string) => api.get<Lead>(`/leads/${id}`),
  create: (payload: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    source?: string;
  }) => api.post<Lead>('/leads', payload),
  updateStatus: (id: string, status: LeadStatus) =>
    api.patch<Lead>(`/leads/${id}/status`, { status }),
};
