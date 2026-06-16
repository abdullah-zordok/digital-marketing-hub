export const ADMIN_ROUTE_PREFIX = 'admin';

export const TOKEN_EXPIRY_FALLBACK = '15m';

export const REFRESH_TOKEN_EXPIRY_FALLBACK = '7d';

export const ROLE_CAPABILITIES = {
  ADMIN: ['manage:all'],
  EDITOR: ['manage:services', 'manage:blog', 'manage:knowledge-base'],
  VIEWER: ['read:dashboard'],
} as const;

export type RoleName = keyof typeof ROLE_CAPABILITIES;
