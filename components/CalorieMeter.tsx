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
const CARD_PADDING = 20;

// Ring Configuration
const RINGS = {
    calories: { radius: 60, stroke: 12, color: '#F43F5E' }, // Rose 500
    protein: { radius: 44, stroke: 12, color: '#10B981' },  // Emerald 500
    carbs: { radius: 28, stroke: 12, color: '#3B82F6' },    // Blue 500
    fat: { radius: 12, stroke: 12, color: '#F59E0B' },      // Amber 500
};
// Center (60 + 12 = 72 radius -> 144 width. Let's give some padding)
const SVG_SIZE = 150;
const CENTER = SVG_SIZE / 2;

const Ring = ({ radius, stroke, color, progress, delay = 0 }: { radius: number, stroke: number, color: string, progress: number, delay?: number }) => {
    const circumference = 2 * Math.PI * radius;
    const animatedExample = useSharedValue(0);

    useEffect(() => {
        // Animate from 0 to progress
        animatedExample.value = withDelay(delay, withTiming(progress, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        }));
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: circumference * (1 - animatedExample.value),
        };
    });

    return (
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            {/* Background Track */}
            <Circle
                cx={CENTER}
                cy={CENTER}
                r={radius}
                stroke={color}
                strokeWidth={stroke}
                strokeOpacity={0.15}
                fill="transparent"
            />
            {/* Progress */}
            <AnimatedCircle
                cx={CENTER}
                cy={CENTER}
                r={radius}
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                animatedProps={animatedProps}
                strokeLinecap="round"
                fill="transparent"
            />
        </G>
    );
};

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

    // Cap progress at 1 for visual rings (or let them loop? Let's cap for now)
    const pCal = Math.min(calories / target, 1);
    const pPro = Math.min(protein / proteinTarget, 1);
    const pCarb = Math.min(carbs / carbsTarget, 1);
    const pFat = Math.min(fat / fatTarget, 1);

    const StatRow = ({ label, value, target, color, icon }: any) => (
        <View style={styles.statRow}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={14} color={color} />
            </View>
            <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: colors.icon }]}>{label}</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                    {Math.round(value)}
                    <Text style={{ fontSize: 12, fontWeight: '400', color: colors.icon }}> / {target}g</Text>
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Insight</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Today</Text>
            </View>

            <GlassCard style={styles.card} variant="smoked">
                <View style={styles.contentRow}>
                    {/* Left: The Rings */}
                    <View style={styles.ringsContainer}>
                        <Svg width={SVG_SIZE} height={SVG_SIZE}>
                            {/*  No gradients for now, distinct solid neon colors look better for concentric rings */}

                            {/* Outer: Calories */}
                            <Ring radius={RINGS.calories.radius} stroke={RINGS.calories.stroke} color={RINGS.calories.color} progress={pCal} delay={0} />

                            {/* Mid: Protein */}
                            <Ring radius={RINGS.protein.radius} stroke={RINGS.protein.stroke} color={RINGS.protein.color} progress={pPro} delay={200} />

                            {/* Mid: Carbs */}
                            <Ring radius={RINGS.carbs.radius} stroke={RINGS.carbs.stroke} color={RINGS.carbs.color} progress={pCarb} delay={400} />

                            {/* Inner: Fat */}
                            <Ring radius={RINGS.fat.radius} stroke={RINGS.fat.stroke} color={RINGS.fat.color} progress={pFat} delay={600} />
                        </Svg>

                        {/* Centered Icon? Or just keep it clean? */}
                        {/* <View style={[styles.centerIcon, {top: CENTER - 12, left: CENTER - 12}]}>
                            <Ionicons name="flame" size={24} color={colors.text} /> 
                        </View> */}
                    </View>

                    {/* Right: The Data Legend */}
                    <View style={styles.legendContainer}>
                        {/* Main Calories */}
                        <View style={styles.mainCalorieBlock}>
                            <Text style={[styles.mainCalValue, { color: colors.text }]}>{Math.round(calories)}</Text>
                            <Text style={[styles.mainCalLabel, { color: colors.icon }]}>kcal burned</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Macros Legend */}
                        <View style={styles.statsList}>
                            <StatRow
                                label="Protein"
                                value={protein}
                                target={proteinTarget}
                                color={RINGS.protein.color}
                                icon="fitness"
                            />
                            <StatRow
                                label="Carbs"
                                value={carbs}
                                target={carbsTarget}
                                color={RINGS.carbs.color}
                                icon="restaurant"
                            />
                            <StatRow
                                label="Fats"
                                value={fat}
                                target={fatTarget}
                                color={RINGS.fat.color}
                                icon="water"
                            />
                        </View>
                    </View>
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
        padding: 20,
        borderRadius: 32,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ringsContainer: {
        width: SVG_SIZE,
        height: SVG_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIcon: {
        position: 'absolute',
    },
    legendContainer: {
        flex: 1,
        paddingLeft: 20,
        justifyContent: 'center',
    },
    mainCalorieBlock: {
        marginBottom: 16,
    },
    mainCalValue: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 38,
        letterSpacing: -1,
    },
    mainCalLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
        width: '100%',
    },
    statsList: {
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
    },
});
