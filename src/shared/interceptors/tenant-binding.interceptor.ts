import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from '../context/tenant-context.service';

/**
 * TenantBindingInterceptor — after Passport populates `request.actor`
 * (see JwtStrategy), this binds tenantId/actor into the AsyncLocalStorage
 * context for the remainder of the request lifecycle. Runs after guards,
 * before the controller handler, on every non-public authenticated route.
 */
@Injectable()
export class TenantBindingInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    // Passport attaches the validated JwtStrategy result as `request.user`;
    // alias it to `request.actor` for semantic clarity in the rest of the app.
    if (request.user && !request.actor) {
      request.actor = request.user;
    }
    if (request.actor) {
      this.tenantContext.setTenantId(request.actor.tenantId);
      this.tenantContext.setActor(request.actor);
    }
    return next.handle();
  }
}
