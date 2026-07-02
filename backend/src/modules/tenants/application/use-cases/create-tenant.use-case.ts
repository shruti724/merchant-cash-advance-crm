import { ConflictException, Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { CreateTenantDto } from '../../dto/create-tenant.dto';

/**
 * CreateTenantUseCase — platform-level onboarding. Provisions the default
 * RBAC role set for the new tenant atomically with tenant creation, so
 * every tenant starts from a consistent, ready-to-use permission model
 * (mirrors the "Tenant Management" capability at the Super Admin / global
 * platform layer of the original system).
 */
@Injectable()
export class CreateTenantUseCase {
  private static readonly DEFAULT_ROLES: { name: RoleName; permissions: string[] }[] = [
    { name: 'TENANT_ADMIN', permissions: ['*'] },
    { name: 'ISO', permissions: ['lead:create', 'lead:read', 'lead:update'] },
    { name: 'AGENT', permissions: ['lead:read'] },
    { name: 'UNDERWRITER', permissions: ['application:read', 'application:decide', 'application:transition'] },
    { name: 'OPERATIONS', permissions: ['application:read', 'application:transition'] },
    { name: 'ACCOUNTANT', permissions: ['application:read'] },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Tenant slug already in use');

    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        roles: { create: CreateTenantUseCase.DEFAULT_ROLES },
      },
      include: { roles: true },
    });
  }
}
