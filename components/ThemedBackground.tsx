import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme, View, StyleSheet } from 'react-native';

interface ThemedBackgroundProps {
    children: React.ReactNode;
}

export function ThemedBackground({ children }: ThemedBackgroundProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const gradientColors: [string, string, ...string[]] = colorScheme === 'dark'
        ? [colors.background, '#1F1F38']
        : ['#EBE0F8', '#F3E8FF']; // Lavender Light Gradient

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <View style={[styles.content, { backgroundColor: 'transparent' }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
