import { Application } from '../../domain/application.entity';

export const APPLICATION_REPOSITORY = Symbol('APPLICATION_REPOSITORY');

export interface ApplicationListFilter {
  status?: string;
  page: number;
  pageSize: number;
}

export interface ApplicationRepository {
  save(application: Application): Promise<void>;
  findById(tenantId: string, id: string): Promise<Application | null>;
  findByLeadId(tenantId: string, leadId: string): Promise<Application | null>;
  findMany(
    tenantId: string,
    filter: ApplicationListFilter,
  ): Promise<{ items: Application[]; total: number }>;
}
