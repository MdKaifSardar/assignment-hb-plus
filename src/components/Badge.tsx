import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', dot = false }) => {
  const variantStyles = VARIANT_MAP[variant];

  return (
    <View style={[styles.badge, { backgroundColor: variantStyles.bg, borderColor: variantStyles.border }]}>
      {dot && <View style={[styles.dot, { backgroundColor: variantStyles.text }]} />}
      <Text style={[styles.label, { color: variantStyles.text }]}>{label}</Text>
    </View>
  );
};

const VARIANT_MAP = {
  success: {
    bg: COLORS.success[50],
    border: COLORS.success[200],
    text: COLORS.success[700],
  },
  error: {
    bg: COLORS.error[50],
    border: COLORS.error[200],
    text: COLORS.error[700],
  },
  warning: {
    bg: COLORS.warning[50],
    border: '#FDE68A',
    text: COLORS.warning[700],
  },
  info: {
    bg: COLORS.primary[50],
    border: COLORS.primary[100],
    text: COLORS.primary[700],
  },
  neutral: {
    bg: COLORS.slate[100],
    border: COLORS.slate[200],
    text: COLORS.slate[700],
  },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
