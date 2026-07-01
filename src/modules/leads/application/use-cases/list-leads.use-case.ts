import { Inject, Injectable } from '@nestjs/common';
import { LEAD_REPOSITORY, LeadListFilter, LeadRepository } from '../ports/lead.repository.port';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

@Injectable()
export class ListLeadsUseCase {
  constructor(@Inject(LEAD_REPOSITORY) private readonly repo: LeadRepository) {}

  execute(actor: RequestActor, filter: LeadListFilter) {
    return this.repo.findMany(actor.tenantId, filter);
  }
}
