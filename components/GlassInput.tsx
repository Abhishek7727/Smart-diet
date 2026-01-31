import { Colors } from '@/constants/Colors';
import { View, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassInputProps extends React.ComponentProps<typeof TextInput> {
    icon?: string;
}

export function GlassInput({ icon, style, ...props }: GlassInputProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <View style={[styles.container, {
            backgroundColor: colors.surfaceHighlight,
            borderColor: colors.glass.borderColor,
            borderWidth: 1,
        }, style]}>
            {icon && <Ionicons name={icon as any} size={20} color={colors.icon} style={styles.icon} />}
            <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholderTextColor={colors.icon}
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
});
