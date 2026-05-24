import '@/global.css';
import { Platform } from 'react-native';

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export interface ColorPalette {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  accent: string;
  border: string;
}

export type ThemeType = 'classic' | 'sunset' | 'forest' | 'aurora' | 'amethyst' | 'cyberpunk';

export const Themes: Record<ThemeType, { name: string; light: ColorPalette; dark: ColorPalette }> = {
  classic: {
    name: 'Графит (Классика)',
    light: {
      text: '#111827',
      background: '#F9FAFB',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#E5E7EB',
      textSecondary: '#4B5563',
      accent: '#6366F1',
      border: '#F3F4F6',
    },
    dark: {
      text: '#F9FAFB',
      background: '#111827',
      backgroundElement: '#1F2937',
      backgroundSelected: '#2E3135',
      textSecondary: '#9CA3AF',
      accent: '#818CF8',
      border: '#374151',
    },
  },
  sunset: {
    name: 'Закатная нега',
    light: {
      text: '#4C0519',
      background: '#FFF1F2',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#FFE4E6',
      textSecondary: '#BE123C',
      accent: '#F43F5E',
      border: '#FFE4E6',
    },
    dark: {
      text: '#FFF1F2',
      background: '#4C0519',
      backgroundElement: '#881337',
      backgroundSelected: '#9F1239',
      textSecondary: '#FDA4AF',
      accent: '#FB7185',
      border: '#9F1239',
    },
  },
  forest: {
    name: 'Изумрудный бор',
    light: {
      text: '#064E3B',
      background: '#F0FDF4',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#D1FAE5',
      textSecondary: '#047857',
      accent: '#10B981',
      border: '#E6FDF0',
    },
    dark: {
      text: '#ECFDF5',
      background: '#064E3B',
      backgroundElement: '#022C22',
      backgroundSelected: '#065F46',
      textSecondary: '#A7F3D0',
      accent: '#34D399',
      border: '#065F46',
    },
  },
  aurora: {
    name: 'Северное сияние',
    light: {
      text: '#0F172A',
      background: '#F0F9FF',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#E0F2FE',
      textSecondary: '#0369A1',
      accent: '#0284C7',
      border: '#E0F2FE',
    },
    dark: {
      text: '#F8FAFC',
      background: '#0B132B',
      backgroundElement: '#1C2541',
      backgroundSelected: '#3A506B',
      textSecondary: '#5BC0BE',
      accent: '#6FFFE9',
      border: '#1C2541',
    },
  },
  amethyst: {
    name: 'Аметист',
    light: {
      text: '#3B0764',
      background: '#FAF5FF',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#F3E8FF',
      textSecondary: '#701A75',
      accent: '#9333EA',
      border: '#F3E8FF',
    },
    dark: {
      text: '#FDF4FF',
      background: '#240046',
      backgroundElement: '#3C096C',
      backgroundSelected: '#5A189A',
      textSecondary: '#C77DFF',
      accent: '#E0AAFF',
      border: '#3C096C',
    },
  },
  cyberpunk: {
    name: 'Киберпанк',
    light: {
      text: '#000000',
      background: '#FFF5F5',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#FFE3E3',
      textSecondary: '#C92A2A',
      accent: '#E03131',
      border: '#FFE3E3',
    },
    dark: {
      text: '#00FFCC',
      background: '#0D0E15',
      backgroundElement: '#171923',
      backgroundSelected: '#2D3748',
      textSecondary: '#90CDF4',
      accent: '#FF007F',
      border: '#171923',
    },
  },
};

export const Colors = {
  light: Themes.classic.light,
  dark: Themes.classic.dark,
} as const;

export type ThemeColor = keyof ColorPalette;
