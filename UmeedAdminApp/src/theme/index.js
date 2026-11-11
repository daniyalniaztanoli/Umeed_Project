import { colors, statusColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenX: 20,
  screenTop: 60,
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 13,
  body: 14,
  base: 15,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 26,
};

export const radii = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 999,
};

export const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: radii.xl,
  padding: spacing.lg,
  marginBottom: spacing.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
};

export const screenStyle = {
  flex: 1,
  backgroundColor: colors.background,
};

export { colors, statusColors };
