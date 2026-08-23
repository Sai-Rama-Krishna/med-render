import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { lightTheme, darkTheme, ThemeColors } from '../constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';
const THEME_FILE = FileSystem.documentDirectory + 'theme_prefs.json';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  colors: lightTheme,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const fileInfo = await FileSystem.getInfoAsync(THEME_FILE);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(THEME_FILE);
          const { savedMode } = JSON.parse(content);
          if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
            setModeState(savedMode);
          }
        }
      } catch (e) {
        // ignore errors
      } finally {
        setIsReady(true);
      }
    }
    loadTheme();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await FileSystem.writeAsStringAsync(THEME_FILE, JSON.stringify({ savedMode: newMode }));
    } catch (e) {
      // ignore
    }
  };

  const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  if (!isReady) return null; // Avoid flicker

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
