import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { LoginDto } from '../../dto/login.dto';
import { AuthResponseDto } from '../../dto/auth-response.dto';

/**
 * LoginUseCase — verifies credentials scoped to a tenant slug (the same
 * email may exist under multiple tenants), issues a short-lived access
 * token and a long-lived refresh token (stored hashed, never in plaintext,
 * so a DB leak doesn't hand out valid refresh tokens).
 */
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
    if (!tenant || !tenant.isActive) throw new UnauthorizedException('Invalid credentials');

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: dto.email } },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const roles = user.roles.map((r) => r.role.name);
    const permissions = Array.from(new Set(user.roles.flatMap((r) => r.role.permissions)));

    const payload = { sub: user.id, tenantId: tenant.id, roles, permissions };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('jwt.accessSecret'),
      expiresIn: this.config.get('jwt.accessExpiresIn'),
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: refreshTokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, tenantId: tenant.id, roles },
    };
  }
}
