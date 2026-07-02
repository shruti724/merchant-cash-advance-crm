import { api } from './api-client';
import { AuditLogEntry, Paginated } from '@/types';

export const auditApi = {
  list: (params: { page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    qs.set('page', String(params.page ?? 1));
    qs.set('pageSize', String(params.pageSize ?? 50));
    return api.get<Paginated<AuditLogEntry>>(`/audit-log?${qs.toString()}`);
  },
};
