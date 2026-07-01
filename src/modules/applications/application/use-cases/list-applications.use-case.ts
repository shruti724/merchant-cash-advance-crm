import { Inject, Injectable } from '@nestjs/common';
import {
  APPLICATION_REPOSITORY,
  ApplicationListFilter,
  ApplicationRepository,
} from '../ports/application.repository.port';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

@Injectable()
export class ListApplicationsUseCase {
  constructor(@Inject(APPLICATION_REPOSITORY) private readonly repo: ApplicationRepository) {}

  execute(actor: RequestActor, filter: ApplicationListFilter) {
    return this.repo.findMany(actor.tenantId, filter);
  }
}
