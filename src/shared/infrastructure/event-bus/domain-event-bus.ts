import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '../../domain/domain-event';

/**
 * DomainEventBus — Observer pattern facade over EventEmitter2.
 *
 * Use cases publish domain events through this port after a successful
 * write; listeners (audit logging, notifications, workflow side-effects)
 * subscribe independently via @OnEvent(...) without the publisher knowing
 * or caring who's listening. This is what keeps AuditLog, notifications,
 * etc. out of the core application logic (Open/Closed Principle — new
 * listeners can be added without touching use cases).
 */
@Injectable()
export class DomainEventBus {
  constructor(private readonly emitter: EventEmitter2) {}

  publish(event: DomainEvent): void {
    this.emitter.emit(event.eventName, event);
  }

  publishAll(events: DomainEvent[]): void {
    events.forEach((e) => this.publish(e));
  }
}
