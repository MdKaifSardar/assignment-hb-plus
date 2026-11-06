export const APP_CONFIG = {
  name: 'HB+ Fit Workspace',
  slug: 'hbplus-workspace',
  version: '1.0.0',
  allowedDomain: process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit',
  adminEmails: (process.env.EXPO_PUBLIC_ADMIN_EMAILS || 'admin@hbplus.fit,kaif@hbplus.fit')
    .split(',')
    .map((e: string) => e.trim().toLowerCase()),
  messages: {
    accessRestricted: 'Access restricted. Please login using your official domain email.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    networkError: 'Unable to connect to authentication services. Check your connection.',
    logoutSuccess: 'You have been safely signed out.',
  },
} as const;
