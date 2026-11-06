import { UserProfile, UserRole } from '../types/auth';
import { APP_CONFIG } from '../constants/config';
import { isSupabaseConfigured, supabase } from './supabase';

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

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  domain: string;
  role: UserRole;
  last_login_at: string;
  created_at: string;
}

const fromRow = (row: UserRow): UserProfile => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name || row.email.split('@')[0],
  avatarUrl: row.avatar_url ?? undefined,
  domain: row.domain,
  role: row.role,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
});

class UserService {
  private inMemoryUsers: UserProfile[] = [...INITIAL_DIRECTORY_USERS];

  async getDirectoryUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return (data as UserRow[]).map(fromRow);
        }
      } catch {
        // Supabase unreachable; the in-memory copy keeps the app usable
      }
    }
    return [...this.inMemoryUsers];
  }

  async upsertUser(incoming: UserProfile): Promise<UserProfile> {
    let user = incoming;
    if (isSupabaseConfigured && supabase) {
      try {
        // A role granted from the admin console must survive the next login.
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id, role')
          .eq('email', incoming.email)
          .maybeSingle();
        if (existing) user = { ...incoming, id: existing.id, role: existing.role as UserRole };

        await supabase.from('user_profiles').upsert(
          {
            id: user.id,
            email: user.email,
            display_name: user.displayName,
            avatar_url: user.avatarUrl,
            domain: user.domain,
            role: user.role,
            last_login_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
      } catch {
        // Supabase unreachable; the in-memory copy keeps the app usable
      }
    }

    const existingIndex = this.inMemoryUsers.findIndex(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      this.inMemoryUsers[existingIndex] = {
        ...this.inMemoryUsers[existingIndex],
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      return this.inMemoryUsers[existingIndex];
    }
    this.inMemoryUsers.unshift(user);
    return user;
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ role: newRole })
          .eq('id', userId);

        if (!error) {
          const target = this.inMemoryUsers.find((u) => u.id === userId);
          if (target) target.role = newRole;
          return true;
        }
      } catch {
        // Supabase unreachable; the in-memory copy keeps the app usable
      }
    }

    const target = this.inMemoryUsers.find((u) => u.id === userId);
    if (!target) return false;
    target.role = newRole;
    return true;
  }
}

export const userService = new UserService();
