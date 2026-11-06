import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { AdminScreen } from './AdminScreen';

export const DashboardScreen: React.FC = () => {
  const { user, session, signOut, isLoading } = useAuth();
  const { isMobileView, maxContentWidth } = useResponsive();
  const [activeView, setActiveView] = useState<'profile' | 'admin'>('profile');

  if (!user) return null;

  const sessionDurationHours = session
    ? Math.max(0, Math.round((session.expiresAt - Date.now()) / (1000 * 60 * 60)))
    : 24;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogo}>
            <Text style={styles.navLogoText}>HB+</Text>
          </View>
          <View>
            <Text style={styles.navTitle}>HB+ Fit Workspace</Text>
            <Text style={styles.navSubtitle}>Internal workspace</Text>
          </View>
        </View>

        <View style={styles.navActions}>
          {user.role === 'admin' && (
            <View style={styles.viewToggleGroup}>
              <TouchableOpacity
                onPress={() => setActiveView('profile')}
                style={[
                  styles.viewToggleBtn,
                  activeView === 'profile' && styles.viewToggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.viewToggleText,
                    activeView === 'profile' && styles.viewToggleTextActive,
                  ]}
                >
                  My Workspace
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveView('admin')}
                style={[
                  styles.viewToggleBtn,
                  activeView === 'admin' && styles.viewToggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.viewToggleText,
                    activeView === 'admin' && styles.viewToggleTextActive,
                  ]}
                >
                  Admin Console
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={signOut}
            disabled={isLoading}
            style={styles.logoutButton}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.slate[600]} />
            ) : (
              <Text style={styles.logoutText}>Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { maxWidth: maxContentWidth }]}>
          {activeView === 'admin' && user.role === 'admin' ? (
            <AdminScreen />
          ) : (
            <>
              <View style={styles.profileCard}>
                <View style={[styles.profileHeader, isMobileView && styles.profileHeaderMobile]}>
                  <View style={styles.avatarContainer}>
                    {user.avatarUrl ? (
                      <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.profileDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.displayName}>{user.displayName}</Text>
                      <Badge
                        label={user.role === 'admin' ? 'Administrator' : 'Workspace Member'}
                        variant={user.role === 'admin' ? 'info' : 'neutral'}
                        dot
                      />
                    </View>
                    <Text style={styles.emailText}>{user.email}</Text>

                    <View style={styles.badgesRow}>
                      <Badge label={`Verified @${user.domain}`} variant="success" dot />
                      <Badge label="Google SSO Active" variant="neutral" />
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.metricsGrid, isMobileView && styles.metricsGridMobile]}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Domain Whitelist</Text>
                  <Text style={styles.metricValue}>@{user.domain}</Text>
                  <Text style={styles.metricCaption}>Strict 1:1 RFC domain match enabled</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Session Token</Text>
                  <Text style={styles.metricValue}>Valid (~{sessionDurationHours}h left)</Text>
                  <Text style={styles.metricCaption}>Scoped authorization token</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Assigned Role</Text>
                  <Text style={[styles.metricValue, { textTransform: 'capitalize' }]}>{user.role}</Text>
                  <Text style={styles.metricCaption}>
                    {user.role === 'admin' ? 'Full administrative access' : 'Standard workspace access'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionHeading}>Security Architecture</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoDot}>•</Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.boldText}>Domain Gating:</Text> Non-@{user.domain} accounts are
                      instantly rejected upon OAuth handshake and purged from memory.
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoDot}>•</Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.boldText}>Single Sign-On:</Text> Federated via Google OAuth 2.0 with
                      PKCE authorization code flow.
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoDot}>•</Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.boldText}>Protected Routing:</Text> Direct navigation without an
                      authenticated @{user.domain} session immediately bounces back to login.
                    </Text>
                  </View>
                </View>
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
    backgroundColor: COLORS.slate[50],
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[200],
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogo: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  navLogoText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  navTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[900],
  },
  navSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[500],
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate[100],
    borderRadius: RADIUS.md,
    padding: 3,
  },
  viewToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  viewToggleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.slate[600],
  },
  viewToggleTextActive: {
    color: COLORS.slate[900],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  logoutButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    backgroundColor: '#FFFFFF',
  },
  logoutText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.slate[700],
  },
  scrollContent: {
    paddingVertical: SPACING['3xl'],
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary[100],
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary[50],
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[700],
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  displayName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[900],
  },
  emailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.slate[500],
    marginBottom: SPACING.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  metricsGridMobile: {
    flexDirection: 'column',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    ...SHADOWS.card,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[900],
    marginBottom: 4,
  },
  metricCaption: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[400],
  },
  infoSection: {
    marginTop: SPACING.md,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[800],
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoDot: {
    color: COLORS.primary[600],
    fontSize: 18,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.slate[600],
    lineHeight: 20,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[800],
  },
});
