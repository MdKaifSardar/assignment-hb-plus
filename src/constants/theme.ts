import { Platform } from 'react-native';

export const COLORS = {
  paper: '#F6F4EF',
  surface: '#FFFFFF',
  ink: '#1C1B18',
  inkMuted: '#4A4740',
  inkSubtle: '#6F6B62',
  line: '#E3DFD5',
  lineStrong: '#CFC9BB',
  accent: '#1F6F54',
  accentDark: '#175640',
  accentSoft: '#E4EFE9',
  danger: '#A8271C',
  dangerSoft: '#FBEAE7',
  warning: '#7A5200',
  warningSoft: '#FAF0D9',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

export const TYPOGRAPHY = {
  sans: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    ios: 'System',
    default: 'Roboto',
  }),
  serif: Platform.select({
    web: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    ios: 'Georgia',
    default: 'serif',
  }),
  sizes: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 18,
    xl: 22,
    xxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
} as const;

export const MIN_TOUCH_TARGET = 44;
