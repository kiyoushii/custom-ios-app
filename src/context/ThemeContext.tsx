import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Themes, ThemeType, ColorPalette } from '@/constants/theme';

interface ThemeContextProps {
  themeName: ThemeType;
  theme: ColorPalette;
  setThemeName: (name: ThemeType) => Promise<void>;
  availableThemes: Array<{ id: ThemeType; name: string }>;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const THEME_STORAGE_KEY = '@custom_app_selected_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeState] = useState<ThemeType>('classic');

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && Object.keys(Themes).includes(savedTheme)) {
        setThemeState(savedTheme as ThemeType);
      }
    } catch (e) {
      console.error('Failed to load saved theme:', e);
    }
  };

  const setThemeName = async (name: ThemeType) => {
    try {
      setThemeState(name);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  };

  const mode = systemColorScheme === 'dark' ? 'dark' : 'light';
  const theme = Themes[themeName][mode];

  const availableThemes = Object.keys(Themes).map(key => ({
    id: key as ThemeType,
    name: Themes[key as ThemeType].name,
  }));

  return (
    <ThemeContext.Provider value={{ themeName, theme, setThemeName, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  return context;
};
