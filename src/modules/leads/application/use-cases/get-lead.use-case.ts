import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LEAD_REPOSITORY, LeadRepository } from '../ports/lead.repository.port';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

@Injectable()
export class GetLeadUseCase {
  constructor(@Inject(LEAD_REPOSITORY) private readonly repo: LeadRepository) {}

  async execute(actor: RequestActor, id: string) {
    const lead = await this.repo.findById(actor.tenantId, id);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }
}
