import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

// Premium Health Palette
const THEME = {
    // Calories: Vibrant Red-Orange
    calories: ['#FF453A', '#FF9F0A'],
    // Protein: Emerald Green
    protein: ['#30D158', '#63E6E2'],
    // Carbs: Sky Blue
    carbs: ['#0A84FF', '#5AC8FA'],
    // Fat: Warm Violet / Pink
    fat: ['#BF5AF2', '#FF375F'],
};

const SVG_SIZE = 220;
const CENTER = SVG_SIZE / 2;

// Configuration
const ORBIT_RADIUS = 90;
const ORBIT_STROKE = 14;
const ORBIT_CIRCUMFERENCE = 2 * Math.PI * ORBIT_RADIUS;

const DONUT_RADIUS = 68;
const DONUT_STROKE = 14;
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

    // Progress Calculation
    const pCal = Math.min(calories / target, 1);

    // Macro Distribution
    const totalMacros = protein + carbs + fat;
    const safeTotal = totalMacros > 0 ? totalMacros : 1;

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

        if (totalMacros > 0) {
            donutPro.value = withDelay(300, withTiming(pPro, { duration: 1200 }));
            donutCarb.value = withDelay(300, withTiming(pCarb, { duration: 1200 }));
            donutFat.value = withDelay(300, withTiming(pFat, { duration: 1200 }));
        }
    }, [pCal, pPro, pCarb, pFat, totalMacros]);

    // Outer Orbit Props
    const orbitProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: ORBIT_CIRCUMFERENCE * (1 - orbitProgress.value),
        };
    });

    // Donut Segment Props - Using Gap Logic for separation
    // To make them rounded, we strictly need gaps between segments if we want round caps to be visible 
    // without overlapping messily. 
    // Or we just overlay them.
    // Overlaying with rounded caps:
    // Bottom: Fat (Full Circle length, but we only show its part? No)
    // Stack:
    // 1. Fat (Total Length = 100%, but masked? No.)
    // 
    // The "Stacked DashArray" technique:
    // P = Protein %, C = Carb %, F = Fat %
    // Layer 1 (Protein): dasharray = [P, 1-P], rotate -90
    // Layer 2 (Carbs): dasharray = [C, 1-C], rotate -90 + (P * 360)
    // Layer 3 (Fat): dasharray = [F, 1-F], rotate -90 + ((P+C) * 360)

    // BUT we need `rotation` prop to be animated if P changes dynamically. 
    // Reanimated doesn't support animating arbitrary props on G groups easily without `createAnimatedComponent`.
    // And rotation origin is annoying.

    // Alternative: Use `strokeDashoffset` negative shift.
    // DashOffset shifts the pattern start.
    // Protein: offset 0.
    // Carbs: offset -P.
    // Fat: offset -(P+C).
    // This stacks them visually end-to-end!
    // AND it works with rounded caps if we leave a tiny gap in dasharray.

    const GAP_ARC = 5; // pixels gap

    const proProps = useAnimatedProps(() => {
        const length = Math.max(0, (DONUT_CIRCUMFERENCE * donutPro.value) - GAP_ARC);
        const gap = DONUT_CIRCUMFERENCE - length;
        return {
            strokeDasharray: [length, gap],
            strokeDashoffset: 0
        };
    });

    const carbProps = useAnimatedProps(() => {
        const length = Math.max(0, (DONUT_CIRCUMFERENCE * donutCarb.value) - GAP_ARC);
        const gap = DONUT_CIRCUMFERENCE - length;
        const offset = -1 * (DONUT_CIRCUMFERENCE * donutPro.value);
        return {
            strokeDasharray: [length, gap],
            strokeDashoffset: offset
        };
    });

    const fatProps = useAnimatedProps(() => {
        const length = Math.max(0, (DONUT_CIRCUMFERENCE * donutFat.value) - GAP_ARC);
        const gap = DONUT_CIRCUMFERENCE - length;
        const offset = -1 * (DONUT_CIRCUMFERENCE * (donutPro.value + donutCarb.value));
        return {
            strokeDasharray: [length, gap],
            strokeDashoffset: offset
        };
    });

    const LegendItem = ({ label, value, colors: gradientColors, icon }: any) => (
        <View style={styles.legendItem}>
            <LinearGradient
                colors={gradientColors}
                style={styles.legendIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={12} color="white" />
            </LinearGradient>
            <View>
                <Text style={[styles.legendLabel, { color: colors.icon }]}>{label}</Text>
                <Text style={[styles.legendValue, { color: colors.text }]}>{Math.round(value)}g</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Activity</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Summary</Text>
            </View>

            {/* Premium Card Background */}
            <LinearGradient
                colors={colorScheme === 'dark'
                    ? ['#1F293700', '#1F2937'] // Transparent to Dark Slate (Subtle)
                    : ['#ffffff', '#f0f0f0']
                } // Actually let's use a nice subtle Card Gradient
                style={[styles.card, { borderColor: colors.border, borderWidth: 1 }]}
            >
                {/* We use a separate darker background for Deep feel */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff', opacity: 0.8, borderRadius: 32 }]} />

                <View style={[styles.chartContainer]}>
                    <Svg width={SVG_SIZE} height={SVG_SIZE}>
                        <Defs>
                            <SvgLinearGradient id="calGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={THEME.calories[0]} />
                                <Stop offset="1" stopColor={THEME.calories[1]} />
                            </SvgLinearGradient>
                            <SvgLinearGradient id="proGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={THEME.protein[0]} />
                                <Stop offset="1" stopColor={THEME.protein[1]} />
                            </SvgLinearGradient>
                            <SvgLinearGradient id="carbGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={THEME.carbs[0]} />
                                <Stop offset="1" stopColor={THEME.carbs[1]} />
                            </SvgLinearGradient>
                            <SvgLinearGradient id="fatGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={THEME.fat[0]} />
                                <Stop offset="1" stopColor={THEME.fat[1]} />
                            </SvgLinearGradient>
                        </Defs>

                        {/* --- Outer Orbit (Calories) --- */}
                        {/* Track */}
                        <Circle
                            cx={CENTER} cy={CENTER} r={ORBIT_RADIUS}
                            stroke={colors.border} strokeWidth={ORBIT_STROKE}
                            strokeOpacity={0.3}
                        />
                        {/* Progress */}
                        <AnimatedCircle
                            cx={CENTER} cy={CENTER} r={ORBIT_RADIUS}
                            stroke="url(#calGradient)" strokeWidth={ORBIT_STROKE}
                            strokeLinecap="round"
                            strokeDasharray={[ORBIT_CIRCUMFERENCE, ORBIT_CIRCUMFERENCE]}
                            animatedProps={orbitProps}
                            rotation="-90" origin={`${CENTER}, ${CENTER}`}
                        />

                        {/* --- Inner Donut (Macros) --- */}
                        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                            {/* Protein Segment */}
                            <AnimatedCircle
                                cx={CENTER} cy={CENTER} r={DONUT_RADIUS}
                                stroke="url(#proGradient)" strokeWidth={DONUT_STROKE}
                                fill="transparent"
                                strokeLinecap="round"
                                animatedProps={proProps}
                            />
                            {/* Carbs Segment */}
                            <AnimatedCircle
                                cx={CENTER} cy={CENTER} r={DONUT_RADIUS}
                                stroke="url(#carbGradient)" strokeWidth={DONUT_STROKE}
                                fill="transparent"
                                strokeLinecap="round"
                                animatedProps={carbProps}
                            />
                            {/* Fat Segment */}
                            <AnimatedCircle
                                cx={CENTER} cy={CENTER} r={DONUT_RADIUS}
                                stroke="url(#fatGradient)" strokeWidth={DONUT_STROKE}
                                fill="transparent"
                                strokeLinecap="round"
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
                    <LegendItem label="Protein" value={protein} colors={THEME.protein} icon="fitness" />
                    <LegendItem label="Carbs" value={carbs} colors={THEME.carbs} icon="restaurant" />
                    <LegendItem label="Fats" value={fat} colors={THEME.fat} icon="water" />
                </View>

            </LinearGradient>
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
        borderRadius: 32,
        overflow: 'hidden',
        padding: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        position: 'relative',
        zIndex: 1, // Ensure above card background
    },
    centerOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerValue: {
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1,
        lineHeight: 44,
    },
    centerLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slightly darker bottom section
        zIndex: 1,
    },
    legendItem: {
        alignItems: 'center',
        gap: 8,
    },
    legendIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    legendLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    legendValue: {
        fontSize: 15,
        fontWeight: '700',
    },
});
