import { Injectable, Scope } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export interface RequestActor {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
}

const TENANT_KEY = 'tenantId';
const ACTOR_KEY = 'actor';

/**
 * TenantContextService — thin wrapper around AsyncLocalStorage (via
 * nestjs-cls) that carries the current request's tenant/actor through the
 * whole async call chain without threading it through every function
 * signature. This is what lets the Prisma extension enforce row-level
 * isolation transparently (see prisma.service.ts).
 */
@Injectable({ scope: Scope.DEFAULT })
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  setTenantId(tenantId: string): void {
    this.cls.set(TENANT_KEY, tenantId);
  }

  getTenantId(): string | undefined {
    return this.cls.get(TENANT_KEY);
  }

  setActor(actor: RequestActor): void {
    this.cls.set(ACTOR_KEY, actor);
  }

  getActor(): RequestActor | undefined {
    return this.cls.get(ACTOR_KEY);
  }
}
