import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'outline',
  loading = false,
  disabled = false,
  accessibilityLabel,
}) => {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.base,
        variant === 'outline' && styles.outline,
        (hovered || pressed) && (variant === 'outline' ? styles.outlineActive : styles.textActive),
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.inkMuted} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  outline: {
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    backgroundColor: COLORS.surface,
  },
  outlineActive: {
    borderColor: COLORS.inkSubtle,
    backgroundColor: COLORS.paper,
  },
  textActive: {
    backgroundColor: COLORS.line,
  },
  inactive: {
    opacity: 0.55,
  },
  label: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.ink,
  },
});
