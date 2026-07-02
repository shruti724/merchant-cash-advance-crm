import { BaseDomainEvent } from '../../../../shared/domain/domain-event';

/**
 * Published when a Lead transitions to CONVERTED. The Applications module
 * listens for this to auto-create a draft Application — a cross-aggregate
 * side effect handled entirely through events, so Leads and Applications
 * stay decoupled (no direct dependency between the two modules).
 */
export class LeadConvertedEvent extends BaseDomainEvent {
  readonly eventName = 'lead.converted';

  constructor(
    tenantId: string,
    aggregateId: string,
    public readonly ownerId: string,
  ) {
    super(tenantId, aggregateId);
  }
}
