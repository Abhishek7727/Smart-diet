import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, useColorScheme, Platform, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void; // Add definition to fix lint, though strictly it should be on Touchable wrapper
}

export function GlassCard({ children, style }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Flatten style to ensure we can split specific layout/spacing props
    const flatStyle = StyleSheet.flatten(style) || {};

    // Extract padding properties to apply to internal content container
    const {
        padding,
        paddingHorizontal,
        paddingVertical,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        borderRadius,
        ...otherStyles
    } = flatStyle;

    // Default radius
    const radius = typeof borderRadius === 'number' ? borderRadius : 24;

    const paddingStyles = {
        padding,
        paddingHorizontal,
        paddingVertical,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
    };

    return (
        <View style={[styles.shadowContainer, otherStyles, { borderRadius: radius, overflow: 'visible', backgroundColor: 'transparent', borderWidth: 0 }]}>
            <View style={[styles.overflowContainer, {
                backgroundColor: colors.glass.backgroundColor,
                borderColor: colors.glass.borderColor,
                borderWidth: colors.glass.borderWidth,
                borderRadius: radius,
            }]}>
                {Platform.OS !== 'web' ? (
                    <BlurView intensity={20} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                ) : null}
                <View style={[styles.content, paddingStyles]}>
                    {children}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    shadowContainer: {
        marginBottom: 16, // Default margin, can be overridden by otherStyles
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Shadow for Android
        elevation: 5,
    },
    overflowContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    content: {
        // Padding is now injected dynamically
    },
});
