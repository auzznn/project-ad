import { useTheme } from '@/context/ThemeContext';
import { ThemeColors } from '@/constants/colors';

export const useThemeColor = (colorKey: keyof ThemeColors) => {
  const { theme } = useTheme();
  return theme[colorKey];
};