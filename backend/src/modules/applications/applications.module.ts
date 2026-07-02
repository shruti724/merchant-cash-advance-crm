import { Module } from '@nestjs/common';
import { ApplicationController } from './infrastructure/application.controller';
import { PrismaApplicationRepository } from './infrastructure/prisma-application.repository';
import { APPLICATION_REPOSITORY } from './application/ports/application.repository.port';
import { CreateApplicationFromLeadUseCase } from './application/use-cases/create-application-from-lead.use-case';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { TransitionApplicationUseCase } from './application/use-cases/transition-application.use-case';
import { DecideApplicationUseCase } from './application/use-cases/decide-application.use-case';
import { ListApplicationsUseCase } from './application/use-cases/list-applications.use-case';
import { GetApplicationUseCase } from './application/use-cases/get-application.use-case';
import { LeadConvertedListener } from './infrastructure/listeners/lead-converted.listener';

@Module({
  controllers: [ApplicationController],
  providers: [
    { provide: APPLICATION_REPOSITORY, useClass: PrismaApplicationRepository },
    CreateApplicationFromLeadUseCase,
    UploadDocumentUseCase,
    TransitionApplicationUseCase,
    DecideApplicationUseCase,
    ListApplicationsUseCase,
    GetApplicationUseCase,
    LeadConvertedListener,
  ],
})
export class ApplicationsModule {}
