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
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
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

// Premium colors matching app theme
const RING_COLORS = {
    calories: ['#FF6B6B', '#FF8E53'],
    protein: ['#4ECDC4', '#45B7AA'],
    carbs: ['#A78BFA', '#8B5CF6'],
    fat: ['#F472B6', '#EC4899'],
};

const SVG_SIZE = 100;
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 5; // Thinner strokes
const GAP = 12; // Smaller gaps

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

    const handleChartPress = () => {
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
            </View>

            <BlurView
                intensity={colorScheme === 'dark' ? 40 : 60}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={[styles.glassCard, { borderColor: colors.border }]}
            >
                <View style={[styles.glassOverlay, {
                    backgroundColor: colorScheme === 'dark'
                        ? 'rgba(31, 41, 55, 0.5)'
                        : 'rgba(255, 255, 255, 0.7)'
                }]} />

                <View style={styles.contentRow}>
                    {/* Left: Chart */}
                    <AnimatedPressable onPress={handleChartPress} style={[styles.chartWrapper, containerAnimatedStyle]}>
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

                        {/* Minimal center - just calories */}
                        <View style={styles.centerContent}>
                            <Text style={[styles.centerValue, { color: colors.text }]}>
                                {Math.round(calories)}
                            </Text>
                            <Text style={[styles.centerUnit, { color: colors.icon }]}>kcal</Text>
                        </View>
                    </AnimatedPressable>

                    {/* Right: Stats Panel */}
                    <View style={styles.statsPanel}>
                        {data.map((item, index) => {
                            const pct = Math.round((item.value / (item.target || 1)) * 100);
                            const isActive = activeIndex === index;
                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => setActiveIndex(index)}
                                    style={[
                                        styles.statRow,
                                        isActive && { backgroundColor: item.colors[0] + '15' }
                                    ]}
                                >
                                    <View style={[styles.statDot, { backgroundColor: item.colors[0] }]} />
                                    <View style={styles.statInfo}>
                                        <Text style={[styles.statLabel, { color: colors.text }]}>{item.label}</Text>
                                        <Text style={[styles.statValue, { color: colors.icon }]}>
                                            {Math.round(item.value)}{item.unit === 'kcal' ? '' : 'g'} / {item.target}{item.unit === 'kcal' ? '' : 'g'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.statPercent, { color: item.colors[0] }]}>{pct}%</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

const RingSegment = ({ radius, circumference, gradientId, animValue, isActive, colorScheme }: any) => {
    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animValue.value),
    }));

    const trackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    return (
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            <Circle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={trackColor}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
            />
            <AnimatedCircle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={`url(#${gradientId})`}
                strokeWidth={isActive ? STROKE_WIDTH + 5 : STROKE_WIDTH}
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
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    chartWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerValue: {
        fontSize: 26,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
    },
    centerUnit: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsPanel: {
        flex: 1,
        marginLeft: 12,
        gap: 8,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 11,
        marginTop: 1,
    },
    statPercent: {
        fontSize: 14,
        fontWeight: '800',
    },
});
