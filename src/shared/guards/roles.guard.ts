import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestActor } from '../context/tenant-context.service';

/** RolesGuard — enforces @Roles(...) metadata against the authenticated actor's roles. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const actor: RequestActor | undefined = request.actor;
    if (!actor) throw new ForbiddenException('No authenticated actor in request context');

    const hasRole = requiredRoles.some((role) => actor.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        `Requires one of roles: [${requiredRoles.join(', ')}]`,
      );
    }
    return true;
  }
}
