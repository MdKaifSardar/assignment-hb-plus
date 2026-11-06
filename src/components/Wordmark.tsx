import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

export const Wordmark: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <Text style={[styles.mark, { fontSize: size }]} accessibilityRole="header">
    HB<Text style={styles.plus}>+</Text>
  </Text>
);

const styles = StyleSheet.create({
  mark: {
    fontFamily: TYPOGRAPHY.serif,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  plus: {
    color: COLORS.accent,
  },
});
