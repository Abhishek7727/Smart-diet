import { Colors } from '@/constants/Colors';
import { View, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlassInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: string;
    secureTextEntry?: boolean;
}

export function GlassInput({ placeholder, value, onChangeText, icon, secureTextEntry }: GlassInputProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <View style={[styles.container, {
            backgroundColor: colors.surfaceHighlight,
            borderColor: colors.glass.borderColor,
            borderWidth: 1,
        }]}>
            {icon && <Ionicons name={icon as any} size={20} color={colors.icon} style={styles.icon} />}
            <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={placeholder}
                placeholderTextColor={colors.icon}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
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
