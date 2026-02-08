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

const SVG_SIZE = 250; // Reduced size from 300 to 250 to save space
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 14; // Thinner strokes (was 20) for more elegance and inner space
const GAP = 8; // Smaller gap (was 12)

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
            const radius = (SVG_SIZE - STROKE_WIDTH) / 2 - (index * (STROKE_WIDTH + GAP));
            const circumference = 2 * Math.PI * radius;

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

            {/* Changed background to transparent as requested */}
            <View style={[styles.card, { backgroundColor: 'transparent' }]}>

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

                        {/* Center Display - Adjusted text sizes */}
                        <View style={[styles.centerOverlay, { width: SVG_SIZE / 2.5, height: SVG_SIZE / 2.5 }]}>
                            <View style={styles.centerContent}>
                                <Ionicons name={activeItem.icon as any} size={24} color={activeItem.colors[1]} style={{ marginBottom: 4 }} />
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

                {/* Legend / Controls - Adjusted padding */}
                <View style={[styles.legendRow, { borderTopColor: 'transparent' }]}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[
                                styles.legendItem,
                                activeIndex === index && styles.activeLegendItem,
                                // Subtle border for active item visibility on transparent bg
                                { borderColor: activeIndex === index ? item.colors[1] : 'transparent', borderWidth: 1 }
                            ]}
                            onPress={() => setActiveIndex(index)}
                        >
                            <LinearGradient
                                colors={item.colors}
                                style={styles.legendIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={item.icon as any} size={14} color="white" />
                            </LinearGradient>
                            <Text style={[styles.legendLabel, { color: colors.icon }]}>{item.label}</Text>
                            <Text style={[styles.legendValue, { color: colors.text }]}>
                                {Math.round(item.value / (item.target || 1) * 100)}%
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </View>
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
            {/* Background Track - Subtle Opacity */}
            <Circle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={themeMode === 'dark' ? '#ffffff' : '#000000'}
                strokeWidth={strokeWidth}
                strokeOpacity={0.1}
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
        marginHorizontal: 16, // Slightly reduced margins
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12, // Reduced margin
        paddingHorizontal: 4,
    },
    headerTitle: {
        fontSize: 20, // Slightly reduced font size
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 24,
        overflow: 'visible', // Changed to visible so padding doesn't clip if used
        padding: 0,
        // Removed heavy shadows/elevation since transparent bg was requested
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16, // Significantly reduced padding
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
        // Make sure touches pass through to the touchable area if needed, 
        // but since touchable wraps everything, it's fine.
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerValue: {
        fontSize: 28, // Reduced size (was 36)
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    centerUnit: {
        fontSize: 12, // Reduced size
        fontWeight: '600',
        marginBottom: 2,
        opacity: 0.8,
    },
    centerLabel: {
        fontSize: 11, // Reduced size
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12, // Reduced padding
        paddingHorizontal: 8,
        // Removed background color for legend row
    },
    legendItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 16,
        minWidth: 60, // Smaller min width
    },
    activeLegendItem: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)', // Subtle highlight for active item
    },
    legendIcon: {
        width: 28,
        height: 28, // Smaller icons
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    legendLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 0,
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    legendValue: {
        fontSize: 12,
        fontWeight: '700',
    },
});
