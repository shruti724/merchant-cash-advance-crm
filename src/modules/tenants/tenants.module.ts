import { Module } from '@nestjs/common';
import { TenantController } from './infrastructure/tenant.controller';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';

@Module({
  controllers: [TenantController],
  providers: [CreateTenantUseCase],
})
export class TenantsModule {}
