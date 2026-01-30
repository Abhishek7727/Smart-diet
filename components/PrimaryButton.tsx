import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    style?: any;
}

export function PrimaryButton({ title, onPress, style }: PrimaryButtonProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]}>
            <LinearGradient
                colors={colors.primaryGradient as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={styles.text}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 30,
        overflow: 'hidden',
        height: 56,
        width: '100%',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
