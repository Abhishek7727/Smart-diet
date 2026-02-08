import { TouchableOpacity, StyleSheet, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

const AiIconButton = ({ aiFunction }: { aiFunction?: () => Promise<void> }) => {
    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Animation Values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (loading) {
            // Pulse Animation
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 500, easing: Easing.ease }),
                    withTiming(1, { duration: 500, easing: Easing.ease })
                ),
                -1, // Infinite
                true // Reverse
            );
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 500, easing: Easing.ease }),
                    withTiming(1, { duration: 500, easing: Easing.ease })
                ),
                -1,
                true
            );
        } else {
            scale.value = withTiming(1);
            opacity.value = withTiming(1);
        }
    }, [loading]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const handlePress = async () => {
        if (loading) return;
        try {
            setLoading(true);
            await aiFunction?.();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <Animated.View style={[styles.container, animatedStyle]}>
                <LinearGradient
                    colors={['#8B5CF6', '#EC4899', '#3B82F6']} // Purple -> Pink -> Blue
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Ionicons name="sparkles" size={16} color="white" />
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        marginLeft: 8,
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export { AiIconButton };