import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RequestActor } from '../../../shared/context/tenant-context.service';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@ApiTags('audit-log')
@ApiBearerAuth()
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'View the tenant-scoped audit trail (admin only)' })
  async list(
    @CurrentUser() actor: RequestActor,
    @Query('entityType') entityType?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '50',
  ) {
    const where = { tenantId: actor.tenantId, ...(entityType ? { entityType } : {}) };
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page: Number(page), pageSize: Number(pageSize) };
  }
}
