import { UserProfile, UserRole } from '../types/auth';
import { APP_CONFIG } from '../constants/config';

const INITIAL_DIRECTORY_USERS: UserProfile[] = [
  {
    id: 'usr_hb_01',
    email: `admin@${APP_CONFIG.allowedDomain}`,
    displayName: 'System Administrator',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
    domain: APP_CONFIG.allowedDomain,
    role: 'admin',
    lastLoginAt: '2026-11-04T18:30:00Z',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'usr_hb_02',
    email: `kaif@${APP_CONFIG.allowedDomain}`,
    displayName: 'Kaif Sardar',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Kaif',
    domain: APP_CONFIG.allowedDomain,
    role: 'admin',
    lastLoginAt: '2026-11-04T19:00:00Z',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'usr_hb_03',
    email: `sarah.jenkins@${APP_CONFIG.allowedDomain}`,
    displayName: 'Sarah Jenkins',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Jenkins',
    domain: APP_CONFIG.allowedDomain,
    role: 'user',
    lastLoginAt: '2026-11-04T14:20:00Z',
    createdAt: '2026-03-10T11:15:00Z',
  },
  {
    id: 'usr_hb_04',
    email: `marcus.vance@${APP_CONFIG.allowedDomain}`,
    displayName: 'Marcus Vance',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Marcus%20Vance',
    domain: APP_CONFIG.allowedDomain,
    role: 'user',
    lastLoginAt: '2026-11-03T16:45:00Z',
    createdAt: '2026-04-12T13:30:00Z',
  },
];

class UserService {
  private users: UserProfile[] = [...INITIAL_DIRECTORY_USERS];

  async getDirectoryUsers(): Promise<UserProfile[]> {
    return [...this.users];
  }

  async upsertUser(user: UserProfile): Promise<UserProfile> {
    const existingIndex = this.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      this.users[existingIndex] = {
        ...this.users[existingIndex],
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      return this.users[existingIndex];
    }
    this.users.unshift(user);
    return user;
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;
    target.role = newRole;
    return true;
  }
}

export const userService = new UserService();
