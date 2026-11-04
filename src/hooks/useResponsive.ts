import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isMobileView: boolean;
  isTabletView: boolean;
  isDesktopView: boolean;
  maxContentWidth: number;
}

export function useResponsive(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  const isMobileView = width < 640;
  const isTabletView = width >= 640 && width < 1024;
  const isDesktopView = width >= 1024;

  const maxContentWidth = Math.min(width - (isMobileView ? 32 : 64), 960);

  return {
    width,
    height,
    isMobileView,
    isTabletView,
    isDesktopView,
    maxContentWidth,
  };
}
