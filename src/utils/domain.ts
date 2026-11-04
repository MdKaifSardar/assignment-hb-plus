import { APP_CONFIG } from '../constants/config';
import { DomainValidationResult } from '../types/auth';

/**
 * Extracts and canonicalizes the domain portion of an email address.
 * Returns null if the email is malformed or missing a valid domain segment.
 */
export function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') return null;

  const trimmed = email.trim();
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) return null;

  const [localPart, domainPart] = trimmed.split('@');
  if (!localPart || !domainPart) return null;

  const canonicalDomain = domainPart.toLowerCase().trim();
  if (!canonicalDomain.includes('.') || canonicalDomain.endsWith('.')) {
    return null;
  }

  return canonicalDomain;
}

/**
 * Validates whether an email belongs strictly to the permitted organization domain.
 * Enforces exact domain matching to block subdomains or look-alike attacks (e.g. hbplus.fit.evil.com).
 */
export function validateEmailDomain(
  email: string,
  allowedDomain: string = APP_CONFIG.allowedDomain
): DomainValidationResult {
  const domain = extractDomain(email);

  if (!domain) {
    return {
      isValid: false,
      domain: null,
      error: 'Invalid email address format.',
    };
  }

  const isExactMatch = domain === allowedDomain.toLowerCase().trim();

  if (!isExactMatch) {
    return {
      isValid: false,
      domain,
      error: APP_CONFIG.messages.accessRestricted,
    };
  }

  return {
    isValid: true,
    domain,
  };
}

/**
 * Resolves user role based on configured administrative email lists.
 */
export function resolveUserRole(email: string): 'admin' | 'user' {
  const normalized = email.trim().toLowerCase();
  return APP_CONFIG.adminEmails.includes(normalized) ? 'admin' : 'user';
}
