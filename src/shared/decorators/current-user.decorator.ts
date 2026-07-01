import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestActor } from '../context/tenant-context.service';

/** Injects the authenticated actor (id, tenantId, roles, permissions) into a controller handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestActor => {
    const request = ctx.switchToHttp().getRequest();
    return request.actor;
  },
);
