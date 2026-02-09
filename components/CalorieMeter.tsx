import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
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
    withSequence,
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

// Modern Neon-Pastel Palette
const RING_COLORS = {
    calories: ['#EF4444', '#F87171'], // Fiery Red
    protein: ['#3B82F6', '#60A5FA'], // Electric Blue
    carbs: ['#10B981', '#34D399'],   // Neon Green
    fat: ['#F59E0B', '#FBBF24'],      // Sunset Orange
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SVG_SIZE = SCREEN_WIDTH - 60; // Responsive width
const RADIUS = (SVG_SIZE) / 2;
const STROKE_WIDTH = 12;
const GAP = 14;
// Calculate max radius needed (4 RINGS)
// r1 (outer), r2, r3, r4 (inner)
// radius = available / 2
// We need semi-circle height = radius + stroke
const MAX_RADIUS = RADIUS - 10;

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

    const animValues = data.map(() => useSharedValue(0));
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        data.forEach((item, index) => {
            const progress = Math.min(Math.max(item.value / (item.target || 1), 0), 1);
            animValues[index].value = withDelay(index * 200, withTiming(progress, {
                duration: 1500,
                easing: Easing.out(Easing.exp),
            }));
        });
    }, [calories, protein, carbs, fat, target]);

    const handleChartPress = () => {
        // Haptic feedback visual
        pulseScale.value = withSequence(
            withSpring(0.95, { damping: 10 }),
            withSpring(1, { damping: 10 })
        );

        setActiveIndex((prev) => (prev + 1) % data.length);
    };

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const activeItem = data[activeIndex];

    // Calculate aspect ratio for semi-circle (Height is approx Width/2)
    const svgHeight = MAX_RADIUS + STROKE_WIDTH + 20; // Extra padding

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Metrics</Text>
            </View>

            <BlurView
                intensity={colorScheme === 'dark' ? 30 : 70}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={[styles.glassCard, { borderColor: colors.border }]}
            >
                <View style={styles.contentColumn}>
                    <AnimatedPressable onPress={handleChartPress} style={[styles.chartWrapper, containerAnimatedStyle]}>
                        <Svg width={SVG_SIZE} height={svgHeight} viewBox={`0 0 ${SVG_SIZE} ${svgHeight}`}>
                            <Defs>
                                {data.map((item) => (
                                    <SvgLinearGradient key={`grad-${item.key}`} id={`grad-${item.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                        <Stop offset="0%" stopColor={item.colors[0]} />
                                        <Stop offset="100%" stopColor={item.colors[1]} />
                                    </SvgLinearGradient>
                                ))}
                            </Defs>

                            {/* Group shifted to center horizontally and maximize vertical usage */}
                            <G x={SVG_SIZE / 2} y={svgHeight - 10} rotation="-180">
                                {data.map((item, index) => {
                                    // Outer to Inner
                                    const currentRadius = MAX_RADIUS - (index * (STROKE_WIDTH + GAP));
                                    const circumference = Math.PI * currentRadius; // Semi-circle length basically
                                    const fullCircumference = 2 * Math.PI * currentRadius;

                                    return (
                                        <RingSegment
                                            key={item.key}
                                            radius={currentRadius}
                                            fullCircumference={fullCircumference}
                                            semiCircumference={circumference}
                                            strokeWidth={STROKE_WIDTH}
                                            gradientId={`grad-${item.key}`}
                                            animValue={animValues[index]}
                                            isActive={activeIndex === index}
                                            colorScheme={colorScheme}
                                        />
                                    );
                                })}
                            </G>
                        </Svg>

                        {/* Centered Text Overlay - Positioned at bottom center of the semi-circle */}
                        <View style={styles.centerOverlay}>
                            <Animated.Text
                                entering={FadeIn.duration(400)}
                                key={`${activeItem.key}-val`}
                                style={[styles.centerValue, { color: colors.text }]}
                            >
                                {Math.round(activeItem.value)}
                            </Animated.Text>
                            <Animated.Text
                                entering={FadeIn.delay(100).duration(400)}
                                key={`${activeItem.key}-label`}
                                style={[styles.centerLabel, { color: colors.icon }]}
                            >
                                {activeItem.unit} • {activeItem.label.toUpperCase()}
                            </Animated.Text>
                            <Text style={[styles.tapHint, { color: colors.text }]}>Tap to switch</Text>
                        </View>

                    </AnimatedPressable>

                    {/* Stats Grid at Bottom */}
                    <View style={styles.statsGrid}>
                        {data.map((item, index) => {
                            const isActive = activeIndex === index;
                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => setActiveIndex(index)}
                                    style={[
                                        styles.statItem,
                                        isActive && styles.activeStatItem,
                                        { borderColor: isActive ? item.colors[0] : 'transparent' }
                                    ]}
                                >
                                    <View style={[styles.dot, { backgroundColor: item.colors[0] }]} />
                                    <Text style={[styles.statItemLabel, { color: colors.text, fontWeight: isActive ? '700' : '400' }]}>
                                        {item.label}
                                    </Text>
                                    <Text style={[styles.statItemValue, { color: colors.icon }]}>
                                        {Math.round((item.value / (item.target || 1)) * 100)}%
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

const RingSegment = ({ radius, fullCircumference, semiCircumference, strokeWidth, gradientId, animValue, isActive, colorScheme }: any) => {

    // Background Track (Gray)
    // We only show the semi-circle part
    const trackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

    const animatedProps = useAnimatedProps(() => {
        // strokeDashoffset:
        // 0 => Full visibly dashed
        // semiCircumference => Empty (if strokeDashArray is [semi, full])
        const offset = semiCircumference * (1 - animValue.value);
        return {
            strokeDashoffset: offset,
            strokeWidth: withSpring(isActive ? strokeWidth + 6 : strokeWidth),
        };
    });

    return (
        <>
            {/* Background Track: Static Semi-Circle */}
            <Circle
                cx={0} cy={0} r={radius}
                stroke={trackColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={[semiCircumference, fullCircumference]}
                strokeLinecap="round" // Rounded ends
            />
            {/* Foreground Progress: Animated */}
            <AnimatedCircle
                cx={0} cy={0} r={radius}
                stroke={`url(#${gradientId})`}
                fill="transparent"
                strokeDasharray={[semiCircumference, fullCircumference]}
                animatedProps={animatedProps}
                strokeLinecap="round"
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        marginHorizontal: 16,
    },
    headerRow: {
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    contentColumn: {
        padding: 20,
        alignItems: 'center',
    },
    chartWrapper: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerOverlay: {
        position: 'absolute',
        bottom: 10,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 100, // Constrain height to overlap properly
    },
    centerValue: {
        fontSize: 42,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        marginBottom: -5,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    centerLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        opacity: 0.8,
        marginBottom: 8,
    },
    tapHint: {
        fontSize: 10,
        opacity: 0.5,
        textTransform: 'uppercase',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 10,
        width: '100%',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(120,120,120,0.05)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeStatItem: {
        backgroundColor: 'rgba(120,120,120,0.1)',
        transform: [{ scale: 1.05 }],
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statItemLabel: {
        fontSize: 12,
        marginRight: 4,
    },
    statItemValue: {
        fontSize: 11,
        opacity: 0.7,
        fontWeight: '700',
    },
});

