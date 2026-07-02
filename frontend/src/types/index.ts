export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'DISQUALIFIED';

export type ApplicationStatus =
  | 'DRAFT'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'CANCELLED';

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  leadId: string;
  reviewerId: string | null;
  status: ApplicationStatus;
  requestedAmount: number;
  currency: string;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogEntry {
  id: string;
  eventName: string;
  entityType: string;
  entityId: string;
  payload: unknown;
  occurredAt: string;
}
