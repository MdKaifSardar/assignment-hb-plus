import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { GoogleIcon } from './GoogleIcon';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text?: string;
  style?: ViewStyle;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  text = 'Continue with Google',
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      // @ts-ignore react-native-web only: hover events are missing from RN types
      onMouseEnter={() => setIsHovered(true)}
      // @ts-ignore react-native-web only: hover events are missing from RN types
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.button,
        isHovered && styles.buttonHovered,
        (disabled || isLoading) && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.slate[600]} size="small" style={styles.spinner} />
      ) : (
        <GoogleIcon size={20} />
      )}
      <Text style={[styles.text, (disabled || isLoading) && styles.textDisabled]}>
        {isLoading ? 'Connecting to Google...' : text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.xl,
    minHeight: 48,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        boxShadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  buttonHovered: Platform.select({
    web: {
      backgroundColor: '#F8FAFC',
      borderColor: '#CBD5E1',
      boxShadow: '0 1px 3px 1px rgba(60, 64, 67, 0.2)',
    },
    default: {},
  }),
  buttonDisabled: {
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed' as any,
      },
      default: {},
    }),
  },
  spinner: {
    marginRight: 12,
  },
  text: {
    color: '#3C4043',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    fontFamily: Platform.select({
      web: 'Roboto, -apple-system, sans-serif',
      default: TYPOGRAPHY.fontFamily,
    }),
  },
  textDisabled: {
    color: '#80868B',
  },
});
