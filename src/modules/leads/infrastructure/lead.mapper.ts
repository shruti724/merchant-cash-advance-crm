import { Lead as PrismaLead } from '@prisma/client';
import { Lead } from '../domain/lead.entity';
import { LeadStatus } from '../domain/lead-status.enum';

/** Mapper — translates between the Prisma persistence model and the domain aggregate (anti-corruption layer). */
export class LeadMapper {
  static toDomain(record: PrismaLead): Lead {
    return Lead.reconstitute(
      {
        tenantId: record.tenantId,
        ownerId: record.ownerId,
        businessName: record.businessName,
        contactName: record.contactName,
        email: record.email,
        phone: record.phone,
        status: record.status as unknown as LeadStatus,
        source: record.source,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      record.id,
    );
  }

  static toPersistence(lead: Lead) {
    const props = lead.toProps();
    return {
      id: lead.id,
      tenantId: props.tenantId,
      ownerId: props.ownerId,
      businessName: props.businessName,
      contactName: props.contactName,
      email: props.email,
      phone: props.phone,
      status: props.status as any,
      source: props.source,
    };
  }
}
