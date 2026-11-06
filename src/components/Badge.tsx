import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export type BadgeVariant = 'accent' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => {
  const tone = TONES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
    </View>
  );
};

const TONES = {
  accent: { bg: COLORS.accentSoft, fg: COLORS.accentDark },
  danger: { bg: COLORS.dangerSoft, fg: COLORS.danger },
  warning: { bg: COLORS.warningSoft, fg: COLORS.warning },
  neutral: { bg: COLORS.line, fg: COLORS.inkMuted },
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  label: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
