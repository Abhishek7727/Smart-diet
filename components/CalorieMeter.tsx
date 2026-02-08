import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
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

// Modern App Theme - Clean & Vibrant
const THEME = {
    calories: ['#FF4D4D', '#F9CB28'], // Red to Yellow gradient
    protein: ['#00C6FB', '#005BEA'], // Light Blue to Dark Blue
    carbs: ['#7F00FF', '#E100FF'], // Purple to Pink
    fat: ['#F2994A', '#F2C94C'], // Orange to Yellow
};

const SVG_SIZE = 120;
const STROKE_WIDTH = 12;
const RADIUS = (SVG_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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

    // Progress Values
    const pCal = Math.min(calories / target, 1);
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(pCal, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });
    }, [pCal]);

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
        };
    });

    const MacroBar = ({ label, value, target, colors: gradientColors, delay }: any) => {
        const p = Math.min(value / target, 1);
        const barProgress = useSharedValue(0);

        useEffect(() => {
            barProgress.value = withDelay(delay, withTiming(p, {
                duration: 1200,
                easing: Easing.out(Easing.quad),
            }));
        }, [p]);

        // We can't easily animate width with native driver layout props in simple views without Animated.View style props,
        // but for simplicity in this structure we'll use a simple flex-based or width % approach inside an Animated component 
        // OR just render it since it's a simple width. Let's stick to standard View with width % for now or Reanimated if we want smoothness.
        // Let's use a simple Animated.View for the width.

        const animatedStyle = useAnimatedProps(() => {
            return {
                width: `${barProgress.value * 100}%`
            };
        });

        const AnimatedView = Animated.createAnimatedComponent(View);

        return (
            <View style={styles.macroRow}>
                <View style={styles.macroHeader}>
                    <Text style={[styles.macroLabel, { color: colors.text }]}>{label}</Text>
                    <Text style={[styles.macroValue, { color: colors.icon }]}>
                        {Math.round(value)}g <Text style={{ fontSize: 10, opacity: 0.6 }}>/ {target}g</Text>
                    </Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceHighlight }]}>
                    {/* We need a gradient view, but react-native-linear-gradient acts up sometimes in Expo Go without config.
                        We'll use a solid color fallback or just a colored view. 
                        Actually, SVG LinearGradient inside a Rect fits best, but standard View + backgroundColor is safer.
                        Let's use the second color of the tuple for now or a solid mix. */}
                    <AnimatedView style={[styles.fill, { backgroundColor: gradientColors[1] }, { width: `${p * 100}%` }]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Summary</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Today</Text>
            </View>

            <GlassCard style={styles.card} variant="default">
                <View style={styles.contentContainer}>
                    {/* Left: Calorie Ring */}
                    <View style={styles.leftColumn}>
                        <Svg width={SVG_SIZE} height={SVG_SIZE}>
                            <Defs>
                                <LinearGradient id="calGradient" x1="0" y1="0" x2="1" y2="1">
                                    <Stop offset="0" stopColor={THEME.calories[0]} />
                                    <Stop offset="1" stopColor={THEME.calories[1]} />
                                </LinearGradient>
                            </Defs>
                            {/* Track */}
                            <Circle
                                cx={SVG_SIZE / 2}
                                cy={SVG_SIZE / 2}
                                r={RADIUS}
                                stroke={colors.glass.borderColor}
                                strokeWidth={STROKE_WIDTH}
                                strokeOpacity={0.5}
                            />
                            {/* Progress */}
                            <AnimatedCircle
                                cx={SVG_SIZE / 2}
                                cy={SVG_SIZE / 2}
                                r={RADIUS}
                                stroke="url(#calGradient)"
                                strokeWidth={STROKE_WIDTH}
                                strokeLinecap="round"
                                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                                animatedProps={animatedProps}
                                rotation="-90"
                                origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`}
                            />
                        </Svg>
                        <View style={styles.ringText}>
                            <Ionicons name="flame" size={20} color={THEME.calories[0]} style={{ marginBottom: 2 }} />
                            <Text style={[styles.ringValue, { color: colors.text }]}>{Math.round(calories)}</Text>
                            <Text style={[styles.ringLabel, { color: colors.icon }]}>kcal</Text>
                        </View>
                    </View>

                    {/* Right: Macro List */}
                    <View style={styles.rightColumn}>
                        <MacroBar
                            label="Protein"
                            value={protein}
                            target={proteinTarget}
                            colors={THEME.protein}
                            delay={200}
                        />
                        <MacroBar
                            label="Carbs"
                            value={carbs}
                            target={carbsTarget}
                            colors={THEME.carbs}
                            delay={400}
                        />
                        <MacroBar
                            label="Fats"
                            value={fat}
                            target={fatTarget}
                            colors={THEME.fat}
                            delay={600}
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
        fontSize: 20,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        padding: 20,
        borderRadius: 24,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    leftColumn: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    ringText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringValue: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    ringLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    rightColumn: {
        flex: 1,
        gap: 16,
    },
    macroRow: {
        gap: 6,
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    macroLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    macroValue: {
        fontSize: 13,
        fontWeight: '500',
    },
    track: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    },
});
