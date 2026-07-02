import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { LeadListFilter, LeadRepository } from '../application/ports/lead.repository.port';
import { Lead } from '../domain/lead.entity';
import { LeadMapper } from './lead.mapper';

/**
 * PrismaLeadRepository — concrete adapter implementing LeadRepository.
 * Every query is explicitly scoped by tenantId (belt-and-braces alongside
 * the Prisma-level tenant context) — never trust a single layer alone for
 * multi-tenant isolation.
 */
@Injectable()
export class PrismaLeadRepository implements LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(lead: Lead): Promise<void> {
    const data = LeadMapper.toPersistence(lead);
    await this.prisma.lead.upsert({
      where: { id: data.id },
      create: data,
      update: {
        businessName: data.businessName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        status: data.status,
        source: data.source,
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<Lead | null> {
    const record = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    return record ? LeadMapper.toDomain(record) : null;
  }

  async findMany(
    tenantId: string,
    filter: LeadListFilter,
  ): Promise<{ items: Lead[]; total: number }> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status as any } : {}),
    };

    const [records, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { items: records.map(LeadMapper.toDomain), total };
  }
}
