/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#8B5CF6'; // Soft Purple
const tintColorDark = '#A78BFA'; // Lighter Purple for dark mode

export const Colors = {
  light: {
    text: '#1F2937', // Dark Gray/Purple
    background: '#F3E8FF', // Lavender
    tint: tintColorLight,
    icon: '#6B7280', // Gray 500
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    primary: '#8B5CF6', // Purple 500
    primaryGradient: ['#8B5CF6', '#C084FC'], // Purple Gradient
    secondary: '#EC4899', // Pink 500
    surface: '#FFFFFF',
    surfaceHighlight: 'rgba(255, 255, 255, 0.4)',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    border: 'rgba(139, 92, 246, 0.1)', // Purple tint border
    shadow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1,
    }
  },
  dark: {
    text: '#F9FAFB', // Cool White
    background: '#111827', // Deep Gray
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    primary: '#A78BFA', // Purple 400
    primaryGradient: ['#7C3AED', '#A78BFA'],
    secondary: '#F472B6', // Pink 400
    surface: '#1F2937',
    surfaceHighlight: 'rgba(255, 255, 255, 0.05)',
    danger: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    border: 'rgba(139, 92, 246, 0.2)',
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
    glass: {
      backgroundColor: 'rgba(31, 41, 55, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    }
  },
};
