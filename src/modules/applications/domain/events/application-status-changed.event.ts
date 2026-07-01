import { BaseDomainEvent } from '../../../../shared/domain/domain-event';
import { ApplicationStatus } from '../application-status.enum';

export class ApplicationStatusChangedEvent extends BaseDomainEvent {
  readonly eventName = 'application.status_changed';
  constructor(
    tenantId: string,
    aggregateId: string,
    public readonly fromStatus: ApplicationStatus,
    public readonly toStatus: ApplicationStatus,
    public readonly changedById: string,
    public readonly reason?: string,
  ) {
    super(tenantId, aggregateId);
  }
}
