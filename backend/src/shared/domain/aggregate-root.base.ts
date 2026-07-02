import { Entity } from './entity.base';
import { DomainEvent } from './domain-event';

/**
 * AggregateRoot — the only entity type a repository is allowed to load or
 * persist directly. Collects domain events raised during business
 * operations; the events are dispatched by the repository/use-case layer
 * *after* the transaction commits, keeping the domain model persistence
 * ignorant (no framework/event-bus dependency inside entities).
 */
export abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
