import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RequestActor } from '../../../../shared/context/tenant-context.service';

export interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  roles: string[];
  permissions: string[];
}

/**
 * JwtStrategy — validates the access token and returns a RequestActor
 * which Passport attaches as `request.user`. AuthController re-exposes it
 * as `request.actor` for semantic clarity across the codebase (see
 * TenantBindingInterceptor).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestActor> {
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
