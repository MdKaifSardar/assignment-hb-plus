import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertBannerProps {
  type?: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'error',
  title,
  message,
  onDismiss,
}) => {
  const palette = ALERT_COLORS[type];

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={styles.content}>
        <View style={[styles.indicator, { backgroundColor: palette.accent }]} />
        <View style={styles.textContainer}>
          {title && <Text style={[styles.title, { color: palette.text }]}>{title}</Text>}
          <Text style={[styles.message, { color: palette.text }]}>{message}</Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <Text style={[styles.dismissText, { color: palette.text }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ALERT_COLORS = {
  error: {
    bg: COLORS.error[50],
    border: COLORS.error[200],
    text: COLORS.error[700],
    accent: COLORS.error[600],
  },
  warning: {
    bg: COLORS.warning[50],
    border: '#FDE68A',
    text: COLORS.warning[700],
    accent: COLORS.warning[600],
  },
  success: {
    bg: COLORS.success[50],
    border: COLORS.success[200],
    text: COLORS.success[700],
    accent: COLORS.success[600],
  },
  info: {
    bg: COLORS.primary[50],
    border: COLORS.primary[100],
    text: COLORS.primary[700],
    accent: COLORS.primary[600],
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginVertical: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 4,
    height: '100%',
    minHeight: 28,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  dismissButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  dismissText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
