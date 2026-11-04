export interface AuditLogEntry {
  id: string;
  timestamp: string;
  email: string;
  domain: string | null;
  status: 'allowed' | 'rejected' | 'signed_out';
  reason?: string;
  userAgent?: string;
}

const AUDIT_STORAGE_KEY = 'hbplus_security_audit_logs';

class AuditLogService {
  private inMemoryLogs: AuditLogEntry[] = [];

  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    this.inMemoryLogs.unshift(fullEntry);
    if (this.inMemoryLogs.length > 50) {
      this.inMemoryLogs = this.inMemoryLogs.slice(0, 50);
    }

    return fullEntry;
  }

  async getRecentLogs(): Promise<AuditLogEntry[]> {
    return [...this.inMemoryLogs];
  }
}

export const auditLogService = new AuditLogService();
