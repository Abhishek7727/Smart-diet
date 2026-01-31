import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { ThemedBackground } from '@/components/ThemedBackground';

interface ScreenWrapperProps extends SafeAreaViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function ScreenWrapper({ children, style, edges = ['top', 'left', 'right'], ...props }: ScreenWrapperProps) {
    return (
        <ThemedBackground>
            <SafeAreaView
                style={[styles.safeArea, style]}
                edges={edges}
                {...props}
            >
                {children}
            </SafeAreaView>
        </ThemedBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
});
