import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AlertBanner } from '../components/AlertBanner';
import { Badge } from '../components/Badge';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isLoading, error, clearError, allowedDomain } = useAuth();
  const { isMobileView } = useResponsive();

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isMobileView && styles.scrollContainerMobile,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, isMobileView && styles.cardMobile]}>
          <View style={styles.header}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandInitial}>HB+</Text>
            </View>
            <Text style={styles.title}>HB+ Fit Workspace</Text>
            <Text style={styles.subtitle}>
              Sign in with your corporate account to access internal resources.
            </Text>
          </View>

          <View style={styles.domainNotice}>
            <View style={styles.domainNoticeHeader}>
              <Text style={styles.domainNoticeLabel}>Restricted Access</Text>
              <Badge label={`@${allowedDomain}`} variant="info" dot />
            </View>
            <Text style={styles.domainNoticeText}>
              Authentication is strictly limited to authorized{' '}
              <Text style={styles.domainHighlight}>@{allowedDomain}</Text> email accounts. External
              domains will be rejected.
            </Text>
          </View>

          {error && (
            <AlertBanner
              type="error"
              title="Access Denied"
              message={error}
              onDismiss={clearError}
            />
          )}

          <View style={styles.actionSection}>
            <GoogleSignInButton
              onPress={handleGoogleSignIn}
              isLoading={isLoading}
              text="Continue with Google"
            />
          </View>

          <View style={styles.securityFooter}>
            <Text style={styles.securityText}>
              Protected by OAuth 2.0 PKCE protocol and domain authorization gates.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate[100],
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  scrollContainerMobile: {
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.surface.card,
    borderRadius: RADIUS.xl,
    padding: SPACING['3xl'],
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    ...SHADOWS.elevated,
  },
  cardMobile: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.slate[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  brandInitial: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[900],
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.slate[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  domainNotice: {
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  domainNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  domainNoticeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  domainNoticeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[600],
    lineHeight: 18,
  },
  domainHighlight: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary[600],
  },
  actionSection: {
    marginVertical: SPACING.md,
  },
  securityFooter: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[100],
  },
  securityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.slate[400],
    textAlign: 'center',
    lineHeight: 16,
  },
});
