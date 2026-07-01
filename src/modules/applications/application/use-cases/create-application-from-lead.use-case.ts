import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Application } from '../../domain/application.entity';
import { APPLICATION_REPOSITORY, ApplicationRepository } from '../ports/application.repository.port';
import { DomainEventBus } from '../../../../shared/infrastructure/event-bus/domain-event-bus';

/**
 * CreateApplicationFromLeadUseCase — Factory pattern, invoked by the
 * LeadConvertedListener when a Lead crosses into CONVERTED. Kept as its
 * own use case (rather than inline in the listener) so it stays testable
 * and reusable outside the event-driven trigger path (e.g. an admin
 * "create application manually" endpoint could call the same use case).
 */
@Injectable()
export class CreateApplicationFromLeadUseCase {
  private readonly logger = new Logger(CreateApplicationFromLeadUseCase.name);

  constructor(
    @Inject(APPLICATION_REPOSITORY) private readonly repo: ApplicationRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(tenantId: string, leadId: string, requestedAmount: number) {
    const existing = await this.repo.findByLeadId(tenantId, leadId);
    if (existing) {
      this.logger.warn(`Application already exists for lead ${leadId}, skipping creation`);
      return existing;
    }

    const result = Application.create({ tenantId, leadId, requestedAmount }, uuid());
    if (result.isSuccess === false) {
      this.logger.error(`Failed to create application for lead ${leadId}: ${result.error}`);
      return null;
    }

    const app = result.value;
    await this.repo.save(app);
    this.eventBus.publishAll(app.domainEvents);
    app.clearEvents();
    return app;
  }
}
