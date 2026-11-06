import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { DetailRow } from '../components/DetailRow';
import { TabLink } from '../components/TabLink';
import { Wordmark } from '../components/Wordmark';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { AdminScreen } from './AdminScreen';

const formatDateTime = (value: string | number) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const DashboardScreen: React.FC = () => {
  const { user, session, signOut, isLoading } = useAuth();
  const { isMobileView, maxContentWidth } = useResponsive();
  const [view, setView] = useState<'workspace' | 'admin'>('workspace');

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const firstName = user.displayName.split(' ')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={[styles.headerInner, { maxWidth: maxContentWidth }]}>
          <Wordmark />
          <View style={styles.headerRight}>
            {!isMobileView && <Text style={styles.headerEmail}>{user.email}</Text>}
            <Button label="Sign out" variant="text" onPress={signOut} loading={isLoading} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, { maxWidth: maxContentWidth }]}>
          {isAdmin && (
            <View style={styles.tabs} accessibilityRole="tablist">
              <TabLink
                label="Workspace"
                active={view === 'workspace'}
                onPress={() => setView('workspace')}
              />
              <TabLink label="Admin" active={view === 'admin'} onPress={() => setView('admin')} />
            </View>
          )}

          {view === 'admin' && isAdmin ? (
            <AdminScreen />
          ) : (
            <>
              <View style={styles.intro}>
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatar}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.introText}>
                  <Text style={styles.greeting} accessibilityRole="header">
                    Hello, {firstName}
                  </Text>
                  <View style={styles.roleLine}>
                    <Badge
                      label={isAdmin ? 'Admin' : 'Member'}
                      variant={isAdmin ? 'accent' : 'neutral'}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Your account</Text>
              <View style={styles.details}>
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Organisation domain" value={`@${user.domain}`} />
                <DetailRow label="Role" value={isAdmin ? 'Administrator' : 'Member'} />
                <DetailRow label="Last sign-in" value={formatDateTime(user.lastLoginAt)} />
                {session ? (
                  <DetailRow label="Session valid until" value={formatDateTime(session.expiresAt)} />
                ) : null}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  headerInner: {
    width: '100%',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerEmail: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkSubtle,
  },
  scroll: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  content: {
    width: '100%',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    marginBottom: SPACING.xl,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: SPACING.lg,
  },
  avatarFallback: {
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: TYPOGRAPHY.serif,
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.accentDark,
  },
  introText: {
    flex: 1,
  },
  greeting: {
    fontFamily: TYPOGRAPHY.serif,
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.ink,
    letterSpacing: -0.4,
  },
  roleLine: {
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  details: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
  },
});
