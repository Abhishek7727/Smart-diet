/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#D4FF00'; // Neon Lime
const tintColorDark = '#D4FF00'; // Neon Lime

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#050511', // Deep Dark Blue/Black
    tint: tintColorLight,
    icon: '#A0A0A0',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorLight,
    primary: '#D4FF00', // Neon Lime
    secondary: '#FF5500', // Neon Orange
    tertiary: '#00FFFF', // Neon Cyan
    surface: 'rgba(30, 41, 59, 0.7)', // Translucent dark slate
    surfaceHighlight: 'rgba(255, 255, 255, 0.05)',
    danger: '#FF3333',
    success: '#00FF99', // Neon Green
    warning: '#FFCC00',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: {
      shadowColor: '#D4FF00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    glass: {
      backgroundColor: 'rgba(20, 20, 30, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 0.5,
    }
  },
  dark: {
    text: '#FFFFFF',
    background: '#050511', // Deep Dark Blue/Black
    tint: tintColorDark,
    icon: '#A0A0A0',
    tabIconDefault: '#94A3B8', // Slate 400
    tabIconSelected: tintColorDark,
    primary: '#D4FF00', // Neon Lime
    secondary: '#FF5500', // Neon Orange
    tertiary: '#00FFFF', // Neon Cyan
    surface: 'rgba(30, 41, 59, 0.7)', // Translucent dark slate
    surfaceHighlight: 'rgba(255, 255, 255, 0.05)',
    danger: '#FF3333',
    success: '#00FF99', // Neon Green
    warning: '#FFCC00',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: {
      shadowColor: '#D4FF00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    glass: {
      backgroundColor: 'rgba(20, 20, 30, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 0.5,
    }
  },
};
