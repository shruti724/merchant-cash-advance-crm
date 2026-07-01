import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RequestActor } from '../context/tenant-context.service';

/**
 * PermissionsGuard — enforces @RequirePermissions(...) metadata.
 * A wildcard permission "*" (assigned to TENANT_ADMIN) always passes.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const actor: RequestActor | undefined = request.actor;
    if (!actor) throw new ForbiddenException('No authenticated actor in request context');

    if (actor.permissions.includes('*')) return true;

    const hasAll = required.every((p) => actor.permissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException(`Missing required permissions: [${required.join(', ')}]`);
    }
    return true;
  }
}
