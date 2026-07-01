import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { APPLICATION_REPOSITORY, ApplicationRepository } from '../ports/application.repository.port';
import { DomainEventBus } from '../../../../shared/infrastructure/event-bus/domain-event-bus';
import { ApplicationStatus } from '../../domain/application-status.enum';
import { RequestActor } from '../../../../shared/context/tenant-context.service';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class DecideApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY) private readonly repo: ApplicationRepository,
    private readonly eventBus: DomainEventBus,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    actor: RequestActor,
    id: string,
    decision: 'APPROVED' | 'DECLINED',
    reason?: string,
  ) {
    const application = await this.repo.findById(actor.tenantId, id);
    if (!application) throw new NotFoundException('Application not found');

    const fromStatus = application.status;
    const target = ApplicationStatus[decision];

    const result = application.transitionTo(target, {
      actorId: actor.userId,
      actorRoles: actor.roles,
      reason,
    });
    if (result.isSuccess === false) throw new BadRequestException(result.error);

    await this.repo.save(application);

    // Structured, queryable audit trail of every decisioning event —
    // complements (does not replace) the generic AuditLog listener.
    await this.prisma.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus,
        toStatus: target,
        reason,
        changedById: actor.userId,
      },
    });

    this.eventBus.publishAll(application.domainEvents);
    application.clearEvents();

    return application;
  }
}
