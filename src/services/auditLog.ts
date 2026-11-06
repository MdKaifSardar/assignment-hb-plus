import { isSupabaseConfigured, supabase } from './supabase';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  email: string;
  domain: string | null;
  status: 'allowed' | 'rejected' | 'signed_out';
  reason?: string;
  userAgent?: string;
}

interface AuditRow {
  id: string;
  timestamp: string;
  email: string;
  domain: string | null;
  status: AuditLogEntry['status'];
  reason: string | null;
}

class AuditLogService {
  private inMemoryLogs: AuditLogEntry[] = [];

  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').insert({
          id: fullEntry.id,
          email: fullEntry.email,
          domain: fullEntry.domain,
          status: fullEntry.status,
          reason: fullEntry.reason,
          timestamp: fullEntry.timestamp,
        });
      } catch {
        // Supabase unreachable; the in-memory copy keeps the app usable
      }
    }

    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > 50) {
      this.inMemoryLogs = this.inMemoryLogs.slice(0, 50);
    }

    return fullEntry;
  }

  async getRecentLogs(): Promise<AuditLogEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          return (data as AuditRow[]).map((row) => ({
            id: row.id,
            timestamp: row.timestamp,
            email: row.email,
            domain: row.domain,
            status: row.status,
            reason: row.reason ?? undefined,
          }));
        }
      } catch {
        // Supabase unreachable; the in-memory copy keeps the app usable
      }
    }
    return [...this.inMemoryLogs];
  }
}

export const auditLogService = new AuditLogService();
