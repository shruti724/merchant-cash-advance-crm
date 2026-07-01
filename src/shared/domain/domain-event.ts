export interface DomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly tenantId: string;
  readonly aggregateId: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  abstract readonly eventName: string;

  protected constructor(
    public readonly tenantId: string,
    public readonly aggregateId: string,
  ) {}
}
