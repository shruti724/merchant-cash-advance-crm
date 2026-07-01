import { Module } from '@nestjs/common';
import { AuditLogListener } from './infrastructure/audit-log.listener';
import { AuditLogController } from './infrastructure/audit-log.controller';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogListener],
})
export class AuditLogModule {}
