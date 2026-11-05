import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { userService } from '../services/userService';
import { auditLogService, AuditLogEntry } from '../services/auditLog';
import { UserProfile, UserRole } from '../types/auth';

export const AdminScreen: React.FC = () => {
  const { allowedDomain } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'directory' | 'audit' | 'policies'>('directory');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const dirUsers = await userService.getDirectoryUsers();
    const auditLogs = await auditLogService.getRecentLogs();
    setUsers(dirUsers);
    setLogs(auditLogs);
  }

  async function handleToggleRole(userId: string, currentRole: UserRole) {
    const nextRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    await userService.updateUserRole(userId, nextRole);
    await loadData();
  }

  return (
    <View style={styles.container}>
      {/* Sub Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('directory')}
          style={[styles.tabItem, activeTab === 'directory' && styles.tabItemActive]}
        >
          <Text
            style={[styles.tabLabel, activeTab === 'directory' && styles.tabLabelActive]}
          >
            User Directory ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('audit')}
          style={[styles.tabItem, activeTab === 'audit' && styles.tabItemActive]}
        >
          <Text style={[styles.tabLabel, activeTab === 'audit' && styles.tabLabelActive]}>
            Security Audit Logs ({logs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('policies')}
          style={[styles.tabItem, activeTab === 'policies' && styles.tabItemActive]}
        >
          <Text
            style={[styles.tabLabel, activeTab === 'policies' && styles.tabLabelActive]}
          >
            Domain Whitelist Policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Organization Personnel</Text>
          <Text style={styles.cardSubtitle}>
            Users authenticated under the @{allowedDomain} security perimeter.
          </Text>

          <View style={styles.userList}>
            {users.map((u) => (
              <View key={u.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.displayName}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>

                <View style={styles.userActions}>
                  <Badge
                    label={u.role.toUpperCase()}
                    variant={u.role === 'admin' ? 'info' : 'neutral'}
                  />
                  <TouchableOpacity
                    onPress={() => handleToggleRole(u.id, u.role)}
                    style={styles.roleBtn}
                  >
                    <Text style={styles.roleBtnText}>
                      {u.role === 'admin' ? 'Set as User' : 'Set as Admin'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Authentication Activity Stream</Text>
          <Text style={styles.cardSubtitle}>
            Live inspection of allowed vs rejected domain access attempts.
          </Text>

          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recent audit log entries captured yet.</Text>
            </View>
          ) : (
            <View style={styles.logList}>
              {logs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <Badge
                      label={log.status === 'allowed' ? 'GRANTED' : log.status === 'rejected' ? 'BLOCKED' : 'SIGNOUT'}
                      variant={log.status === 'allowed' ? 'success' : log.status === 'rejected' ? 'error' : 'neutral'}
                      dot
                    />
                    <Text style={styles.logTimestamp}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.logEmail}>{log.email}</Text>
                  {log.reason && <Text style={styles.logReason}>{log.reason}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Domain Restriction Policy</Text>
          <Text style={styles.cardSubtitle}>
            Active cryptographic and validation parameters enforced on every OAuth handshake.
          </Text>

          <View style={styles.policyGrid}>
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>Allowed Organization Domain:</Text>
              <Text style={styles.policyValue}>@{allowedDomain}</Text>
            </View>

            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>Match Algorithm:</Text>
              <Text style={styles.policyValue}>Exact RFC Canonical Domain (`split('@')[1]`)</Text>
            </View>

            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>Subdomain Bypass Prevention:</Text>
              <Text style={[styles.policyValue, { color: COLORS.success[700] }]}>Enforced</Text>
            </View>

            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>Violation Action:</Text>
              <Text style={[styles.policyValue, { color: COLORS.error[700] }]}>
                Immediate Session Invalidation & Token Revoke
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: SPACING.md,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  tabItem: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: SPACING.md,
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary[600],
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.slate[500],
  },
  tabLabelActive: {
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[900],
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[500],
    marginBottom: SPACING.lg,
  },
  userList: {
    gap: SPACING.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[900],
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[500],
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  roleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.slate[300],
    backgroundColor: COLORS.slate[50],
  },
  roleBtnText: {
    fontSize: 11,
    color: COLORS.slate[700],
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.slate[400],
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  logList: {
    gap: SPACING.sm,
  },
  logItem: {
    padding: SPACING.md,
    backgroundColor: COLORS.slate[50],
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 11,
    color: COLORS.slate[400],
  },
  logEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.slate[800],
  },
  logReason: {
    fontSize: 11,
    color: COLORS.slate[500],
    marginTop: 2,
  },
  policyGrid: {
    gap: SPACING.md,
  },
  policyRow: {
    padding: SPACING.md,
    backgroundColor: COLORS.slate[50],
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
  },
  policyLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[500],
    marginBottom: 2,
  },
  policyValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[900],
  },
});
