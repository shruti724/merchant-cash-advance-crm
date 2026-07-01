import { Lead } from '../../domain/lead.entity';

export interface LeadListFilter {
  status?: string;
  page: number;
  pageSize: number;
}

/**
 * LeadRepositoryPort — the application layer depends on this abstraction,
 * never on Prisma directly (Dependency Inversion Principle). The concrete
 * PrismaLeadRepository is bound to this token in LeadsModule, so swapping
 * persistence tech later touches only the infrastructure folder.
 */
export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');

export interface LeadRepository {
  save(lead: Lead): Promise<void>;
  findById(tenantId: string, id: string): Promise<Lead | null>;
  findMany(tenantId: string, filter: LeadListFilter): Promise<{ items: Lead[]; total: number }>;
}
