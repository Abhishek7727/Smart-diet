import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { Platform, StyleProp, StyleSheet, useColorScheme, View, ViewStyle, TouchableOpacity } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export function GlassCard({ children, style, onPress }: GlassCardProps) {
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

    const Container = onPress ? TouchableOpacity : View;

    return (
        // @ts-ignore
        <Container style={[styles.shadowContainer, finalContainerStyle]} onPress={onPress} activeOpacity={0.7}>
            {/* Overflow Container clips the BlurView and Content */}
            <View style={[styles.overflowContainer, {
                backgroundColor: colors.glass.backgroundColor,
                borderColor: colors.glass.borderColor,
                borderWidth: colors.glass.borderWidth,
                borderRadius: borderRadius,
            }]}>
                {Platform.OS !== 'web' ? (
                    // @ts-ignore
                    <BlurView intensity={20} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                ) : null}
                <View style={[styles.content, contentStyle]}>
                    {children}
                </View>
            </View>
        </Container>
    );
}


const styles = StyleSheet.create({
    shadowContainer: {
        marginBottom: 16, // Default margin, override-able
        backgroundColor: 'transparent',
        // borderColor: removed here, handled by final style
        borderWidth: 0,
        borderRadius: 4,
    },
    overflowContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    content: {
        flex: 1, // Ensure it fills the space if needed
    },
});
