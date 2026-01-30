/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#10B981'; // Emerald 500
const tintColorDark = '#34D399'; // Emerald 400

export const Colors = {
  light: {
    text: '#1E293B', // Slate 800
    background: '#FAFAFA', // Zinc 50
    tint: tintColorLight,
    icon: '#64748B', // Slate 500
    tabIconDefault: '#94A3B8', // Slate 400
    tabIconSelected: tintColorLight,
    primary: '#10B981', // Emerald 500
    secondary: '#F97316', // Orange 500
    surface: '#FFFFFF',
    surfaceHighlight: '#F1F5F9', // Slate 100
    danger: '#EF4444', // Red 500
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    border: '#E2E8F0', // Slate 200
  },
  dark: {
    text: '#F1F5F9', // Slate 100
    background: '#0F172A', // Slate 900
    tint: tintColorDark,
    icon: '#94A3B8', // Slate 400
    tabIconDefault: '#64748B', // Slate 500
    tabIconSelected: tintColorDark,
    primary: '#34D399', // Emerald 400
    secondary: '#FB923C', // Orange 400
    surface: '#1E293B', // Slate 800
    surfaceHighlight: '#334155', // Slate 700
    danger: '#F87171', // Red 400
    success: '#34D399', // Emerald 400
    warning: '#FBBF24', // Amber 400
    border: '#334155', // Slate 700
  },
};
