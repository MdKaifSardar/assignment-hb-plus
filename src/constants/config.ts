export const APP_CONFIG = {
  name: 'HB+ Fit Workspace',
  slug: 'hbplus-workspace',
  version: '1.0.0',
  allowedDomain: process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit',
  adminEmails: (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean),
  messages: {
    accessRestricted: 'Access restricted. Please login using your official domain email.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    networkError: 'Unable to connect to authentication services. Check your connection.',
    logoutSuccess: 'You have been safely signed out.',
  },
} as const;
