import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: any;
}

export function GlassCard({ children, style }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <View style={[styles.container, style]}>
            {Platform.OS !== 'web' ? (
                <BlurView intensity={20} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={[styles.content, {
                backgroundColor: colors.glass.backgroundColor,
                borderColor: colors.glass.borderColor,
                borderWidth: colors.glass.borderWidth
            }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 16,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Shadow for Android
        elevation: 3,
    },
    content: {
        padding: 20,
        borderRadius: 24,
    },
});
