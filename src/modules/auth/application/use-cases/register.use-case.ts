import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { RegisterDto } from '../../dto/register.dto';

/**
 * RegisterUseCase — application-layer orchestration for self-registration.
 * New self-registered users are granted the ISO role by default; elevating
 * to TENANT_ADMIN happens through a separate, admin-guarded endpoint —
 * keeping privilege escalation out of the public registration path.
 */
@Injectable()
export class RegisterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: RegisterDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: dto.email } },
    });
    if (existing) throw new ConflictException('Email already registered for this tenant');

    const isoRole = await this.prisma.role.findUnique({
      where: { tenantId_name: { tenantId: tenant.id, name: 'ISO' } },
    });
    if (!isoRole) throw new NotFoundException('Default ISO role not provisioned for tenant');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: { create: { roleId: isoRole.id } },
      },
      include: { roles: { include: { role: true } } },
    });

    return { user, tenant };
  }
}
