import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    withDelay,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

// Premium colors matching app theme
const RING_COLORS = {
    calories: ['#FF6B6B', '#FF8E53'],
    protein: ['#4ECDC4', '#45B7AA'],
    carbs: ['#A78BFA', '#8B5CF6'],
    fat: ['#F472B6', '#EC4899'],
};

const SVG_SIZE = 240;
const CENTER = SVG_SIZE / 2;
const STROKE_WIDTH = 16;
const GAP = 8;

export const CalorieMeter: React.FC<CalorieMeterProps> = ({
    calories, target, protein, proteinTarget, carbs, carbsTarget, fat, fatTarget,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const [activeIndex, setActiveIndex] = useState(0);

    const data = [
        { key: 'calories', label: 'Calories', value: calories, target: target, unit: 'kcal', colors: RING_COLORS.calories, icon: 'flame-outline' },
        { key: 'protein', label: 'Protein', value: protein, target: proteinTarget, unit: 'g', colors: RING_COLORS.protein, icon: 'barbell-outline' },
        { key: 'carbs', label: 'Carbs', value: carbs, target: carbsTarget, unit: 'g', colors: RING_COLORS.carbs, icon: 'nutrition-outline' },
        { key: 'fat', label: 'Fat', value: fat, target: fatTarget, unit: 'g', colors: RING_COLORS.fat, icon: 'water-outline' },
    ];

    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);
    const anim3 = useSharedValue(0);
    const anim4 = useSharedValue(0);
    const animatedValues = [anim1, anim2, anim3, anim4];

    const pulseScale = useSharedValue(1);

    useEffect(() => {
        data.forEach((item, index) => {
            const progress = Math.min(Math.max(item.value / (item.target || 1), 0), 1);
            animatedValues[index].value = withDelay(index * 150, withTiming(progress, {
                duration: 1200,
                easing: Easing.out(Easing.cubic),
            }));
        });
    }, [calories, protein, carbs, fat, target]);

    const handlePress = () => {
        pulseScale.value = withSpring(0.96, { damping: 15 }, () => {
            pulseScale.value = withSpring(1, { damping: 10 });
        });
        setActiveIndex((prev) => (prev + 1) % data.length);
    };

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const activeItem = data[activeIndex];
    const progressPercent = Math.round((activeItem.value / (activeItem.target || 1)) * 100);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Progress</Text>
                <View style={[styles.badge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '30' }]}>
                    <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>Live</Text>
                </View>
            </View>

            <AnimatedPressable onPress={handlePress} style={containerAnimatedStyle}>
                <BlurView
                    intensity={colorScheme === 'dark' ? 50 : 80}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={[styles.glassCard, { borderColor: colors.border }]}
                >
                    {/* Additional glass layer for depth */}
                    <View style={[styles.glassOverlay, {
                        backgroundColor: colorScheme === 'dark'
                            ? 'rgba(31, 41, 55, 0.4)'
                            : 'rgba(255, 255, 255, 0.6)'
                    }]} />

                    <View style={styles.chartArea}>
                        <Svg width={SVG_SIZE} height={SVG_SIZE}>
                            <Defs>
                                {data.map((item) => (
                                    <SvgLinearGradient key={`grad-${item.key}`} id={`grad-${item.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <Stop offset="0%" stopColor={item.colors[0]} stopOpacity="1" />
                                        <Stop offset="100%" stopColor={item.colors[1]} stopOpacity="0.95" />
                                    </SvgLinearGradient>
                                ))}
                                {/* Shadow gradient for rings */}
                                <SvgLinearGradient id="shadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor="#000" stopOpacity="0.05" />
                                    <Stop offset="100%" stopColor="#000" stopOpacity="0.15" />
                                </SvgLinearGradient>
                            </Defs>

                            {data.map((item, index) => {
                                const radius = (SVG_SIZE - STROKE_WIDTH) / 2 - (index * (STROKE_WIDTH + GAP));
                                const circumference = 2 * Math.PI * radius;
                                return (
                                    <RingSegment
                                        key={item.key}
                                        radius={radius}
                                        circumference={circumference}
                                        gradientId={`grad-${item.key}`}
                                        animValue={animatedValues[index]}
                                        isActive={activeIndex === index}
                                        colorScheme={colorScheme}
                                    />
                                );
                            })}
                        </Svg>

                        {/* Center Content with better contrast */}
                        <View style={styles.centerContent}>
                            <BlurView
                                intensity={60}
                                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                                style={styles.centerBlur}
                            >
                                <LinearGradient
                                    colors={activeItem.colors}
                                    style={styles.iconBadge}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name={activeItem.icon as any} size={22} color="#fff" />
                                </LinearGradient>

                                <Text style={[styles.centerValue, {
                                    color: colors.text,
                                    textShadowColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
                                    textShadowOffset: { width: 0, height: 1 },
                                    textShadowRadius: 2,
                                }]}>
                                    {Math.round(activeItem.value)}
                                </Text>

                                <Text style={[styles.centerUnit, {
                                    color: colors.icon,
                                    fontWeight: '600',
                                }]}>
                                    of {activeItem.target} {activeItem.unit}
                                </Text>

                                <View style={[styles.progressPill, {
                                    backgroundColor: activeItem.colors[0],
                                }]}>
                                    <Text style={[styles.progressText, { color: '#FFFFFF' }]}>
                                        {progressPercent}% Complete
                                    </Text>
                                </View>

                                <Text style={[styles.centerLabel, {
                                    color: activeItem.colors[0],
                                    fontWeight: '700'
                                }]}>
                                    {activeItem.label}
                                </Text>
                            </BlurView>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
                        {data.map((item, index) => (
                            <Pressable
                                key={item.key}
                                onPress={() => setActiveIndex(index)}
                                style={({ pressed }) => [
                                    styles.legendItem,
                                    activeIndex === index && {
                                        backgroundColor: colorScheme === 'dark'
                                            ? 'rgba(255,255,255,0.12)'
                                            : 'rgba(0,0,0,0.08)',
                                    },
                                    pressed && { opacity: 0.7 }
                                ]}
                            >
                                <View style={[styles.legendDot, {
                                    backgroundColor: item.colors[0],
                                    shadowColor: item.colors[0],
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 3,
                                    elevation: 3,
                                }]} />
                                <Text style={[styles.legendLabel, {
                                    color: colors.text,
                                    fontWeight: '600'
                                }]}>
                                    {item.label}
                                </Text>
                                <Text style={[styles.legendValue, {
                                    color: item.colors[0],
                                    fontWeight: '800'
                                }]}>
                                    {Math.round(item.value / (item.target || 1) * 100)}%
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </BlurView>
            </AnimatedPressable>
        </View>
    );
};

const RingSegment = ({ radius, circumference, gradientId, animValue, isActive, colorScheme }: any) => {
    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - animValue.value),
    }));

    const trackColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    return (
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            {/* Track */}
            <Circle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={trackColor}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
            />
            {/* Progress with glow effect */}
            <AnimatedCircle
                cx={CENTER} cy={CENTER} r={radius}
                stroke={`url(#${gradientId})`}
                strokeWidth={isActive ? STROKE_WIDTH + 3 : STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={[circumference, circumference]}
                animatedProps={animatedProps}
                fill="transparent"
                opacity={isActive ? 1 : 0.85}
            />
        </G>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    glassCard: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
    },
    chartArea: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 28,
        position: 'relative',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerBlur: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    centerValue: {
        fontSize: 32,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        letterSpacing: -1.5,
    },
    centerUnit: {
        fontSize: 13,
        marginTop: 2,
        marginBottom: 10,
    },
    progressPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    centerLabel: {
        fontSize: 13,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        gap: 6,
    },
    legendItem: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 14,
        flex: 1,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 6,
    },
    legendLabel: {
        fontSize: 11,
        marginBottom: 3,
    },
    legendValue: {
        fontSize: 14,
    },
});
