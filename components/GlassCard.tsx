import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, useColorScheme, Platform, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export function GlassCard({ children, style }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const flatStyle = StyleSheet.flatten(style) || {};

    // Split styles between Outer(Shadow/Layout) and Inner(Content/Padding/FlexChildren)

    // Explicit list of keys to keep on Outer Container
    // These affect the card's position and size in the parent
    const containerKeys = [
        'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
        'margin', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
        'flex', 'flexGrow', 'flexShrink', 'flexBasis',
        'alignSelf', 'position', 'top', 'bottom', 'left', 'right', 'zIndex',
        'transform', 'borderRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'
    ];

    const containerStyle: any = Object.keys(flatStyle).reduce((acc: any, key) => {
        if (containerKeys.includes(key)) {
            acc[key] = flatStyle[key as keyof typeof flatStyle];
        }
        return acc;
    }, {});

    // Remaining keys go to Content Container (Padding, FlexDirection for children, Justify, Align for children, etc.)
    // Note: Background color and border are handled explicitly by Glass Theme
    const contentStyle: any = Object.keys(flatStyle).reduce((acc: any, key) => {
        if (!containerKeys.includes(key) && key !== 'backgroundColor' && key !== 'borderWidth' && key !== 'borderColor') {
            acc[key] = flatStyle[key as keyof typeof flatStyle];
        }
        return acc;
    }, {});


    // Default radius logic
    const borderRadius = containerStyle.borderRadius !== undefined ? containerStyle.borderRadius : 24;

    // Ensure outer container has radius for shadow
    const finalContainerStyle = {
        ...containerStyle,
        borderRadius,
    };

    return (
        <View style={[styles.shadowContainer, finalContainerStyle]}>
            {/* Overflow Container clips the BlurView and Content */}
            <View style={[styles.overflowContainer, {
                backgroundColor: colors.glass.backgroundColor,
                borderColor: colors.glass.borderColor,
                borderWidth: colors.glass.borderWidth,
                borderRadius: borderRadius,
            }]}>
                {Platform.OS !== 'web' ? (
                    <BlurView intensity={20} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                ) : null}
                <View style={[styles.content, contentStyle]}>
                    {children}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    shadowContainer: {
        marginBottom: 16, // Default margin, override-able
        backgroundColor: 'transparent',
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
        flex: 1, // Ensure it fills the space if needed
    },
});
