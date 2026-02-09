import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Line, G, Defs, LinearGradient as SvgLinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    withDelay,
    FadeIn,
    withSequence,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';

const AnimatedLine = Animated.createAnimatedComponent(Line);
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

// Tick Configuration
const TICK_COUNT = 40;
const TICK_LENGTH = 12;  // Length of each tick
const TICK_WIDTH = 4;    // Thickness of each tick
const GAUGE_RADIUS = 120; // Radius of the arc

// Modern Gradients for Active State
const GRADIENTS = {
    calories: ['#FF416C', '#FF4B2B'], // Hot Pink/Red
    protein: ['#4FACFE', '#00F2FE'], // Cyan/Blue
    carbs: ['#43E97B', '#38F9D7'],   // Green/Teal
    fat: ['#F83600', '#F9D423'],      // Orange/Yellow
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export const CalorieMeter: React.FC<CalorieMeterProps> = ({
    calories, target, protein, proteinTarget, carbs, carbsTarget, fat, fatTarget,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const [activeIndex, setActiveIndex] = useState(0);

    const data = [
        { key: 'calories', label: 'Calories', value: calories, target: target, unit: 'kcal', colors: GRADIENTS.calories },
        { key: 'protein', label: 'Protein', value: protein, target: proteinTarget, unit: 'g', colors: GRADIENTS.protein },
        { key: 'carbs', label: 'Carbs', value: carbs, target: carbsTarget, unit: 'g', colors: GRADIENTS.carbs },
        { key: 'fat', label: 'Fat', value: fat, target: fatTarget, unit: 'g', colors: GRADIENTS.fat },
    ];

    const activeItem = data[activeIndex];

    // Animation Values
    const progress = useSharedValue(0); // 0 to 1
    const pulseScale = useSharedValue(1);

    // Update progress when active item changes or values change
    useEffect(() => {
        const targetProgress = Math.min(Math.max(activeItem.value / (activeItem.target || 1), 0), 1);
        progress.value = withTiming(targetProgress, {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        });
    }, [activeIndex, calories, protein, carbs, fat, target]);

    const handleChartPress = () => {
        // Simple pulse
        pulseScale.value = withSequence(
            withSpring(0.95),
            withSpring(1)
        );
        // Cycle metrics
        setActiveIndex((prev) => (prev + 1) % data.length);
    };

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    // Generate Ticks
    // We want a semi-circle from 180 deg to 0 deg (Left to Right)
    // Actually standard SVG coordinates: 
    // 180 (Left) -> 270 (Top) -> 360/0 (Right)
    // Let's use loop from -180 to 0 degrees for easier calculation with Math.cos/sin
    const ticks = Array.from({ length: TICK_COUNT }).map((_, i) => {
        const angleDeg = -180 + (i / (TICK_COUNT - 1)) * 180;
        const angleRad = (angleDeg * Math.PI) / 180;

        // Outer point
        const x1 = GAUGE_RADIUS * Math.cos(angleRad);
        const y1 = GAUGE_RADIUS * Math.sin(angleRad);

        // Inner point
        const x2 = (GAUGE_RADIUS - TICK_LENGTH) * Math.cos(angleRad);
        const y2 = (GAUGE_RADIUS - TICK_LENGTH) * Math.sin(angleRad);

        return { x1, y1, x2, y2, angleDeg };
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Today</Text>
            </View>

            <BlurView
                intensity={colorScheme === 'dark' ? 20 : 60}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={[styles.glassCard, { borderColor: colors.border }]}
            >
                <View style={styles.content}>
                    <AnimatedPressable onPress={handleChartPress} style={[styles.chartContainer, containerAnimatedStyle]}>
                        <Svg width={GAUGE_RADIUS * 2 + 40} height={GAUGE_RADIUS + 40} viewBox={`-${GAUGE_RADIUS + 20} -${GAUGE_RADIUS + 20} ${GAUGE_RADIUS * 2 + 40} ${GAUGE_RADIUS + 40}`}>
                            <Defs>
                                {/* Gradient for the active ticks */}
                                <SvgLinearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0" stopColor={activeItem.colors[0]} />
                                    <Stop offset="1" stopColor={activeItem.colors[1]} />
                                </SvgLinearGradient>

                                {/* Mask to reveal ticks based on progress */}
                                <Mask id="progressMask">
                                    <AnimatedMaskRect
                                        width={GAUGE_RADIUS * 2 + 40}
                                        height={GAUGE_RADIUS + 40}
                                        progress={progress}
                                        radius={GAUGE_RADIUS}
                                    />
                                </Mask>
                            </Defs>

                            {/* Center Group shifted down to accommodate negative Y coords */}
                            <G y={0}>
                                {/* 1. Background Ticks (Gray) */}
                                {ticks.map((tick, i) => (
                                    <Line
                                        key={`bg-${i}`}
                                        x1={tick.x1} y1={tick.y1}
                                        x2={tick.x2} y2={tick.y2}
                                        stroke={colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                                        strokeWidth={TICK_WIDTH}
                                        strokeLinecap="round"
                                    />
                                ))}

                                {/* 2. Active Ticks (Gradient + Masked) */}
                                {/* We render the same ticks again, but colored with gradient and MASKED */}
                                <G mask="url(#progressMask)">
                                    {ticks.map((tick, i) => (
                                        <Line
                                            key={`fg-${i}`}
                                            x1={tick.x1} y1={tick.y1}
                                            x2={tick.x2} y2={tick.y2}
                                            stroke="url(#activeGradient)" // Apply gradient to stroke
                                            strokeWidth={TICK_WIDTH}
                                            strokeLinecap="round"
                                        />
                                    ))}
                                </G>
                            </G>
                        </Svg>

                        {/* Centered Overlay Text */}
                        <View style={styles.textOverlay}>
                            <Animated.Text
                                key={`icon-${activeItem.key}`}
                                entering={FadeIn.delay(100)}
                                style={[styles.iconPlaceholder, { color: activeItem.colors[0] }]}
                            >
                                {activeIndex === 0 ? '🔥' : activeIndex === 1 ? '🥩' : activeIndex === 2 ? '🍞' : '🥑'}
                            </Animated.Text>

                            <Animated.Text
                                key={`val-${activeItem.key}`}
                                entering={FadeIn.duration(400)}
                                style={[styles.centerValue, { color: colors.text }]}
                            >
                                {Math.round(activeItem.value)}
                            </Animated.Text>

                            <Animated.Text
                                key={`unit-${activeItem.key}`}
                                entering={FadeIn.delay(50)}
                                style={[styles.centerUnit, { color: colors.icon }]}
                            >
                                {activeItem.unit}
                            </Animated.Text>
                        </View>
                    </AnimatedPressable>

                    {/* Bottom Stats Row */}
                    <View style={styles.statsRow}>
                        {data.map((item, index) => {
                            const isActive = activeIndex === index;
                            const isDark = colorScheme === 'dark';

                            return (
                                <Pressable
                                    key={item.key}
                                    onPress={() => setActiveIndex(index)}
                                    style={[styles.statItem]}
                                >
                                    <Text style={[styles.statLabel, { color: colors.icon, opacity: isActive ? 1 : 0.7 }]}>
                                        {item.label}
                                    </Text>
                                    <View style={styles.statValueContainer}>
                                        <Text style={[styles.statCurrent, { color: colors.text, fontWeight: isActive ? '700' : '500' }]}>
                                            {Math.round(item.value)}
                                        </Text>
                                        <Text style={[styles.statTarget, { color: colors.icon }]}> / {item.target}</Text>
                                    </View>
                                    <View style={[
                                        styles.activeIndicator,
                                        {
                                            backgroundColor: isActive ? item.colors[0] : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                            width: isActive ? 40 : 20
                                        }
                                    ]} />
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </BlurView>
        </View>
    );
};


const AnimatedPath = Animated.createAnimatedComponent(require('react-native-svg').Path);
const AnimatedMaskRect = ({ width, height, progress, radius }: any) => {

    // Mask Logic:
    // Create a path that looks like a semi-circle arc
    // Use strokeDasharray to 'fill' it based on progress
    const circumferance = Math.PI * radius;

    const animatedProps = useAnimatedProps(() => {
        const offset = circumferance * (1 - progress.value);
        return {
            strokeDashoffset: offset,
        };
    });

    // Path for a semi-circle arc from -180 to 0
    // M -r 0 A r r 0 0 1 r 0 
    // This arc goes from left (-r,0) to right (r,0) clockwise
    const path = `M -${radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`;

    return (
        <AnimatedPath
            d={path}
            stroke="white"
            strokeWidth={40} // Wide enough to cover the ticks
            fill="none"
            strokeDasharray={[circumferance, circumferance]}
            animatedProps={animatedProps}
            strokeLinecap="butt"
        />
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
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: GAUGE_RADIUS + 40,
        marginBottom: 12,
    },
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 100, // Ensure overlap
    },
    iconPlaceholder: {
        fontSize: 24,
        marginBottom: 4,
    },
    centerValue: {
        fontSize: 48,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        includeFontPadding: false,
        lineHeight: 52,
        marginBottom: -4,
    },
    centerUnit: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'lowercase',
        opacity: 0.7,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 4,
    },
    statItem: {
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    statValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    statCurrent: {
        fontSize: 14,
        fontWeight: '700',
    },
    statTarget: {
        fontSize: 10,
        opacity: 0.6,
    },
    activeIndicator: {
        height: 3,
        borderRadius: 2,
        marginTop: 6,
    },
});
