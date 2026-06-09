import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textMuted: '#94A3B8', // Slate 400
    background: '#F8FAFC', // Slate 50
    cardBg: 'rgba(255, 255, 255, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.5)',
    border: 'rgba(15, 23, 42, 0.08)',
    primary: '#6366F1', // Indigo 500
    primaryGlow: 'rgba(99, 102, 241, 0.15)',
    accent: '#EC4899', // Pink 500
    accentGlow: 'rgba(236, 72, 153, 0.15)',
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    shadow: 'rgba(15, 23, 42, 0.06)',
    tint: '#6366F1',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#6366F1',
    gradientBg: ['#EEF2F6', '#E2E8F0', '#EEF2F6'],
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    background: '#0B0F19', // Deep Midnight Blue
    cardBg: 'rgba(15, 23, 42, 0.45)', // Translucent Slate 900
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.05)',
    primary: '#818CF8', // Indigo 400
    primaryGlow: 'rgba(129, 140, 248, 0.25)',
    accent: '#F472B6', // Pink 400
    accentGlow: 'rgba(244, 114, 182, 0.25)',
    success: '#34D399',
    successGlow: 'rgba(52, 211, 153, 0.25)',
    warning: '#FBBF24',
    shadow: 'rgba(0, 0, 0, 0.3)',
    tint: '#818CF8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
    gradientBg: ['#0B0F19', '#111827', '#070A13'], // Ambient dark gradients
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1.5,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },
  dark: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
