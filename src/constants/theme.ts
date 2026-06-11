import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0A0A0F', // Deep black
    textSecondary: '#5A5A73', // Muted violet-gray
    textMuted: '#8B8BA3', // Soft gray
    background: '#FAFAFA', // Near white
    cardBg: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(0, 0, 0, 0.06)',
    border: 'rgba(0, 0, 0, 0.06)',
    primary: '#009E7E', // Darker teal for contrast on white
    primaryGlow: 'rgba(0, 158, 126, 0.12)',
    accent: '#D4940D', // Darker gold for contrast on white
    accentGlow: 'rgba(212, 148, 13, 0.12)',
    success: '#22C55E',
    successGlow: 'rgba(34, 197, 94, 0.12)',
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.06)',
    tint: '#009E7E',
    tabIconDefault: '#8B8BA3',
    tabIconSelected: '#009E7E',
    gradientBg: ['#FAFAFA', '#F0F0F5', '#FAFAFA'],
  },
  dark: {
    text: '#F0F0F5', // Bright near-white
    textSecondary: '#8B8BA3', // Soft gray
    textMuted: '#5A5A73', // Muted violet-gray
    background: '#0A0A0F', // Deep black
    cardBg: 'rgba(18, 18, 28, 0.85)', // Dark card
    cardBorder: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.06)',
    primary: '#00D4AA', // Cyan/Teal
    primaryGlow: 'rgba(0, 212, 170, 0.15)',
    accent: '#FFB800', // Gold
    accentGlow: 'rgba(255, 184, 0, 0.15)',
    success: '#22C55E',
    successGlow: 'rgba(34, 197, 94, 0.15)',
    warning: '#FBBF24',
    shadow: 'rgba(0, 0, 0, 0.4)',
    tint: '#00D4AA',
    tabIconDefault: '#5A5A73',
    tabIconSelected: '#00D4AA',
    gradientBg: ['#0A0A0F', '#0F0F1A', '#0A0A0F'], // Deep dark gradients
  },
} as const;

export type ThemeType = 'light' | 'dark';
export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier New',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const GlassStyles = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  dark: {
    backgroundColor: 'rgba(18, 18, 28, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
