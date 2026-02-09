import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { checkDailyReset } from '@/store/mealsSlice';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';

import { MealPlanProvider } from '@/components/MealPlanContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function AuthProtection({ children }: { children: React.ReactNode }) {
  const segments = useSegments() as string[];
  const router = useRouter();
  const { isAuthenticated, isOnboarded } = useSelector((state: any) => state.user);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Check for daily reset on mount
    store.dispatch(checkDailyReset());

    // Check for daily reset when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        store.dispatch(checkDailyReset());
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments.length > 1 && segments[0] === 'auth' && segments[1] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/auth/login');
    } else if (isAuthenticated && !isOnboarded && !inOnboarding) {
      // Redirect to onboarding if authenticated but not onboarded
      router.replace('/auth/onboarding');
    } else if (isAuthenticated && isOnboarded && inAuthGroup) {
      // Redirect to home if authenticated and setup is done
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !isOnboarded && !inAuthGroup) {
      // Handle case where user wiped data or fresh install but not in auth
      router.replace('/auth/register');
    }
  }, [isAuthenticated, segments, isMounted, isOnboarded]);

  if (!isMounted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <MealPlanProvider>
            <AuthProtection>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="profile/edit" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="profile/help" options={{ title: 'Help & Support' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </AuthProtection>
          </MealPlanProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
