import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LEAD_REPOSITORY, LeadRepository } from '../ports/lead.repository.port';
import { DomainEventBus } from '../../../../shared/infrastructure/event-bus/domain-event-bus';
import { LeadStatus } from '../../domain/lead-status.enum';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

@Injectable()
export class UpdateLeadStatusUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: LeadRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(actor: RequestActor, id: string, status: LeadStatus) {
    const lead = await this.repo.findById(actor.tenantId, id);
    if (!lead) throw new NotFoundException('Lead not found');

    const result = lead.transitionTo(status, actor.userId);
    if (result.isSuccess === false) throw new BadRequestException(result.error);

    await this.repo.save(lead);
    this.eventBus.publishAll(lead.domainEvents);
    lead.clearEvents();

    return lead;
  }
}
