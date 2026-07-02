import { api } from './api-client';
import { Application, Paginated } from '@/types';

export const applicationsApi = {
  list: (params: { status?: string; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    qs.set('page', String(params.page ?? 1));
    qs.set('pageSize', String(params.pageSize ?? 20));
    return api.get<Paginated<Application>>(`/applications?${qs.toString()}`);
  },
  get: (id: string) => api.get<Application>(`/applications/${id}`),
  requestDocuments: (id: string) => api.patch<Application>(`/applications/${id}/request-documents`),
  addDocument: (id: string, payload: { type: string; fileName: string; storageKey: string }) =>
    api.post(`/applications/${id}/documents`, payload),
  submitForReview: (id: string) => api.patch<Application>(`/applications/${id}/submit-for-review`),
  decide: (id: string, decision: 'APPROVED' | 'DECLINED', reason?: string) =>
    api.patch<Application>(`/applications/${id}/decision`, { decision, reason }),
  cancel: (id: string) => api.patch<Application>(`/applications/${id}/cancel`),
};
