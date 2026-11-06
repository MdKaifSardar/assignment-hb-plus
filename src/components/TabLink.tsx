import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, MIN_TOUCH_TARGET, SPACING, TYPOGRAPHY } from '../constants/theme';

interface TabLinkProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const TabLink: React.FC<TabLinkProps> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [
      styles.tab,
      active && styles.tabActive,
      !active && hovered && styles.tabHover,
    ]}
  >
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  tab: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
    marginRight: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.accent,
  },
  tabHover: {
    borderBottomColor: COLORS.lineStrong,
  },
  label: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.inkSubtle,
  },
  labelActive: {
    color: COLORS.ink,
  },
});
