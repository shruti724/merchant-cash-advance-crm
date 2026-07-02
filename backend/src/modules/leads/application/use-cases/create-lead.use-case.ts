import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Lead } from '../../domain/lead.entity';
import { LEAD_REPOSITORY, LeadRepository } from '../ports/lead.repository.port';
import { DomainEventBus } from '../../../../shared/infrastructure/event-bus/domain-event-bus';
import { CreateLeadDto } from '../../dto/create-lead.dto';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: LeadRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(actor: RequestActor, dto: CreateLeadDto): Promise<Lead> {
    const result = Lead.create(
      {
        tenantId: actor.tenantId,
        ownerId: actor.userId,
        businessName: dto.businessName,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
      },
      uuid(),
    );

    if (result.isSuccess === false) throw new BadRequestException(result.error);

    const lead = result.value;
    await this.repo.save(lead);
    this.eventBus.publishAll(lead.domainEvents);
    lead.clearEvents();

    return lead;
  }
}
