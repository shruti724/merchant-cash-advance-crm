import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../common/constants/permissions';
import { RequestActor } from '../../../shared/context/tenant-context.service';
import { ApplicationStatus } from '../domain/application-status.enum';
import { DecideApplicationDto } from '../dto/decide-application.dto';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { ListApplicationsUseCase } from '../application/use-cases/list-applications.use-case';
import { GetApplicationUseCase } from '../application/use-cases/get-application.use-case';
import { TransitionApplicationUseCase } from '../application/use-cases/transition-application.use-case';
import { DecideApplicationUseCase } from '../application/use-cases/decide-application.use-case';
import { UploadDocumentUseCase } from '../application/use-cases/upload-document.use-case';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly listApplications: ListApplicationsUseCase,
    private readonly getApplication: GetApplicationUseCase,
    private readonly transitionApplication: TransitionApplicationUseCase,
    private readonly decideApplication: DecideApplicationUseCase,
    private readonly uploadDocument: UploadDocumentUseCase,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.APPLICATION_READ)
  @ApiOperation({ summary: 'List applications for the current tenant' })
  async list(
    @CurrentUser() actor: RequestActor,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const { items, total } = await this.listApplications.execute(actor, {
      status,
      page: Number(page),
      pageSize: Number(pageSize),
    });
    return { items: items.map((a) => a.toProps()), total, page: Number(page), pageSize: Number(pageSize) };
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.APPLICATION_READ)
  @ApiOperation({ summary: 'Get a single application, including its workflow status' })
  async getOne(@CurrentUser() actor: RequestActor, @Param('id', ParseUUIDPipe) id: string) {
    const app = await this.getApplication.execute(actor, id);
    return app.toProps();
  }

  @Post(':id/documents')
  @RequirePermissions(PERMISSIONS.APPLICATION_TRANSITION)
  @ApiOperation({ summary: 'Attach a document reference to an application (storage upload happens client-side/pre-signed)' })
  async addDocument(
    @CurrentUser() actor: RequestActor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.uploadDocument.execute(actor, id, dto);
  }

  @Patch(':id/submit-for-review')
  @RequirePermissions(PERMISSIONS.APPLICATION_TRANSITION)
  @ApiOperation({ summary: 'Move DOCUMENTS_PENDING -> UNDER_REVIEW (requires >=1 document uploaded)' })
  async submitForReview(@CurrentUser() actor: RequestActor, @Param('id', ParseUUIDPipe) id: string) {
    const app = await this.transitionApplication.execute(actor, id, ApplicationStatus.UNDER_REVIEW);
    return app.toProps();
  }

  @Patch(':id/request-documents')
  @RequirePermissions(PERMISSIONS.APPLICATION_TRANSITION)
  @ApiOperation({ summary: 'Move DRAFT -> DOCUMENTS_PENDING' })
  async requestDocuments(@CurrentUser() actor: RequestActor, @Param('id', ParseUUIDPipe) id: string) {
    const app = await this.transitionApplication.execute(actor, id, ApplicationStatus.DOCUMENTS_PENDING);
    return app.toProps();
  }

  @Patch(':id/cancel')
  @RequirePermissions(PERMISSIONS.APPLICATION_TRANSITION)
  @ApiOperation({ summary: 'Cancel an application from any non-terminal state' })
  async cancel(@CurrentUser() actor: RequestActor, @Param('id', ParseUUIDPipe) id: string) {
    const app = await this.transitionApplication.execute(actor, id, ApplicationStatus.CANCELLED);
    return app.toProps();
  }

  @Patch(':id/decision')
  @RequirePermissions(PERMISSIONS.APPLICATION_DECIDE)
  @ApiOperation({ summary: 'Underwriter decision: APPROVED or DECLINED (role-enforced by the transition strategy)' })
  async decide(
    @CurrentUser() actor: RequestActor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideApplicationDto,
  ) {
    const app = await this.decideApplication.execute(actor, id, dto.decision, dto.reason);
    return app.toProps();
  }
}
