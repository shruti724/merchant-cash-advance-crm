import { ApplicationStatus } from '../application-status.enum';
import { Result } from '../../../../shared/domain/result';

export interface TransitionContext {
  actorId: string;
  actorRoles: string[];
  reason?: string;
}

/**
 * TransitionStrategy — Strategy pattern.
 *
 * The base state machine (APPLICATION_TRANSITIONS) only encodes *which*
 * transitions are graph-legal. Each transition target additionally has a
 * strategy encoding the *business precondition* for making that jump
 * (e.g. "can't enter review without documents"). Adding a new precondition
 * for a status means adding/editing one strategy class — the Application
 * aggregate and every existing strategy stay untouched (Open/Closed).
 */
export interface TransitionStrategy {
  readonly target: ApplicationStatus;
  validate(props: { documentCount: number; requestedAmount: number }, ctx: TransitionContext): Result<void>;
}
