import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.7;
const SPACING = 12;
const SPACER_WIDTH = (width - ITEM_WIDTH) / 2;

const DATA = [
    { id: 'breakfast', title: 'Breakfast', image: require('@/assets/images/icon.png') }, // Placeholders
    { id: 'lunch', title: 'Lunch', image: require('@/assets/images/icon.png') },
    { id: 'snacks', title: 'Snacks', image: require('@/assets/images/icon.png') },
    { id: 'dinner', title: 'Dinner', image: require('@/assets/images/icon.png') },
];

// 3D Card Component
const CarouselItem = ({ item, index, scrollX, onNavigate }: { item: any, index: number, scrollX: Animated.SharedValue<number>, onNavigate: (id: string) => void }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
        ];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.9, 1, 0.9],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.6, 1, 0.6],
            Extrapolation.CLAMP
        );

        const rotateY = interpolate(
            scrollX.value,
            inputRange,
            [15, 0, -15], // Rotate slightly for 3D effect
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { perspective: 1000 },
                { scale },
                { rotateY: `${rotateY}deg` },
            ],
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onNavigate(item.id)}
                style={styles.touchable}
            >
                <BlurView
                    intensity={colorScheme === 'dark' ? 30 : 80}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={[styles.glassCard, { borderColor: colors.border }]}
                >
                    {/* 3D Image Placeholder */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={item.image}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>Tap to Log</Text>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const MealCategoryCarousel = () => {
    const scrollX = useSharedValue(0);
    const router = useRouter();

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const handleNavigate = (id: string) => {
        // Navigate to Meals tab and trigger modal
        // We pass params to the tab screen. 
        // Note: expo-router with tabs usually requires jumping to the tab first.
        // We'll use router.push with params, targeting the meals route.
        router.push({
            pathname: '/(tabs)/meals',
            params: { openModal: 'ai', mealType: id }
        });
    };

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <View style={{ width: SPACER_WIDTH }} />
                {DATA.map((item, index) => (
                    <CarouselItem
                        key={item.id}
                        item={item}
                        index={index}
                        scrollX={scrollX}
                        onNavigate={handleNavigate}
                    />
                ))}
                <View style={{ width: SPACER_WIDTH }} />
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        height: 220,
    },
    scrollContent: {
        alignItems: 'center',
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 200,
        marginHorizontal: 0, // Handled by snapToInterval logic mostly, but can add detailed spacing
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchable: {
        width: '90%',
        height: '100%',
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10.00,
        elevation: 12,
    },
    glassCard: {
        flex: 1,
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    imageContainer: {
        width: 100,
        height: 100,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
});
