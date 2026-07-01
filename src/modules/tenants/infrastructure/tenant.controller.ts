import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { CreateTenantUseCase } from '../application/use-cases/create-tenant.use-case';

/**
 * Platform-level endpoint (SaaS owner layer in the original architecture).
 * NOTE: left @Public() for portfolio demo purposes only — in production
 * this route would sit behind a separate super-admin auth mechanism
 * (e.g. a distinct platform JWT audience or an internal-network-only
 * gateway), never behind a regular tenant-scoped JWT.
 */
@ApiTags('platform')
@Controller('platform/tenants')
export class TenantController {
  constructor(private readonly createTenant: CreateTenantUseCase) {}

  @Public()
  @Post()
  @ApiOperation({ summary: '[Platform admin] Provision a new tenant with default RBAC roles' })
  async create(@Body() dto: CreateTenantDto) {
    return this.createTenant.execute(dto);
  }
}
