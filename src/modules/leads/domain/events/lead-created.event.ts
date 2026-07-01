import { BaseDomainEvent } from '../../../../shared/domain/domain-event';

export class LeadCreatedEvent extends BaseDomainEvent {
  readonly eventName = 'lead.created';

  constructor(
    tenantId: string,
    aggregateId: string,
    public readonly businessName: string,
    public readonly ownerId: string,
  ) {
    super(tenantId, aggregateId);
  }
}
