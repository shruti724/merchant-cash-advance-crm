import { AggregateRoot } from '../../../shared/domain/aggregate-root.base';
import { Result } from '../../../shared/domain/result';
import { LeadStatus, LEAD_TRANSITIONS } from './lead-status.enum';
import { LeadCreatedEvent } from './events/lead-created.event';
import { LeadStatusChangedEvent } from './events/lead-status-changed.event';
import { LeadConvertedEvent } from './events/lead-converted.event';

export interface LeadProps {
  tenantId: string;
  ownerId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadProps {
  tenantId: string;
  ownerId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  source?: string;
}

/**
 * Lead — aggregate root encapsulating the sales-pipeline lifecycle.
 * All state mutation goes through domain methods (never direct property
 * assignment from outside), so invariants like "only forward transitions
 * allowed" cannot be bypassed by the application layer.
 */
export class Lead extends AggregateRoot<LeadProps> {
  private constructor(props: LeadProps, id: string) {
    super(props, id);
  }

  static create(props: CreateLeadProps, id: string): Result<Lead> {
    if (!props.businessName?.trim()) return Result.fail('businessName is required');
    if (!/^\S+@\S+\.\S+$/.test(props.email)) return Result.fail('email is invalid');

    const now = new Date();
    const lead = new Lead(
      {
        tenantId: props.tenantId,
        ownerId: props.ownerId,
        businessName: props.businessName,
        contactName: props.contactName,
        email: props.email,
        phone: props.phone,
        status: LeadStatus.NEW,
        source: props.source ?? null,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );

    lead.addDomainEvent(
      new LeadCreatedEvent(props.tenantId, id, props.businessName, props.ownerId),
    );

    return Result.ok(lead);
  }

  static reconstitute(props: LeadProps, id: string): Lead {
    return new Lead(props, id);
  }

  get status(): LeadStatus {
    return this.props.status;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get businessName(): string {
    return this.props.businessName;
  }

  /**
   * transitionTo — the only sanctioned way to change status. Validates
   * against the LEAD_TRANSITIONS state machine and raises the appropriate
   * domain event(s), including a specialized LeadConvertedEvent that other
   * bounded contexts (Applications) react to.
   */
  transitionTo(target: LeadStatus, changedById: string): Result<void> {
    const allowed = LEAD_TRANSITIONS[this.props.status];
    if (!allowed.includes(target)) {
      return Result.fail(
        `Cannot transition lead from ${this.props.status} to ${target}`,
      );
    }

    const from = this.props.status;
    this.props.status = target;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new LeadStatusChangedEvent(this.props.tenantId, this.id, from, target, changedById),
    );

    if (target === LeadStatus.CONVERTED) {
      this.addDomainEvent(
        new LeadConvertedEvent(this.props.tenantId, this.id, this.props.ownerId),
      );
    }

    return Result.ok();
  }

  toProps(): Readonly<LeadProps> {
    return { ...this.props };
  }
}
