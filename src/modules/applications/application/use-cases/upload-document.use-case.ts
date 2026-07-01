import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { APPLICATION_REPOSITORY, ApplicationRepository } from '../ports/application.repository.port';
import { RequestActor } from '../../../../shared/context/tenant-context.service';
import { UploadDocumentDto } from '../../dto/upload-document.dto';

/**
 * UploadDocumentUseCase — note the document row itself is written via
 * Prisma directly (Document is a simple child record, not its own
 * aggregate), while the Application aggregate's `documentCount` is
 * updated through its domain method so the UNDER_REVIEW precondition
 * (see ToUnderReviewStrategy) stays accurate without re-querying.
 */
@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY) private readonly repo: ApplicationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actor: RequestActor, applicationId: string, dto: UploadDocumentDto) {
    const application = await this.repo.findById(actor.tenantId, applicationId);
    if (!application) throw new NotFoundException('Application not found');

    const document = await this.prisma.document.create({
      data: {
        applicationId,
        type: dto.type as any,
        fileName: dto.fileName,
        storageKey: dto.storageKey,
      },
    });

    application.registerDocumentUploaded();
    await this.repo.save(application);

    return document;
  }
}
