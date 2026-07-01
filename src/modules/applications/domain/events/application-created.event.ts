import { BaseDomainEvent } from '../../../../shared/domain/domain-event';

export class ApplicationCreatedEvent extends BaseDomainEvent {
  readonly eventName = 'application.created';
  constructor(tenantId: string, aggregateId: string, public readonly leadId: string) {
    super(tenantId, aggregateId);
  }
}
