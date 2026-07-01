import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { APPLICATION_REPOSITORY, ApplicationRepository } from '../ports/application.repository.port';
import { DomainEventBus } from '../../../../shared/infrastructure/event-bus/domain-event-bus';
import { ApplicationStatus } from '../../domain/application-status.enum';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

/**
 * TransitionApplicationUseCase — generic transition entry point used for
 * simple forward moves (DRAFT -> DOCUMENTS_PENDING -> UNDER_REVIEW,
 * CANCELLED). Terminal decisioning (APPROVED/DECLINED) goes through
 * DecideApplicationUseCase, which additionally records structured
 * status-history for the compliance trail.
 */
@Injectable()
export class TransitionApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY) private readonly repo: ApplicationRepository,
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(actor: RequestActor, id: string, target: ApplicationStatus) {
    const application = await this.repo.findById(actor.tenantId, id);
    if (!application) throw new NotFoundException('Application not found');

    const result = application.transitionTo(target, {
      actorId: actor.userId,
      actorRoles: actor.roles,
    });
    if (result.isSuccess === false) throw new BadRequestException(result.error);

    await this.repo.save(application);
    this.eventBus.publishAll(application.domainEvents);
    application.clearEvents();

    return application;
  }
}
