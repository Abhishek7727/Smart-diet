import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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

// Enhanced Palette
const THEME = {
    calories: ['#FF453A', '#FF9F0A'], // Red-Orange
    protein: ['#30D158', '#63E6E2'], // Green-Teal
    carbs: ['#0A84FF', '#5AC8FA'],   // Blue-Cyan
    fat: ['#BF5AF2', '#FF375F'],     // Purple-Pink
};

const SVG_SIZE = 300; // Increased size to fit everything comfortably
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 20; // Thicker strokes for impact
const GAP = 12; // Gap between rings

export const CalorieMeter: React.FC<CalorieMeterProps> = ({
    calories, target, protein, proteinTarget, carbs, carbsTarget, fat, fatTarget,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // State for interactive center display
    const [activeIndex, setActiveIndex] = useState(0); // 0: Cal, 1: Pro, 2: Carb, 3: Fat

    // Data Structure
    const data = [
        { key: 'calories', label: 'Calories', value: calories, target: target, unit: 'kcal', colors: THEME.calories, icon: 'flame' },
        { key: 'protein', label: 'Protein', value: protein, target: proteinTarget, unit: 'g', colors: THEME.protein, icon: 'fitness' },
        { key: 'carbs', label: 'Carbs', value: carbs, target: carbsTarget, unit: 'g', colors: THEME.carbs, icon: 'restaurant' },
        { key: 'fat', label: 'Fat', value: fat, target: fatTarget, unit: 'g', colors: THEME.fat, icon: 'water' },
    ];

    // Shared Values for Animation
    // We can't map hooks in a loop in the same way if the array length was dynamic, but here it's static (4).
    // However, hooks must be called at top level.
    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);
    const anim3 = useSharedValue(0);
    const anim4 = useSharedValue(0);
    const animatedValues = [anim1, anim2, anim3, anim4];

    useEffect(() => {
        data.forEach((item, index) => {
            const progress = Math.min(Math.max(item.value / (item.target || 1), 0), 1);
            // Staggered animation
            animatedValues[index].value = withDelay(index * 200, withTiming(progress, {
                duration: 1500,
                easing: Easing.out(Easing.exp),
            }));
        });
    }, [calories, protein, carbs, fat, target]);

    const activeItem = data[activeIndex];

    // Helper to render rings
    const renderRings = () => {
        return data.map((item, index) => {
            // Calculate radius for each ring from outside in
            // Outer ring radius = (Size - Stroke) / 2
            // Next ring = Previous - Stroke - Gap
            const radius = (SVG_SIZE - STROKE_WIDTH) / 2 - (index * (STROKE_WIDTH + GAP));
            const circumference = 2 * Math.PI * radius;

            // We need to use useAnimatedProps outside the map? 
            // No, we can use it inside a component.
            // Let's create a sub-component for the ring to be safe with hooks.
            return (
                <Ring
                    key={item.key}
                    index={index}
                    radius={radius}
                    circumference={circumference}
                    strokeWidth={STROKE_WIDTH}
                    colorKey={item.key}
                    animValue={animatedValues[index]}
                    colors={item.colors}
                    themeMode={colorScheme}
                />
            );
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Activity</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Interactive Hub</Text>
            </View>

            <LinearGradient
                colors={colorScheme === 'dark' ? ['#1F293700', '#1F2937'] : ['#ffffff', '#f8f9fa']}
                style={[styles.card, { borderColor: colors.border, borderWidth: 1 }]}
            >
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff', opacity: 0.95 }]} />

                <View style={styles.chartContainer}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setActiveIndex((prev) => (prev + 1) % data.length)}
                        style={styles.touchableArea}
                    >
                        <Svg width={SVG_SIZE} height={SVG_SIZE}>
                            <Defs>
                                {data.map((item) => (
                                    <SvgLinearGradient key={`grad-${item.key}`} id={`grad-${item.key}`} x1="0" y1="0" x2="1" y2="1">
                                        <Stop offset="0" stopColor={item.colors[0]} />
                                        <Stop offset="1" stopColor={item.colors[1]} />
                                    </SvgLinearGradient>
                                ))}
                            </Defs>

                            {/* Render Rings */}
                            {renderRings()}

                        </Svg>

                        {/* Center Display */}
                        <View style={[styles.centerOverlay, { width: SVG_SIZE / 2.2, height: SVG_SIZE / 2.2 }]}>
                            <View style={styles.centerContent}>
                                <Ionicons name={activeItem.icon as any} size={28} color={activeItem.colors[1]} style={{ marginBottom: 8 }} />
                                <Text style={[styles.centerValue, { color: colors.text }]}>
                                    {Math.round(activeItem.value)}
                                </Text>
                                <Text style={[styles.centerUnit, { color: colors.icon }]}>
                                    {activeItem.unit}
                                </Text>
                                <Text style={[styles.centerLabel, { color: activeItem.colors[1] }]}>
                                    {activeItem.label}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Legend / Controls */}
                <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.legendItem,
                                activeIndex === index && { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
                            ]}
                            onPress={() => setActiveIndex(index)}
                        >
                            <LinearGradient
                                colors={item.colors}
                                style={styles.legendIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={item.icon as any} size={16} color="white" />
                            </LinearGradient>
                            <Text style={[styles.legendLabel, { color: colors.icon }]}>{item.label}</Text>
                            <Text style={[styles.legendValue, { color: colors.text }]}>
                                {Math.round(item.value / (item.target || 1) * 100)}%
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </LinearGradient>
        </View>
    );
};

// Sub-component for individual ring to handle hooks cleanly
const Ring = ({ index, radius, circumference, strokeWidth, colorKey, animValue, colors, themeMode }: any) => {

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: circumference * (1 - animValue.value),
        };
    });

    return (
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            {/* Background Track */}
            <Circle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={themeMode === 'dark' ? '#374151' : '#E5E7EB'}
                strokeWidth={strokeWidth}
                strokeOpacity={0.3}
            />
            {/* Progress Ring */}
            <AnimatedCircle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={`url(#grad-${colorKey})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={[circumference, circumference]}
                animatedProps={animatedProps}
            />
        </G>
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
        letterSpacing: -0.5,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 32,
        overflow: 'hidden',
        padding: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        position: 'relative',
    },
    touchableArea: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        // Optional: Add a subtle blur or background to make text pop over rings if needed
        // but here rings are outside.
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerValue: {
        fontSize: 36,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
        letterSpacing: -1,
        lineHeight: 40,
    },
    centerUnit: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        opacity: 0.8,
    },
    centerLabel: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        backgroundColor: 'rgba(120, 120, 120, 0.05)',
    },
    legendItem: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 20,
        minWidth: 70,
    },
    legendIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    legendLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    legendValue: {
        fontSize: 14,
        fontWeight: '700',
    },
});
