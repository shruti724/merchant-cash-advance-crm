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
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadStatusDto } from '../dto/update-lead-status.dto';
import { CreateLeadUseCase } from '../application/use-cases/create-lead.use-case';
import { ListLeadsUseCase } from '../application/use-cases/list-leads.use-case';
import { GetLeadUseCase } from '../application/use-cases/get-lead.use-case';
import { UpdateLeadStatusUseCase } from '../application/use-cases/update-lead-status.use-case';

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadController {
  constructor(
    private readonly createLead: CreateLeadUseCase,
    private readonly listLeads: ListLeadsUseCase,
    private readonly getLead: GetLeadUseCase,
    private readonly updateLeadStatus: UpdateLeadStatusUseCase,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS.LEAD_CREATE)
  @ApiOperation({ summary: 'Capture a new lead (tenant + owner inferred from JWT)' })
  async create(@CurrentUser() actor: RequestActor, @Body() dto: CreateLeadDto) {
    const lead = await this.createLead.execute(actor, dto);
    return lead.toProps();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.LEAD_READ)
  @ApiOperation({ summary: 'List leads for the current tenant (paginated, filterable by status)' })
  async list(
    @CurrentUser() actor: RequestActor,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const { items, total } = await this.listLeads.execute(actor, {
      status,
      page: Number(page),
      pageSize: Number(pageSize),
    });
    return {
      items: items.map((l) => l.toProps()),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.LEAD_READ)
  @ApiOperation({ summary: 'Get a single lead by id' })
  async getOne(@CurrentUser() actor: RequestActor, @Param('id', ParseUUIDPipe) id: string) {
    const lead = await this.getLead.execute(actor, id);
    return lead.toProps();
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.LEAD_UPDATE)
  @ApiOperation({ summary: 'Transition a lead\'s status through its sales-pipeline state machine' })
  async updateStatus(
    @CurrentUser() actor: RequestActor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    const lead = await this.updateLeadStatus.execute(actor, id, dto.status);
    return lead.toProps();
  }
}
