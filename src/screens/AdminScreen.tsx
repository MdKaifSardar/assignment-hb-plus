import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Badge, BadgeVariant } from '../components/Badge';
import { Button } from '../components/Button';
import { DetailRow } from '../components/DetailRow';
import { TabLink } from '../components/TabLink';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { userService } from '../services/userService';
import { auditLogService, AuditLogEntry } from '../services/auditLog';
import { UserProfile, UserRole } from '../types/auth';

type Tab = 'people' | 'activity' | 'policy';

const STATUS_LABEL: Record<AuditLogEntry['status'], { text: string; variant: BadgeVariant }> = {
  allowed: { text: 'Allowed', variant: 'accent' },
  rejected: { text: 'Rejected', variant: 'danger' },
  signed_out: { text: 'Signed out', variant: 'neutral' },
};

export const AdminScreen: React.FC = () => {
  const { user: currentUser, allowedDomain } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [tab, setTab] = useState<Tab>('people');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [directory, recent] = await Promise.all([
      userService.getDirectoryUsers(),
      auditLogService.getRecentLogs(),
    ]);
    setUsers(directory);
    setLogs(recent);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(target: UserProfile) {
    const next: UserRole = target.role === 'admin' ? 'user' : 'admin';
    setPendingId(target.id);
    await userService.updateUserRole(target.id, next);
    await load();
    setPendingId(null);
  }

  return (
    <View>
      <View style={styles.tabs} accessibilityRole="tablist">
        <TabLink label={`People (${users.length})`} active={tab === 'people'} onPress={() => setTab('people')} />
        <TabLink label="Sign-in activity" active={tab === 'activity'} onPress={() => setTab('activity')} />
        <TabLink label="Domain policy" active={tab === 'policy'} onPress={() => setTab('policy')} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.inkMuted} style={styles.loading} />
      ) : null}

      {!loading && tab === 'people' && (
        <View style={styles.list}>
          {users.length === 0 ? (
            <Text style={styles.empty}>Nobody has signed in yet.</Text>
          ) : (
            users.map((person) => {
              const isSelf = person.email === currentUser?.email;
              return (
                <View key={person.id} style={styles.row}>
                  <View style={styles.rowMain}>
                    <Text style={styles.primary}>{person.displayName}</Text>
                    <Text style={styles.secondary}>{person.email}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <Badge
                      label={person.role === 'admin' ? 'Admin' : 'Member'}
                      variant={person.role === 'admin' ? 'accent' : 'neutral'}
                    />
                    <Button
                      label={person.role === 'admin' ? 'Make member' : 'Make admin'}
                      accessibilityLabel={`${person.role === 'admin' ? 'Make member' : 'Make admin'}: ${person.email}`}
                      onPress={() => changeRole(person)}
                      loading={pendingId === person.id}
                      disabled={isSelf}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {!loading && tab === 'activity' && (
        <View style={styles.list}>
          {logs.length === 0 ? (
            <Text style={styles.empty}>No sign-in attempts recorded yet.</Text>
          ) : (
            logs.map((entry) => {
              const status = STATUS_LABEL[entry.status];
              return (
                <View key={entry.id} style={styles.row}>
                  <View style={styles.rowMain}>
                    <Text style={styles.primary}>{entry.email}</Text>
                    {entry.reason ? <Text style={styles.secondary}>{entry.reason}</Text> : null}
                    <Text style={styles.timestamp}>
                      {new Date(entry.timestamp).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </Text>
                  </View>
                  <Badge label={status.text} variant={status.variant} />
                </View>
              );
            })
          )}
        </View>
      )}

      {!loading && tab === 'policy' && (
        <View style={styles.policy}>
          <DetailRow label="Allowed domain" value={`@${allowedDomain}`} />
          <DetailRow label="Matching" value="Exact match on the part after the @. Subdomains and look-alike domains are rejected." />
          <DetailRow label="On mismatch" value="The Google session is signed out and the attempt is written to the activity log." />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  loading: {
    marginVertical: SPACING.xxl,
  },
  list: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  rowMain: {
    flex: 1,
    minWidth: 200,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  primary: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.ink,
  },
  secondary: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  timestamp: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.inkSubtle,
    marginTop: 2,
  },
  empty: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkSubtle,
    padding: SPACING.xl,
    textAlign: 'center',
  },
  policy: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
  },
});
