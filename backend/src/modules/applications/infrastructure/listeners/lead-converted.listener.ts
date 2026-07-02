import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeadConvertedEvent } from '../../../leads/domain/events/lead-converted.event';
import { CreateApplicationFromLeadUseCase } from '../../application/use-cases/create-application-from-lead.use-case';

/**
 * LeadConvertedListener — Observer pattern in action: the Leads module has
 * zero knowledge that Applications exist. When a Lead is marked CONVERTED,
 * this listener (living inside the Applications module) reacts and spins
 * up a draft Application. This is the event-driven analogue of the
 * platform's original "lead -> application" hand-off, without either
 * module depending on the other's internals.
 *
 * Note: the placeholder requested amount below is intentionally a fixed
 * default — the real underwriting/amount-calculation logic is proprietary
 * business logic and out of scope for this portfolio build. In production
 * this would come from a qualification form captured earlier in the funnel.
 */
@Injectable()
export class LeadConvertedListener {
  private readonly logger = new Logger(LeadConvertedListener.name);
  private static readonly PLACEHOLDER_REQUESTED_AMOUNT = 10000;

  constructor(private readonly createApplicationFromLead: CreateApplicationFromLeadUseCase) {}

  @OnEvent('lead.converted')
  async handle(event: LeadConvertedEvent) {
    this.logger.log(`Lead ${event.aggregateId} converted — creating draft application`);
    await this.createApplicationFromLead.execute(
      event.tenantId,
      event.aggregateId,
      LeadConvertedListener.PLACEHOLDER_REQUESTED_AMOUNT,
    );
  }
}
