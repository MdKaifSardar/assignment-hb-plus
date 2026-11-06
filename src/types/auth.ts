export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  domain: string;
  role: UserRole;
  lastLoginAt: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: UserProfile;
}

export interface DomainValidationResult {
  isValid: boolean;
  domain: string | null;
  error?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  allowedDomain: string;
}
