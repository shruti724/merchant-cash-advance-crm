import { AggregateRoot } from '../../../shared/domain/aggregate-root.base';
import { Result } from '../../../shared/domain/result';
import { ApplicationStatus, APPLICATION_TRANSITIONS } from './application-status.enum';
import { TransitionStrategyRegistry } from './strategies/transition-strategies';
import { TransitionContext } from './strategies/transition-strategy.interface';
import { ApplicationCreatedEvent } from './events/application-created.event';
import { ApplicationStatusChangedEvent } from './events/application-status-changed.event';

export interface ApplicationProps {
  tenantId: string;
  leadId: string;
  reviewerId: string | null;
  status: ApplicationStatus;
  requestedAmount: number;
  currency: string;
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationProps {
  tenantId: string;
  leadId: string;
  requestedAmount: number;
  currency?: string;
}

/**
 * Application — aggregate root modeling the deal/funding workflow.
 * Combines two complementary patterns:
 *  1. A declarative state-machine graph (APPLICATION_TRANSITIONS) for
 *     structural legality of a transition.
 *  2. The Strategy pattern (TransitionStrategyRegistry) for the business
 *     preconditions of *entering* a given status.
 * Neither concern leaks into the use-case layer, which only ever calls
 * `application.transitionTo(...)`.
 */
export class Application extends AggregateRoot<ApplicationProps> {
  private constructor(props: ApplicationProps, id: string) {
    super(props, id);
  }

  static create(props: CreateApplicationProps, id: string): Result<Application> {
    if (props.requestedAmount <= 0) {
      return Result.fail('requestedAmount must be greater than zero');
    }
    const now = new Date();
    const app = new Application(
      {
        tenantId: props.tenantId,
        leadId: props.leadId,
        reviewerId: null,
        status: ApplicationStatus.DRAFT,
        requestedAmount: props.requestedAmount,
        currency: props.currency ?? 'USD',
        documentCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
    app.addDomainEvent(new ApplicationCreatedEvent(props.tenantId, id, props.leadId));
    return Result.ok(app);
  }

  static reconstitute(props: ApplicationProps, id: string): Application {
    return new Application(props, id);
  }

  get status() { return this.props.status; }
  get tenantId() { return this.props.tenantId; }
  get leadId() { return this.props.leadId; }
  get reviewerId() { return this.props.reviewerId; }
  get documentCount() { return this.props.documentCount; }

  registerDocumentUploaded(): void {
    this.props.documentCount += 1;
    this.props.updatedAt = new Date();
  }

  assignReviewer(reviewerId: string): void {
    this.props.reviewerId = reviewerId;
    this.props.updatedAt = new Date();
  }

  transitionTo(target: ApplicationStatus, ctx: TransitionContext): Result<void> {
    const allowed = APPLICATION_TRANSITIONS[this.props.status];
    if (!allowed.includes(target)) {
      return Result.fail(`Cannot transition application from ${this.props.status} to ${target}`);
    }

    const strategy = TransitionStrategyRegistry.resolve(target);
    const validation = strategy.validate(
      { documentCount: this.props.documentCount, requestedAmount: this.props.requestedAmount },
      ctx,
    );
    if (validation.isSuccess === false) return validation;

    const from = this.props.status;
    this.props.status = target;
    this.props.updatedAt = new Date();

    if (target === ApplicationStatus.UNDER_REVIEW) {
      this.props.reviewerId = ctx.actorId;
    }

    this.addDomainEvent(
      new ApplicationStatusChangedEvent(this.props.tenantId, this.id, from, target, ctx.actorId, ctx.reason),
    );

    return Result.ok();
  }

  toProps(): Readonly<ApplicationProps> {
    return { ...this.props };
  }
}
