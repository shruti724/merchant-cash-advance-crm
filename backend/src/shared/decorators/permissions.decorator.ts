import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
/**
 * Restricts a route to one or more fine-grained permission strings
 * (e.g. "application:decide"). Complements @Roles for finer control than
 * role-name checks alone — a role's `permissions` array is matched
 * against this list by PermissionsGuard.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
