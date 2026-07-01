import { BaseDomainEvent } from '../../../../shared/domain/domain-event';
import { LeadStatus } from '../lead-status.enum';

export class LeadStatusChangedEvent extends BaseDomainEvent {
  readonly eventName = 'lead.status_changed';

  constructor(
    tenantId: string,
    aggregateId: string,
    public readonly fromStatus: LeadStatus,
    public readonly toStatus: LeadStatus,
    public readonly changedById: string,
  ) {
    super(tenantId, aggregateId);
  }
}
