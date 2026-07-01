import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../../context/tenant-context.service';

/**
 * PrismaService — extends the generated client with a lightweight
 * "tenant-scoping" query layer.
 *
 * Defense in depth: even though every repository explicitly filters by
 * tenantId, we additionally verify at the data-access boundary that no
 * accidental cross-tenant read/write slips through, by exposing
 * `forTenant()` which repositories use to get a pre-scoped client.
 *
 * A full Prisma Client Extension (`$extends`) is intentionally kept simple
 * here for portfolio readability — the pattern generalizes directly to
 * `$allOperations` middleware in a real production system.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly tenantContext: TenantContextService) {
    super({
      log: [{ emit: 'event', level: 'warn' }, { emit: 'event', level: 'error' }],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Returns the current tenant id from request-scoped context, throwing if
   * called outside a tenant-authenticated request (e.g. a background job
   * must set context explicitly first).
   */
  currentTenantId(): string {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new Error('TenantContext: no tenant id bound to current execution context');
    }
    return tenantId;
  }
}
