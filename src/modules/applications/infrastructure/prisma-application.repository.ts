import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import {
  ApplicationListFilter,
  ApplicationRepository,
} from '../application/ports/application.repository.port';
import { Application } from '../domain/application.entity';
import { ApplicationMapper } from './application.mapper';

/**
 * PrismaApplicationRepository — concrete adapter. `documentCount` is not a
 * persisted column on Application (it's derived from the Document table),
 * so save() and reads keep it in sync via a count query — a deliberate
 * trade-off documented here rather than hidden: a denormalized counter
 * column would be the next optimization if this were a hot path.
 */
@Injectable()
export class PrismaApplicationRepository implements ApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(application: Application): Promise<void> {
    const data = ApplicationMapper.toPersistence(application);
    await this.prisma.application.upsert({
      where: { id: data.id },
      create: data,
      update: {
        reviewerId: data.reviewerId,
        status: data.status,
        requestedAmount: data.requestedAmount,
        currency: data.currency,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Application | null> {
    const record = await this.prisma.application.findFirst({ where: { id, tenantId } });
    if (!record) return null;
    const documentCount = await this.prisma.document.count({ where: { applicationId: id } });
    return ApplicationMapper.toDomain(record, documentCount);
  }

  async findByLeadId(tenantId: string, leadId: string): Promise<Application | null> {
    const record = await this.prisma.application.findFirst({ where: { leadId, tenantId } });
    if (!record) return null;
    const documentCount = await this.prisma.document.count({
      where: { applicationId: record.id },
    });
    return ApplicationMapper.toDomain(record, documentCount);
  }

  async findMany(
    tenantId: string,
    filter: ApplicationListFilter,
  ): Promise<{ items: Application[]; total: number }> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status as any } : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    const items = await Promise.all(
      records.map(async (r) => {
        const documentCount = await this.prisma.document.count({ where: { applicationId: r.id } });
        return ApplicationMapper.toDomain(r, documentCount);
      }),
    );

    return { items, total };
  }
}
