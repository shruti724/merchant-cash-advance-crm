import { ApplicationStatus } from '../application-status.enum';
import { Result } from '../../../../shared/domain/result';
import { TransitionContext, TransitionStrategy } from './transition-strategy.interface';

class ToDocumentsPendingStrategy implements TransitionStrategy {
  readonly target = ApplicationStatus.DOCUMENTS_PENDING;
  validate(): Result<void> {
    return Result.ok();
  }
}

class ToUnderReviewStrategy implements TransitionStrategy {
  readonly target = ApplicationStatus.UNDER_REVIEW;
  validate(props: { documentCount: number }): Result<void> {
    if (props.documentCount < 1) {
      return Result.fail('At least one document must be uploaded before review can start');
    }
    return Result.ok();
  }
}

class ToApprovedStrategy implements TransitionStrategy {
  readonly target = ApplicationStatus.APPROVED;
  validate(_props: unknown, ctx: TransitionContext): Result<void> {
    if (!ctx.actorRoles.includes('UNDERWRITER') && !ctx.actorRoles.includes('TENANT_ADMIN')) {
      return Result.fail('Only an underwriter can approve an application');
    }
    return Result.ok();
  }
}

class ToDeclinedStrategy implements TransitionStrategy {
  readonly target = ApplicationStatus.DECLINED;
  validate(_props: unknown, ctx: TransitionContext): Result<void> {
    if (!ctx.actorRoles.includes('UNDERWRITER') && !ctx.actorRoles.includes('TENANT_ADMIN')) {
      return Result.fail('Only an underwriter can decline an application');
    }
    if (!ctx.reason?.trim()) {
      return Result.fail('A reason is required to decline an application');
    }
    return Result.ok();
  }
}

class ToCancelledStrategy implements TransitionStrategy {
  readonly target = ApplicationStatus.CANCELLED;
  validate(): Result<void> {
    return Result.ok();
  }
}

/**
 * TransitionStrategyRegistry — simple Factory/Registry that resolves the
 * correct strategy for a target status. Deliberately framework-agnostic
 * (no NestJS DI) since it's invoked from inside the domain entity, which
 * must stay free of infrastructure concerns.
 */
export class TransitionStrategyRegistry {
  private static readonly strategies = new Map<ApplicationStatus, TransitionStrategy>([
    [ApplicationStatus.DOCUMENTS_PENDING, new ToDocumentsPendingStrategy()],
    [ApplicationStatus.UNDER_REVIEW, new ToUnderReviewStrategy()],
    [ApplicationStatus.APPROVED, new ToApprovedStrategy()],
    [ApplicationStatus.DECLINED, new ToDeclinedStrategy()],
    [ApplicationStatus.CANCELLED, new ToCancelledStrategy()],
  ]);

  static resolve(target: ApplicationStatus): TransitionStrategy {
    const strategy = this.strategies.get(target);
    if (!strategy) throw new Error(`No transition strategy registered for ${target}`);
    return strategy;
  }
}
