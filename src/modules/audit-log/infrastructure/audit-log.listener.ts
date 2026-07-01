import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { DomainEvent } from '../../../shared/domain/domain-event';

/**
 * AuditLogListener — Observer pattern, wildcard subscriber.
 *
 * Subscribes to every domain event ('**') and persists a normalized audit
 * row. This is deliberately the *only* place that writes to AuditLog —
 * use cases never do it directly — so the audit trail is guaranteed
 * complete for anything that goes through the DomainEventBus, and adding
 * a new event type anywhere in the system is automatically audited with
 * zero extra code (Open/Closed Principle).
 */
@Injectable()
export class AuditLogListener {
  private readonly logger = new Logger(AuditLogListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('**')
  async handle(event: DomainEvent) {
    if (!event?.eventName || !event?.tenantId) return;

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: event.tenantId,
          eventName: event.eventName,
          entityType: event.eventName.split('.')[0],
          entityId: event.aggregateId,
          payload: JSON.parse(JSON.stringify(event)),
        },
      });
    } catch (err) {
      // Audit logging must never break the primary business transaction —
      // log and swallow rather than propagate.
      this.logger.error(`Failed to persist audit log for ${event.eventName}`, err as Error);
    }
  }
}
