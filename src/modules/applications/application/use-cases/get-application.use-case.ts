import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { APPLICATION_REPOSITORY, ApplicationRepository } from '../ports/application.repository.port';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

@Injectable()
export class GetApplicationUseCase {
  constructor(@Inject(APPLICATION_REPOSITORY) private readonly repo: ApplicationRepository) {}

  async execute(actor: RequestActor, id: string) {
    const app = await this.repo.findById(actor.tenantId, id);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }
}
