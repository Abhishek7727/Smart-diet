import { Colors } from '@/constants/Colors';
import { View, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from 'react-native';

interface GlassInputProps extends React.ComponentProps<typeof TextInput> {
    icon?: string;
    label?: string;
}

export function GlassInput({ icon, label, style, ...props }: GlassInputProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>
                    {label}
                </Text>
            )}
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
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        // marginBottom removed from here as it's now on wrapper
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
