import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

const { width } = Dimensions.get('window');

// High Contrast Neon Palette
const THEME = {
    calories: ['#2E3192', '#1BFFFF'], // Deep Blue to Cyan
    protein: '#00FF9D', // Neon Green
    carbs: '#00D2FF', // Neon Blue
    fat: '#FF006E', // Neon Pink
    track: 'rgba(255,255,255,0.1)'
};

const SVG_SIZE = 200;
const CENTER = SVG_SIZE / 2;

// Outer Orbit Config
const ORBIT_RADIUS = 85;
const ORBIT_STROKE = 8;
const ORBIT_CIRCUMFERENCE = 2 * Math.PI * ORBIT_RADIUS;

// Inner Donut Config
const DONUT_RADIUS = 65;
const DONUT_STROKE = 12;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export const CalorieMeter: React.FC<CalorieMeterProps> = ({
    calories,
    target,
    protein,
    proteinTarget,
    carbs,
    carbsTarget,
    fat,
    fatTarget,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Progress for Outer Orbit (Target)
    const pCal = Math.min(calories / target, 1);

    // Distribution for Inner Donut (Total Macros)
    const totalMacros = protein + carbs + fat;
    // Handle case where total is 0 to avoid NaNs
    const safeTotal = totalMacros > 0 ? totalMacros : 1;

    // Calculate percentages for donut slices (0-1 range)
    const pPro = protein / safeTotal;
    const pCarb = carbs / safeTotal;
    const pFat = fat / safeTotal;

    // Animation Values
    const orbitProgress = useSharedValue(0);
    const donutPro = useSharedValue(0);
    const donutCarb = useSharedValue(0);
    const donutFat = useSharedValue(0);

    useEffect(() => {
        orbitProgress.value = withTiming(pCal, { duration: 1500, easing: Easing.out(Easing.exp) });

        // Staggered entry for donut segments
        if (totalMacros > 0) {
            donutPro.value = withDelay(200, withTiming(pPro, { duration: 1000 }));
            donutCarb.value = withDelay(200, withTiming(pCarb, { duration: 1000 }));
            donutFat.value = withDelay(200, withTiming(pFat, { duration: 1000 }));
        }
    }, [pCal, pPro, pCarb, pFat, totalMacros]);

    // Outer Orbit Props
    const orbitProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: ORBIT_CIRCUMFERENCE * (1 - orbitProgress.value),
        };
    });

    // Donut Segments
    // Strategy: Three overlapping circles with different DashArrays/Offsets to create segments
    // But circles stack.
    // 1. Base (Total) - Not needed usually
    // 2. We need specific start angles or accumulative offsets.
    // SVG Circle strokeDasharray = [lengthOfArc, spacing]
    // To rotate segments, we need to rotate the whole circle.

    // Easier way with Reanimated and SVG circles for stacked Donut:
    // We can't easily animate the "start point" of a strokeDasharray without complex rotation math.
    // Simplest robust way: 3 Circles, each rotated to start where the previous ended.
    // But we need derived values for rotation which is tricky in pure SVG/Reanimated without a wrapper component.

    // Better Approach for Reanimated Donut: Absolute positioned SVG layers or just simple accumulation?
    // Let's use Rotation Transforms derived from the previous values.
    // However, hooks order matters. 

    // Let's try 3 overlays with dashed strokes.
    // Layer 1: Protein (Starts at -90deg)
    // Layer 2: Carbs (Starts at -90deg + ProteinAngle)
    // Layer 3: Fat (Starts at -90deg + ProteinAngle + CarbsAngle)

    // Since we are animating the *lengths* (values), the start positions shift if we animate them all from 0.
    // Ideally, we animate the *lengths* and the *rotations* update instantly? No.
    // Let's just animate the strokeDasharray length.

    // Protein Props
    const proProps = useAnimatedProps(() => {
        const length = DONUT_CIRCUMFERENCE * donutPro.value;
        const gap = DONUT_CIRCUMFERENCE - length;
        return {
            strokeDasharray: [length, gap],
        };
    });

    // Carbs Props
    // Needs to be rotated by Protein amount * 360
    // Animated Props can't easily do rotation transform on the component itself unless it supports it.
    // G supports rotation.
    // But we need the rotation to be animated/derived.

    // Alternative: Use a single circle for "Total" and mask? No.
    // Let's stick to the "Stacked Progress" visual which is simpler and cleaner for "Donut" feel in React Native.
    // OR just use valid DashOffsets!
    // DashOffset moves the start point of the dash.
    // Segment 1 (Protein): Offset 0. Length P.
    // Segment 2 (Carbs): Offset -P. Length C.
    // Segment 3 (Fat): Offset -(P+C). Length F.

    // IMPORTANT: strokeDashoffset moves the pattern *backwards*.
    // So usually: offset = - (sum of previous lengths).

    const carbProps = useAnimatedProps(() => {
        const length = DONUT_CIRCUMFERENCE * donutCarb.value;
        const gap = DONUT_CIRCUMFERENCE - length;
        const offset = -1 * (DONUT_CIRCUMFERENCE * donutPro.value);
        return {
            strokeDasharray: [length, gap],
            strokeDashoffset: offset
        };
    });

    const fatProps = useAnimatedProps(() => {
        const length = DONUT_CIRCUMFERENCE * donutFat.value;
        const gap = DONUT_CIRCUMFERENCE - length;
        const offset = -1 * (DONUT_CIRCUMFERENCE * (donutPro.value + donutCarb.value));
        return {
            strokeDasharray: [length, gap],
            strokeDashoffset: offset
        };
    });


    const LegendItem = ({ label, value, color, icon }: any) => (
        <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={14} color={color} />
            </View>
            <View>
                <Text style={[styles.legendLabel, { color: colors.icon }]}>{label}</Text>
                <Text style={[styles.legendValue, { color: colors.text }]}>{Math.round(value)}g</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Energy</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Summary</Text>
            </View>

            <GlassCard style={styles.card} variant="default">
                <View style={styles.chartContainer}>
                    <Svg width={SVG_SIZE} height={SVG_SIZE}>
                        <Defs>
                            <LinearGradient id="orbitGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={THEME.calories[0]} />
                                <Stop offset="1" stopColor={THEME.calories[1]} />
                            </LinearGradient>
                        </Defs>

                        {/* --- 1. Outer Orbit (Calories) --- */}
                        {/* Track */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={ORBIT_RADIUS}
                            stroke={colors.glass.borderColor} strokeWidth={ORBIT_STROKE}
                            strokeOpacity={0.3}
                        />
                        {/* Progress */}
                        <AnimatedCircle
                            cx={CENTER} cy={CENTER} r={ORBIT_RADIUS}
                            stroke="url(#orbitGradient)" strokeWidth={ORBIT_STROKE}
                            strokeLinecap="round"
                            strokeDasharray={[ORBIT_CIRCUMFERENCE, ORBIT_CIRCUMFERENCE]}
                            animatedProps={orbitProps}
                            rotation="-90" origin={`${CENTER}, ${CENTER}`}
                        />

                        {/* --- 2. Inner Donut (macros) --- */}
                        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                            {/* Protein Segment */}
                            <AnimatedCircle
                                cx={CENTER} cy={CENTER} r={DONUT_RADIUS}
                                stroke={THEME.protein} strokeWidth={DONUT_STROKE}
                                fill="transparent"
                                animatedProps={proProps}
                            />
                            {/* Carbs Segment */}
                            <AnimatedCircle
                                cx={CENTER} cy={CENTER} r={DONUT_RADIUS}
                                stroke={THEME.carbs} strokeWidth={DONUT_STROKE}
                                fill="transparent"
                                animatedProps={carbProps}
                            />
                            {/* Fat Segment */}
                            <AnimatedCircle
                                cx={CENTER} cy={CENTER} r={DONUT_RADIUS}
                                stroke={THEME.fat} strokeWidth={DONUT_STROKE}
                                fill="transparent"
                                animatedProps={fatProps}
                            />
                        </G>
                    </Svg>

                    {/* Center Text */}
                    <View style={styles.centerOverlay}>
                        <Text style={[styles.centerValue, { color: colors.text }]}>{Math.round(calories)}</Text>
                        <Text style={[styles.centerLabel, { color: colors.icon }]}>kcal</Text>
                    </View>
                </View>

                {/* Bottom Legend */}
                <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
                    <LegendItem label="Protein" value={protein} color={THEME.protein} icon="fitness" />
                    <LegendItem label="Carbs" value={carbs} color={THEME.carbs} icon="restaurant" />
                    <LegendItem label="Fats" value={fat} color={THEME.fat} icon="water" />
                </View>
            </GlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        padding: 0, // Reset padding for custom layout
        borderRadius: 24,
        overflow: 'hidden',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        position: 'relative',
    },
    centerOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerValue: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
        lineHeight: 40,
    },
    centerLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)', // Subtle separate bg
    },
    legendItem: {
        alignItems: 'center',
        gap: 6,
    },
    legendIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    legendLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    legendValue: {
        fontSize: 14,
        fontWeight: '700',
    },
});
