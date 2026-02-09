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
    FadeIn,
    FadeOut,
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

const SVG_SIZE = 192;
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 5; // Thinner strokes
const GAP = 10; // Smaller gaps

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
                                const radius = (SVG_SIZE - STROKE_WIDTH) / 2 - (index * (STROKE_WIDTH + GAP)) - 4;
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

                        {/* Dynamic Center Content */}
                        <View style={styles.centerContent}>
                            <Animated.Text
                                entering={FadeIn.duration(400)}
                                exiting={FadeOut.duration(200)}
                                key={`${activeItem.key}-val`}
                                style={[styles.centerValue, { color: colors.text }]}
                            >
                                {Math.round(activeItem.value)}
                            </Animated.Text>
                            <Animated.Text
                                entering={FadeIn.delay(100).duration(400)}
                                exiting={FadeOut.duration(200)}
                                key={`${activeItem.key}-label`}
                                style={[styles.centerLabel, { color: colors.text }]}
                            >
                                {activeItem.unit}
                            </Animated.Text>
                            <Animated.Text
                                entering={FadeIn.delay(200).duration(400)}
                                key={`${activeItem.key}-title`}
                                style={[styles.centerSubLabel, { color: colors.icon }]}
                            >
                                {activeItem.label.toUpperCase()}
                            </Animated.Text>
                        </View>
                    </AnimatedPressable>

                    <View style={styles.statsPanel}>
                        {data.map((item, index) => {
                            const pct = Math.round((item.value / (item.target || 1)) * 100);
                            const isActive = activeIndex === index;
                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => setActiveIndex(index)}
                                    style={({ pressed }) => [
                                        styles.statRow,
                                        isActive && [styles.activeStatRow, {
                                            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                            borderColor: item.colors[0] + '50'
                                        }],
                                        pressed && { opacity: 0.7 }
                                    ]}
                                >
                                    <View style={[styles.statDot, { backgroundColor: item.colors[0], shadowColor: item.colors[0] }]} />
                                    <View style={styles.statInfo}>
                                        <Text style={[
                                            styles.statLabel,
                                            { color: colors.text },
                                            isActive && { fontWeight: '700' }
                                        ]}>{item.label}</Text>
                                        <Text style={[styles.statValue, { color: colors.icon }]}>
                                            {Math.round(item.value)} / {item.target} {item.unit}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.statPercent, { color: item.colors[0] }]}>{pct}%</Text>
                                    </View>
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

    const trackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(223, 141, 223, 0.1)';

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
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    glassCard: {
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)', // Very subtle overlay
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
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
        width: 120, // ensure enough width for text not to wrap weirdly
    },
    centerValue: {
        fontSize: 36,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
        includeFontPadding: false,
    },
    centerLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    centerSubLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        opacity: 0.8,
    },
    statsPanel: {
        flex: 1,
        marginLeft: 20,
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeStatRow: {
        borderWidth: 1,
        // backgroundColor and borderColor handled dynamically in render
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 11,
        opacity: 0.8,
    },
    statPercent: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 8,
    },
});
