import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { Wordmark } from '../components/Wordmark';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Hold until the stored session is checked so the login form never flashes
  if (isLoading && !user) {
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <Wordmark size={28} />
        <ActivityIndicator color={COLORS.accent} style={styles.spinner} />
        <Text style={styles.text}>Checking your session…</Text>
      </View>
    );
  }

  return user ? <DashboardScreen /> : <LoginScreen />;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.paper,
  },
  spinner: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  text: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkSubtle,
  },
});
