import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

// Create Animated Circle
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
const CARD_PADDING = 20;
// Make the meter nicely sized but not overwhelming
const METER_SIZE = width * 0.52;
const STROKE_WIDTH = 16;
const RADIUS = (METER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// We want a 240-degree arc ( leaving 120 degrees open at bottom)
// 240 degrees in radians = 4.1888
// But easiest way with dasharray is to just calculating length.
// A full circle is 360. We want 2/3 of it roughly? Or just open bottom.
// Let's do a standard "Speedometer" style: 240 deg.
// Start angle: 150 deg (bottom left), End angle: 390 deg (bottom right).
// Or simpler: Rotate -120deg.
// Let's stick to a simple semi-circle extended (220 deg) or the 270 deg open bottom.
// Let's do 250 degrees for a nice encompassing feel.

const METER_ARC_ANGLE = 260;
const ARC_LENGTH = CIRCUMFERENCE * (METER_ARC_ANGLE / 360);

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

    // Animation Values
    const progress = useSharedValue(0);

    const percentage = Math.min(calories / target, 1);

    useEffect(() => {
        progress.value = withTiming(percentage, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [percentage]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progress.value * (METER_ARC_ANGLE / 360));
        return {
            strokeDashoffset: strokeDashoffset,
        };
    });

    // Background dash offset (fixed)
    // We want to show only METER_ARC_ANGLE of the circle.
    // The "empty" part of the strokeDasharray should be the gap.
    // strokeDasharray = [visible_len, gap_len]
    const gapLength = CIRCUMFERENCE - ARC_LENGTH;
    const strokeDasharray = `${ARC_LENGTH} ${gapLength}`;

    // Rotation to center the opening at the bottom
    // Opening is `gapLength`. We want the center of the gap to be at 90deg (bottom).
    // SVG standard start is 0deg (3 o'clock).
    // The gap is (360 - METER_ARC_ANGLE) degrees wide.
    // We need to rotate by 90 + (Gap/2).
    const rotation = 90 + ((360 - METER_ARC_ANGLE) / 2);


    const MacroPill = ({ label, value, target, color, icon }: any) => {
        const p = Math.min(value / target, 1);
        return (
            <View style={[styles.macroPill, { backgroundColor: colors.surfaceHighlight }]}>
                {/* Icon Circle */}
                <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={14} color={color} />
                </View>

                <View style={styles.macroContent}>
                    <Text style={[styles.macroLabel, { color: colors.icon }]}>{label}</Text>
                    <Text style={[styles.macroValue, { color: colors.text }]}>
                        {Math.round(value)}g
                    </Text>
                    {/* Mini bar */}
                    <View style={styles.miniBarBg}>
                        <View style={[styles.miniBarFill, { width: `${p * 100}%`, backgroundColor: color }]} />
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header Text baked into the standard design flow */}
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Insight</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Today</Text>
            </View>

            <GlassCard style={styles.card} variant="smoked">
                <View style={styles.meterWrapper}>
                    {/* Main Gauge */}
                    <Svg width={METER_SIZE} height={METER_SIZE} viewBox={`0 0 ${METER_SIZE} ${METER_SIZE}`}>
                        <Defs>
                            <LinearGradient id="ringGradient" x1="0" y1="1" x2="1" y2="0">
                                <Stop offset="0" stopColor="#3B82F6" />
                                <Stop offset="0.5" stopColor="#8B5CF6" />
                                <Stop offset="1" stopColor="#EC4899" />
                            </LinearGradient>
                            {/* Inner glow shadow could go here */}
                        </Defs>

                        <G rotation={rotation} origin={`${METER_SIZE / 2}, ${METER_SIZE / 2}`}>
                            {/* Track */}
                            <Circle
                                cx={METER_SIZE / 2}
                                cy={METER_SIZE / 2}
                                r={RADIUS}
                                stroke={colors.glass.borderColor} // Very subtle track
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={strokeDasharray}
                                strokeLinecap="round"
                                fill="transparent"
                                strokeOpacity={0.5}
                            />

                            {/* Progress Ring */}
                            <AnimatedCircle
                                cx={METER_SIZE / 2}
                                cy={METER_SIZE / 2}
                                r={RADIUS}
                                stroke="url(#ringGradient)"
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={strokeDasharray}
                                animatedProps={animatedProps} // Animated Dashoffset
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </G>
                    </Svg>

                    {/* Center Text Overlaid */}
                    <View style={styles.innerContent}>
                        <View style={[styles.iconBlur, { backgroundColor: colors.primary + '10' }]}>
                            <Ionicons name="flame" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.mainValue, { color: colors.text }]}>{Math.round(calories)}</Text>
                        <Text style={[styles.subLabel, { color: colors.icon }]}>kcal consumed</Text>
                        <Text style={[styles.targetLabel, { color: colors.icon }]}>of {target} goal</Text>
                    </View>
                </View>

                {/* Macros Row - Clean Pills */}
                <View style={styles.macrosRow}>
                    <MacroPill
                        label="Protein"
                        value={protein}
                        target={proteinTarget}
                        color="#10B981"
                        icon="fitness"
                    />
                    <MacroPill
                        label="Carbs"
                        value={carbs}
                        target={carbsTarget}
                        color="#3B82F6"
                        icon="restaurant"
                    />
                    <MacroPill
                        label="Fats"
                        value={fat}
                        target={fatTarget}
                        color="#F59E0B"
                        icon="water" // water droplet looks a bit like oil/fat drop
                    />
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
        fontSize: 22,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        padding: 24,
        borderRadius: 36,
        // Ensure shadows for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    meterWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        height: METER_SIZE,
        marginBottom: 24,
    },
    innerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBlur: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    mainValue: {
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1.5,
        lineHeight: 44,
    },
    subLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    targetLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    macroPill: {
        flex: 1,
        borderRadius: 20,
        padding: 10,
        // backgroundColor handled inline for theme
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    macroContent: {
        gap: 4,
    },
    macroLabel: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.8,
    },
    macroValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    miniBarBg: {
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 2,
        width: '100%',
        marginTop: 4,
    },
    miniBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    caloriesTarget: {
        fontSize: 12,
        opacity: 0.7,
    },
});
