import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';

interface DetailRowProps {
  label: string;
  value: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  const { isMobileView } = useResponsive();

  return (
    <View style={[styles.row, isMobileView && styles.rowStacked]}>
      <Text style={[styles.label, !isMobileView && styles.labelWide]}>{label}</Text>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  rowStacked: {
    flexDirection: 'column',
  },
  label: {
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.inkSubtle,
    marginBottom: 2,
  },
  labelWide: {
    width: 190,
    marginBottom: 0,
  },
  value: {
    flex: 1,
    fontFamily: TYPOGRAPHY.sans,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.ink,
  },
});
