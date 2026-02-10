import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const SPACER_WIDTH = (width - ITEM_WIDTH) / 2;

const DATA = [
    { id: 'breakfast', title: 'Breakfast', image: require('@/assets/images/breakfast_3d.png') },
    { id: 'lunch', title: 'Lunch', image: require('@/assets/images/lunch_3d.png') },
    { id: 'snacks', title: 'Snacks', image: require('@/assets/images/snacks_3d.png') },
    { id: 'dinner', title: 'Dinner', image: require('@/assets/images/dinner_3d.png') },
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
                    {/* 3D Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={item.image}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const MealCategoryCarousel = ({onPress}:{onPress: (data: any)=> void}) => {
    const scrollX = useSharedValue(0);

    const triggerHaptic = async() => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
        runOnJS(triggerHaptic)();
    });

    const handleNavigate = (id: string) => {
        onPress(id);
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
        marginTop: 4,
        marginBottom: 30,
        height: 220,

    },
    scrollContent: {
        alignItems: 'center',
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 204,
        marginHorizontal: 0, // Handled by snapToInterval logic mostly, but can add detailed spacing
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchable: {
        width: '90%',
        height: '100%',
        borderRadius: 20,
       
    },
    glassCard: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 4,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowOffset:{ width: 0, height: 10 },
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 20,

    },
    emojiText: {
        fontSize: 80,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 10 },
        textShadowRadius: 10,
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
