import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    withDelay,
    interpolateColor
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CalorieMeterProps {
    calories: number;
    target: number;
    protein: number;
    proteinTarget: number;
    carbs: number;
    carbsTarget: number;
    fat: number;
    fatTarget: number;
}

// Premium Theme matching app colors
const RING_COLORS = {
    calories: ['#FF6B6B', '#FF8E53'], // Warm coral-orange
    protein: ['#4ECDC4', '#45B7AA'],  // Teal
    carbs: ['#A78BFA', '#8B5CF6'],    // Purple (matches app theme)
    fat: ['#F472B6', '#EC4899'],      // Pink (matches app secondary)
};

const SVG_SIZE = 220;
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 12;
const GAP = 6;

export const CalorieMeter: React.FC<CalorieMeterProps> = ({
    calories, target, protein, proteinTarget, carbs, carbsTarget, fat, fatTarget,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const [activeIndex, setActiveIndex] = useState(0);

    const data = [
        { key: 'calories', label: 'Calories', value: calories, target: target, unit: 'kcal', colors: RING_COLORS.calories, icon: 'flame' },
        { key: 'protein', label: 'Protein', value: protein, target: proteinTarget, unit: 'g', colors: RING_COLORS.protein, icon: 'barbell' },
        { key: 'carbs', label: 'Carbs', value: carbs, target: carbsTarget, unit: 'g', colors: RING_COLORS.carbs, icon: 'nutrition' },
        { key: 'fat', label: 'Fat', value: fat, target: fatTarget, unit: 'g', colors: RING_COLORS.fat, icon: 'water' },
    ];

    // Animation values
    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);
    const anim3 = useSharedValue(0);
    const anim4 = useSharedValue(0);
    const animatedValues = [anim1, anim2, anim3, anim4];

    const pulseScale = useSharedValue(1);

    useEffect(() => {
        data.forEach((item, index) => {
            const progress = Math.min(Math.max(item.value / (item.target || 1), 0), 1);
            animatedValues[index].value = withDelay(index * 150, withTiming(progress, {
                duration: 1200,
                easing: Easing.out(Easing.cubic),
            }));
        });
    }, [calories, protein, carbs, fat, target]);

    // Pulse animation on tap
    const handlePress = () => {
        pulseScale.value = withSpring(0.97, { damping: 15 }, () => {
            pulseScale.value = withSpring(1, { damping: 10 });
        });
        setActiveIndex((prev) => (prev + 1) % data.length);
    };

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const activeItem = data[activeIndex];
    const progressPercent = Math.round((activeItem.value / (activeItem.target || 1)) * 100);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Progress</Text>
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>Live</Text>
                </View>
            </View>

            <AnimatedPressable onPress={handlePress} style={containerAnimatedStyle}>
                <View style={[styles.card, colors.glass, { borderColor: colors.border }]}>
                    <View style={styles.chartArea}>
                        <Svg width={SVG_SIZE} height={SVG_SIZE}>
                            <Defs>
                                {data.map((item) => (
                                    <SvgLinearGradient key={`grad-${item.key}`} id={`grad-${item.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <Stop offset="0%" stopColor={item.colors[0]} />
                                        <Stop offset="100%" stopColor={item.colors[1]} />
                                    </SvgLinearGradient>
                                ))}
                            </Defs>

                            {data.map((item, index) => {
                                const radius = (SVG_SIZE - STROKE_WIDTH) / 2 - (index * (STROKE_WIDTH + GAP));
                                const circumference = 2 * Math.PI * radius;
                                return (
                                    <RingSegment
                                        key={item.key}
                                        radius={radius}
                                        circumference={circumference}
                                        gradientId={`grad-${item.key}`}
                                        animValue={animatedValues[index]}
                                        isActive={activeIndex === index}
                                        colorScheme={colorScheme}
                                    />
                                );
                            })}
                        </Svg>

                        {/* Center Content */}
                        <View style={styles.centerContent}>
                            <LinearGradient
                                colors={activeItem.colors}
                                style={styles.iconBadge}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={activeItem.icon as any} size={20} color="#fff" />
                            </LinearGradient>
                            <Text style={[styles.centerValue, { color: colors.text }]}>
                                {Math.round(activeItem.value)}
                            </Text>
                            <Text style={[styles.centerUnit, { color: colors.icon }]}>
                                / {activeItem.target} {activeItem.unit}
                            </Text>
                            <View style={[styles.progressPill, { backgroundColor: activeItem.colors[0] + '20' }]}>
                                <Text style={[styles.progressText, { color: activeItem.colors[0] }]}>
                                    {progressPercent}%
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
                        {data.map((item, index) => (
                            <Pressable
                                key={item.key}
                                onPress={() => setActiveIndex(index)}
                                style={[
                                    styles.legendItem,
                                    activeIndex === index && {
                                        backgroundColor: item.colors[0] + '15',
                                        borderColor: item.colors[0] + '40',
                                    }
                                ]}
                            >
                                <View style={[styles.legendDot, { backgroundColor: item.colors[0] }]} />
                                <Text style={[styles.legendLabel, { color: colors.icon }]}>{item.label}</Text>
                                <Text style={[styles.legendValue, { color: colors.text }]}>
                                    {Math.round(item.value / (item.target || 1) * 100)}%
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </AnimatedPressable>
        </View>
    );
};

// Ring Segment Component
const RingSegment = ({ radius, circumference, gradientId, animValue, isActive, colorScheme }: any) => {
    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animValue.value),
    }));

    const trackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    return (
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            {/* Track */}
            <Circle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={trackColor}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
            />
            {/* Progress */}
            <AnimatedCircle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={`url(#${gradientId})`}
                strokeWidth={isActive ? STROKE_WIDTH + 2 : STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={[circumference, circumference]}
                animatedProps={animatedProps}
                fill="transparent"
            />
        </G>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
    },
    chartArea: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        position: 'relative',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    centerValue: {
        fontSize: 28,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
        letterSpacing: -1,
    },
    centerUnit: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    progressPill: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    progressText: {
        fontSize: 11,
        fontWeight: '700',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderTopWidth: 1,
    },
    legendItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        minWidth: 68,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 4,
    },
    legendLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 2,
    },
    legendValue: {
        fontSize: 12,
        fontWeight: '700',
    },
});
