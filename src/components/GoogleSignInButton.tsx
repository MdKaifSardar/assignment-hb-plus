import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { GoogleIcon } from './GoogleIcon';
import { COLORS, MIN_TOUCH_TARGET, TYPOGRAPHY } from '../constants/theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  text?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  text = 'Continue with Google',
}) => {
  const inactive = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.button,
        (hovered || pressed) && styles.buttonActive,
        inactive && styles.buttonInactive,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.inkMuted} style={styles.icon} />
      ) : (
        <GoogleIcon size={18} />
      )}
      <Text style={styles.text}>{isLoading ? 'Redirecting to Google…' : text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET + 4,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 4,
  },
  buttonActive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#BDC1C6',
  },
  buttonInactive: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 0,
  },
  text: {
    marginLeft: 12,
    color: '#3C4043',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    fontFamily: Platform.select({ web: 'Roboto, Arial, sans-serif', default: TYPOGRAPHY.sans }),
    letterSpacing: 0.25,
  },
});
