import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface AlertBannerProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ message, title, onDismiss }) => (
  <View style={styles.container} accessibilityRole="alert">
    <View style={styles.text}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
    {onDismiss ? (
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        style={styles.dismiss}
        hitSlop={4}
      >
        <Text style={styles.dismissText}>Dismiss</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.dangerSoft,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingLeft: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  text: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  title: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.danger,
    marginBottom: 2,
  },
  message: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 19,
    color: COLORS.ink,
  },
  dismiss: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    marginTop: -SPACING.md,
    marginBottom: -SPACING.md,
  },
  dismissText: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkMuted,
    textDecorationLine: 'underline',
  },
});
