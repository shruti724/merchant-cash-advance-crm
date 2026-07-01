/** Centralized permission-string catalog to avoid magic strings across modules. */
export const PERMISSIONS = {
  LEAD_CREATE: 'lead:create',
  LEAD_READ: 'lead:read',
  LEAD_UPDATE: 'lead:update',
  APPLICATION_READ: 'application:read',
  APPLICATION_TRANSITION: 'application:transition',
  APPLICATION_DECIDE: 'application:decide',
} as const;
