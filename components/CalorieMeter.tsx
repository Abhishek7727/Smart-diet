import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
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

// Vibrant Neon Palette
const THEME = {
    calories: '#FF0055', // Neon Pink
    protein: '#00FFE0', // Neon Cyan
    carbs: '#BD00FF', // Neon Purple
    fat: '#FFD600', // Neon Yellow
    track: 'rgba(255,255,255,0.1)'
};

// Ring Configuration
const RINGS = {
    calories: { radius: 70, stroke: 10, color: THEME.calories },
    protein: { radius: 56, stroke: 10, color: THEME.protein },
    carbs: { radius: 42, stroke: 10, color: THEME.carbs },
    fat: { radius: 28, stroke: 10, color: THEME.fat },
};

const SVG_SIZE = 180;
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

    // Cap progress at 1
    const pCal = Math.min(calories / target, 1);
    const pPro = Math.min(protein / proteinTarget, 1);
    const pCarb = Math.min(carbs / carbsTarget, 1);
    const pFat = Math.min(fat / fatTarget, 1);

    const MacroPill = ({ label, value, target, color, icon }: any) => {
        const percentage = Math.round((value / target) * 100);
        return (
            <View style={[styles.macroPill, { borderColor: color + '50', backgroundColor: color + '10' }]}>
                {/* Colored Dot */}
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={styles.macroContent}>
                    <Text style={[styles.macroLabel, { color: colors.icon }]}>{label}</Text>
                    <Text style={[styles.macroValue, { color: colors.text }]}>
                        {Math.round(value)}g <Text style={{ fontSize: 10, opacity: 0.7 }}>({percentage}%)</Text>
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Insight</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Today</Text>
            </View>

            <GlassCard style={styles.card} variant="smoked">
                <View style={styles.innerContainer}>
                    {/* Top: Rings Graph */}
                    <View style={styles.graphContainer}>
                        <Svg width={SVG_SIZE} height={SVG_SIZE}>
                            {/* Outer: Calories */}
                            <Ring radius={RINGS.calories.radius} stroke={RINGS.calories.stroke} color={RINGS.calories.color} progress={pCal} delay={0} />

                            {/* Mid: Protein */}
                            <Ring radius={RINGS.protein.radius} stroke={RINGS.protein.stroke} color={RINGS.protein.color} progress={pPro} delay={200} />

                            {/* Mid: Carbs */}
                            <Ring radius={RINGS.carbs.radius} stroke={RINGS.carbs.stroke} color={RINGS.carbs.color} progress={pCarb} delay={400} />

                            {/* Inner: Fat */}
                            <Ring radius={RINGS.fat.radius} stroke={RINGS.fat.stroke} color={RINGS.fat.color} progress={pFat} delay={600} />
                        </Svg>

                        {/* Centered Calorie Text */}
                        <View style={styles.centerTextContainer}>
                            <Text style={[styles.centerValue, { color: colors.text }]}>{Math.round(calories)}</Text>
                            <Text style={[styles.centerLabel, { color: colors.icon }]}>kcal</Text>
                        </View>
                    </View>

                    {/* Bottom: Metrics Pills */}
                    <View style={styles.metricsRow}>
                        <MacroPill
                            label="Protein"
                            value={protein}
                            target={proteinTarget}
                            color={THEME.protein}
                            icon="fitness"
                        />
                        <MacroPill
                            label="Carbs"
                            value={carbs}
                            target={carbsTarget}
                            color={THEME.carbs}
                            icon="restaurant"
                        />
                        <MacroPill
                            label="Fats"
                            value={fat}
                            target={fatTarget}
                            color={THEME.fat}
                            icon="water"
                        />
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
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 32,
    },
    innerContainer: {
        alignItems: 'center',
        gap: 24,
    },
    graphContainer: {
        width: SVG_SIZE,
        height: SVG_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    centerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerValue: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        lineHeight: 34,
    },
    centerLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    metricsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    macroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        minWidth: '30%',
        flex: 1,
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    macroContent: {
        alignItems: 'flex-start',
    },
    macroLabel: {
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 12,
        marginBottom: 2,
    },
    macroValue: {
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 16,
    },
});
