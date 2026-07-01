import { Application as PrismaApplication } from '@prisma/client';
import { Application } from '../domain/application.entity';
import { ApplicationStatus } from '../domain/application-status.enum';

export class ApplicationMapper {
  static toDomain(record: PrismaApplication & { documents?: unknown[] }, documentCount: number): Application {
    return Application.reconstitute(
      {
        tenantId: record.tenantId,
        leadId: record.leadId,
        reviewerId: record.reviewerId,
        status: record.status as unknown as ApplicationStatus,
        requestedAmount: Number(record.requestedAmount),
        currency: record.currency,
        documentCount,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      record.id,
    );
  }

  static toPersistence(app: Application) {
    const props = app.toProps();
    return {
      id: app.id,
      tenantId: props.tenantId,
      leadId: props.leadId,
      reviewerId: props.reviewerId,
      status: props.status as any,
      requestedAmount: props.requestedAmount,
      currency: props.currency,
    };
  }
}
