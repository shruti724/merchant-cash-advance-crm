import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequestActor } from '../../../shared/context/tenant-context.service';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'List users within the current tenant (admin only)' })
  async list(@CurrentUser() actor: RequestActor) {
    const users = await this.prisma.user.findMany({
      where: { tenantId: actor.tenantId },
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      isActive: u.isActive,
      roles: u.roles.map((r) => r.role.name),
    }));
  }

  @Get(':id')
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Get a user within the current tenant (admin only)' })
  async getOne(@CurrentUser() actor: RequestActor, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId: actor.tenantId },
      include: { roles: { include: { role: true } } },
    });
    return (
      user && {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles.map((r) => r.role.name),
      }
    );
  }
}
