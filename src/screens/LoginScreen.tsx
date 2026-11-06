import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AlertBanner } from '../components/AlertBanner';
import { Wordmark } from '../components/Wordmark';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isAuthenticating, error, clearError, allowedDomain } = useAuth();
  const { isMobileView } = useResponsive();

  const handleSignIn = () => {
    clearError();
    signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scroll, isMobileView && styles.scrollMobile]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Wordmark size={26} />
        </View>

        <View style={[styles.panel, isMobileView && styles.panelMobile]}>
          <Text style={styles.heading} accessibilityRole="header">
            Sign in to the workspace
          </Text>
          <Text style={styles.lede}>
            Use your <Text style={styles.domain}>@{allowedDomain}</Text> Google account. Other
            accounts are signed out again straight away.
          </Text>

          {error ? (
            <View style={styles.alert}>
              <AlertBanner message={error} onDismiss={clearError} />
            </View>
          ) : null}

          <View style={styles.action}>
            <GoogleSignInButton onPress={handleSignIn} isLoading={isAuthenticating} />
          </View>
        </View>

        <Text style={styles.footnote}>Having trouble? Ask your workspace admin for access.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  scrollMobile: {
    justifyContent: 'flex-start',
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  brand: {
    width: '100%',
    maxWidth: 400,
    marginBottom: SPACING.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  panelMobile: {
    padding: SPACING.lg,
  },
  heading: {
    fontFamily: TYPOGRAPHY.serif,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  lede: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 22,
    color: COLORS.inkMuted,
  },
  domain: {
    color: COLORS.ink,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  alert: {
    marginTop: SPACING.lg,
  },
  action: {
    marginTop: SPACING.xl,
  },
  footnote: {
    width: '100%',
    maxWidth: 400,
    marginTop: SPACING.lg,
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkSubtle,
  },
});
