import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';

import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { TenantContextService } from './shared/context/tenant-context.service';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { PermissionsGuard } from './shared/guards/permissions.guard';
import { TenantBindingInterceptor } from './shared/interceptors/tenant-binding.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { DomainEventBus } from './shared/infrastructure/event-bus/domain-event-bus';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema }),
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [{ ttl: 60_000, limit: 100 }],
      }),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    LeadsModule,
    ApplicationsModule,
    AuditLogModule,
  ],
  providers: [
    TenantContextService,
    DomainEventBus,
    // Guard execution order matters: authenticate -> check role -> check
    // fine-grained permission. All three are global so individual
    // controllers only need to declare @Public() / @Roles() / @RequirePermissions().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantBindingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
