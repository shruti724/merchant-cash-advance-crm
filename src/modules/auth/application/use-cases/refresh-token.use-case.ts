import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

/**
 * RefreshTokenUseCase — rotates refresh tokens on every use (old one is
 * revoked, a new one issued) to limit the blast radius of a stolen token
 * (a classic "refresh token rotation" mitigation for replay attacks).
 */
@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(rawToken: string) {
    const candidates = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });

    let matched: (typeof candidates)[number] | undefined;
    for (const candidate of candidates) {
      if (await bcrypt.compare(rawToken, candidate.tokenHash)) {
        matched = candidate;
        break;
      }
    }

    if (!matched) throw new UnauthorizedException('Invalid or expired refresh token');

    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date() },
    });

    const roles = matched.user.roles.map((r) => r.role.name);
    const permissions = Array.from(
      new Set(matched.user.roles.flatMap((r) => r.role.permissions)),
    );

    const payload = { sub: matched.user.id, tenantId: matched.user.tenantId, roles, permissions };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('jwt.accessSecret'),
      expiresIn: this.config.get('jwt.accessExpiresIn'),
    });

    const newRawToken = crypto.randomBytes(48).toString('hex');
    const newHash = await bcrypt.hash(newRawToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId: matched.user.id, tokenHash: newHash, expiresAt },
    });

    return { accessToken, refreshToken: newRawToken };
  }
}
