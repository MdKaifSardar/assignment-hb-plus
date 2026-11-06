import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Hold until the stored session is checked so the login form never flashes
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>HB+</Text>
        </View>
        <ActivityIndicator size="large" color={COLORS.primary[600]} style={styles.spinner} />
        <Text style={styles.loadingText}>Checking your session...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <DashboardScreen />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.slate[50],
  },
  brandBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.slate[900],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.slate[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
