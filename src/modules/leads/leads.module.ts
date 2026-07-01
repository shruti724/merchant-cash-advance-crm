import { Module } from '@nestjs/common';
import { LeadController } from './infrastructure/lead.controller';
import { PrismaLeadRepository } from './infrastructure/prisma-lead.repository';
import { LEAD_REPOSITORY } from './application/ports/lead.repository.port';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './application/use-cases/list-leads.use-case';
import { GetLeadUseCase } from './application/use-cases/get-lead.use-case';
import { UpdateLeadStatusUseCase } from './application/use-cases/update-lead-status.use-case';

@Module({
  controllers: [LeadController],
  providers: [
    { provide: LEAD_REPOSITORY, useClass: PrismaLeadRepository },
    CreateLeadUseCase,
    ListLeadsUseCase,
    GetLeadUseCase,
    UpdateLeadStatusUseCase,
  ],
  exports: [LEAD_REPOSITORY],
})
export class LeadsModule {}
