import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

// Create Animated Path
const AnimatedPath = Animated.createAnimatedComponent(Path);

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
// A wider, shorter meter
const METER_WIDTH = width - 80; // Full width (width) - Margins (40) - Padding (32) - Extra (8)
const STROKE_WIDTH = 20;
// Semi-circle height is roughly half width
const METER_HEIGHT = (METER_WIDTH / 2) + 20;
const RADIUS = (METER_WIDTH - STROKE_WIDTH) / 2;
// Arcs
const ARC_LENGTH = Math.PI * RADIUS; // Length of a semi-circle

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
        const strokeDashoffset = ARC_LENGTH * (1 - progress.value);
        return {
            strokeDashoffset: strokeDashoffset,
        };
    });

    // Define the Arch Path (Half Circle from Left to Right, Arching Upwards)
    // To get an Arch (Inverted U) in SVG (Y-down), we need Counter-Clockwise (Sweep 0) if going Left->Right.
    // Start: (Left, Bottom) -> End: (Right, Bottom)
    // M started_x, started_y A radius_x, radius_y x-axis-rotation large-arc-flag sweep-flag end_x, end_y
    // WAIT. Previous analysis said Sweep 1 is Smile (Down). 
    // Let's try Rotation 180? 
    // Or just: M startX, startY A r,r 0 0 0 endX, endY. (Sweep 0).
    // However, Reanimated might need consistent direction. 
    // Let's use Right -> Left, Sweep 1. (Clockwise).
    // Right (Width, Bottom) -> Left (0, Bottom).
    // Clockwise from Right to Left goes UP.
    const finalPath = `M ${METER_WIDTH - STROKE_WIDTH / 2},${RADIUS + STROKE_WIDTH / 2} A ${RADIUS},${RADIUS} 0 0 1 ${STROKE_WIDTH / 2},${RADIUS + STROKE_WIDTH / 2}`;

    // BUT we want it to fill Left to Right.
    // So distinct path: Left->Right, Sweep 0? No, let's try Sweep 1 (CW) Left->Right = Smile.
    // Left->Right, Sweep 0 (CCW) = Arch.
    // So let's use:
    const arcPath = `M ${STROKE_WIDTH / 2},${RADIUS + STROKE_WIDTH / 2} A ${RADIUS},${RADIUS} 0 0 0 ${METER_WIDTH - STROKE_WIDTH / 2},${RADIUS + STROKE_WIDTH / 2}`;

    const MacroStat = ({ label, value, target, color }: any) => {
        const p = Math.min(value / target, 1);
        return (
            <View style={styles.macroStat}>
                <View style={[styles.macroIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name="ellipse" size={8} color={color} />
                </View>
                <View>
                    <Text style={[styles.macroLabel, { color: colors.icon }]}>{label}</Text>
                    <Text style={[styles.macroValue, { color: colors.text }]}>{Math.round(value)}g</Text>
                </View>
                {/* Tiny vertical bar */}
                <View style={[styles.verticalBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.verticalBarFill, { height: `${p * 100}%`, backgroundColor: color }]} />
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Insight</Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>Today</Text>
            </View>

            <GlassCard style={styles.card} variant="smoked">
                <View style={styles.meterContainer}>
                    {/* The Arch */}
                    <Svg width={METER_WIDTH} height={METER_HEIGHT} viewBox={`0 0 ${METER_WIDTH} ${METER_HEIGHT}`}>
                        <Defs>
                            <LinearGradient id="archGradient" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#3B82F6" />
                                <Stop offset="0.5" stopColor="#8B5CF6" />
                                <Stop offset="1" stopColor="#EC4899" />
                            </LinearGradient>
                        </Defs>

                        {/* Background Track */}
                        <Path
                            d={arcPath}
                            stroke={colors.glass.borderColor}
                            strokeWidth={STROKE_WIDTH}
                            strokeLinecap="butt" // "Butt" allows cleaner segments if we wanted
                            fill="none"
                            strokeOpacity={0.3}
                        />

                        {/* Progress Arch */}
                        <AnimatedPath
                            d={arcPath}
                            stroke="url(#archGradient)"
                            strokeWidth={STROKE_WIDTH}
                            strokeLinecap="round" // Round ends look better
                            fill="none"
                            strokeDasharray={ARC_LENGTH}
                            animatedProps={animatedProps}
                        />
                    </Svg>

                    {/* Central Data Block */}
                    <View style={styles.centralData}>
                        <Text style={[styles.mainValue, { color: colors.text }]}>
                            {Math.round(calories)}
                            <Text style={[styles.unitLabel, { color: colors.icon }]}> kcal</Text>
                        </Text>
                        <Text style={[styles.targetLabel, { color: colors.icon }]}>
                            / {target} goal
                        </Text>
                    </View>

                    {/* Architectural "Pillars" (Macros) */}
                    <View style={styles.pillarsRow}>
                        <View style={[styles.pillar, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text style={[styles.pillarLabel, { color: colors.icon }]}>Protein</Text>
                            <Text style={[styles.pillarValue, { color: colors.text }]}>{Math.round(protein)}g</Text>
                            <View style={styles.barContainer}>
                                <View style={[styles.barFill, { width: `${Math.min(protein / proteinTarget, 1) * 100}%`, backgroundColor: '#10B981' }]} />
                            </View>
                        </View>

                        <View style={[styles.pillar, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text style={[styles.pillarLabel, { color: colors.icon }]}>Carbs</Text>
                            <Text style={[styles.pillarValue, { color: colors.text }]}>{Math.round(carbs)}g</Text>
                            <View style={styles.barContainer}>
                                <View style={[styles.barFill, { width: `${Math.min(carbs / carbsTarget, 1) * 100}%`, backgroundColor: '#3B82F6' }]} />
                            </View>
                        </View>

                        <View style={[styles.pillar, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text style={[styles.pillarLabel, { color: colors.icon }]}>Fats</Text>
                            <Text style={[styles.pillarValue, { color: colors.text }]}>{Math.round(fat)}g</Text>
                            <View style={styles.barContainer}>
                                <View style={[styles.barFill, { width: `${Math.min(fat / fatTarget, 1) * 100}%`, backgroundColor: '#F59E0B' }]} />
                            </View>
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
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 32,
        overflow: 'hidden',
    },
    meterContainer: {
        alignItems: 'center',
        position: 'relative',
        // We push the content up because drawing the semi-circle leaves space below in the viewbox if not careful, 
        // but here we sized METER_HEIGHT perfectly.
    },
    centralData: {
        position: 'absolute',
        top: METER_HEIGHT - 60, // Position strictly relative to the Arch
        alignItems: 'center',
    },
    mainValue: {
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
    },
    unitLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    targetLabel: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    pillarsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 32, // Space between arch and pillars
        gap: 12,
    },
    pillar: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    pillarLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    pillarValue: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
    },
    barContainer: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    // Unused but kept for reference if needed
    macroStat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    macroIcon: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    macroLabel: { fontSize: 12, fontWeight: '500' },
    macroValue: { fontSize: 13, fontWeight: '700' },
    verticalBarBg: { width: 4, height: 24, borderRadius: 2, marginLeft: 'auto' },
    verticalBarFill: { width: '100%', borderRadius: 2, position: 'absolute', bottom: 0 },
});
