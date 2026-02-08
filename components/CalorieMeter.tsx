import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GlassCard } from './GlassCard';
import { Ionicons } from '@expo/vector-icons';

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
const METER_SIZE = width * 0.7; // Slightly larger
const STROKE_WIDTH = 25;
const RADIUS = (METER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = Math.PI * RADIUS;

// Inner dash ring constants
const INNER_RADIUS = RADIUS - 25;
const INNER_CIRCUMFERENCE = Math.PI * INNER_RADIUS;

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

    const percentage = Math.min(calories / target, 1);

    // Dash calculations for the main segmented gauge
    const TOTAL_SEGMENTS = 30; // Number of thick blocks
    const SEGMENT_GAP_RATIO = 0.25; // 25% gap
    const SEGMENT_LENGTH = (CIRCUMFERENCE / TOTAL_SEGMENTS) * (1 - SEGMENT_GAP_RATIO);
    const GAP_LENGTH = (CIRCUMFERENCE / TOTAL_SEGMENTS) * SEGMENT_GAP_RATIO;
    const STROKE_DASHARRAY = `${SEGMENT_LENGTH} ${GAP_LENGTH}`;

    // Calculate how much of the gauge is filled
    // We can't simply use strokeDashoffset for segmented progress easily because it slides the pattern.
    // Instead, we can render two circles: one background, one foreground masked or just overlaying with dashoffset?
    // Actually, for dashed progress, strokeDashoffset DOES work if the pattern is consistent.
    // The trick is aligning the "start" of the dash pattern.
    // Let's try overlaying the filled circle on top.

    // Progress calculation for dashed line:
    // We want to hide the part of the dasharray that corresponds to the unfilled percentage.
    // Wait, typical dashoffset just shifts the pattern.
    // To "fill" a dashed line, we often use `strokeDasharray` for the pattern, and then `strokeDashoffset` reveals it?
    // No, standard SVG behavior: dashoffset shifts the starting point.
    // A better way for a "progress bar" with dashes is to use a Mask, or simpler:
    // Just realize that if `strokeDasharray` creates the segments, we can't easily "fill" 5.5 segments. It fills by length.
    // If the background is full grey segments, and foreground is colored segments, we can just clip the foreground?
    // OR, we can calculate the `strokeDasharray` for the foreground to be `[filled_len, empty_len]`? No, that breaks the segmentation pattern.

    // Best approach for segmented progress:
    // 1. Background Circle: Dashed grey fully visible.
    // 2. Foreground Circle: Same Dashed pattern, but use `strokeDashoffset` to "hide" the rest? 
    // If I increase offset, the line recedes.
    // Determine total length of the arc (half circle = CIRCUMFERENCE).
    // Foreground visible length = CIRCUMFERENCE * percentage.
    // We want the pattern to end at that length.
    // This is tricky with dashes.
    // Alternative: Use a solid colored arc for progress and MASK it with the dash pattern? Yes, that's robust.
    // But react-native-svg masking can be tricky.

    // Let's try the simple offset approach first.
    // Initial offset = CIRCUMFERENCE (hidden). Final offset = 0 (fully shown).
    // For a semi-circle starting at -180 deg (left), going to 0 (right).
    // If we set `strokeDasharray` to the segment pattern.
    // And set `strokeDashoffset` to `CIRCUMFERENCE * (1 - percentage)`.
    // It *slides* the dashes. It doesn't fill them in place. That's the problem.
    // The dashes invoke a "marching ants" effect if changed.

    // Wait! If the background and foreground have the exact same dasharray, and we just overlap them...
    // If I interpret "glass/aesthetic" correctly, usually these are fixed segments.
    // The easiest way to do fixed segments in React Native without complex masking:
    // Render many small path segments based on a loop.
    // Let's do that. It's cleaner and functionally correct for "lighting up" segments.

    const FILLED_SEGMENTS = Math.round(percentage * TOTAL_SEGMENTS);

    const renderSegments = () => {
        const segs = [];
        const gapAngle = (180 / TOTAL_SEGMENTS) * SEGMENT_GAP_RATIO;
        const segAngle = (180 / TOTAL_SEGMENTS) * (1 - SEGMENT_GAP_RATIO);

        for (let i = 0; i < TOTAL_SEGMENTS; i++) {
            const isFilled = i < FILLED_SEGMENTS;
            // Angle goes from 180 (left) to 0 (right) or 180 to 360?
            // SVG coordinate system: 0 is 3 o'clock.
            // We want semi-circle from 9 o'clock (180) to 3 o'clock (0 or 360).
            // Let's start at 180 and go clockwise.
            const startAngle = 180 + (i * (segAngle + gapAngle));
            const endAngle = startAngle + segAngle;

            // Calculate coordinates
            // x = cx + r * cos(a)
            // y = cy + r * sin(a)
            // Angles in radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = (METER_SIZE / 2) + RADIUS * Math.cos(startRad);
            const y1 = (METER_SIZE / 2) + RADIUS * Math.sin(startRad);
            const x2 = (METER_SIZE / 2) + RADIUS * Math.cos(endRad);
            const y2 = (METER_SIZE / 2) + RADIUS * Math.sin(endRad);

            // Path d
            const d = `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`;

            // Use purple gradient for filled? Or just solid color?
            // User image shows gradient purple-ish.
            const color = isFilled ? colors.primary : colors.surfaceHighlight; // Fallback
            // Actually, let's use a nice purple for active.

            segs.push(
                <Path
                    key={i}
                    d={d}
                    stroke={isFilled ? '#8B5CF6' : '#ECE9FA20'} // Hardcoded pretty purple / faded
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                />
            );
        }
        return segs;
    };


    const MiniStat = ({ label, value, targetValue, color, icon }: { label: string, value: number, targetValue: number, color: string, icon?: string }) => (
        <GlassCard style={styles.statItem}>
            <View style={styles.statHeader}>
                <Text style={[styles.statLabel, { color: colors.icon }]}>{label}</Text>
            </View>
            <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                    {value}
                    <Text style={[styles.statTarget, { color: colors.icon }]}> / {targetValue}{label === "Calories" ? "" : "g"}</Text>
                </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: color + '20' }]}>
                <View style={[styles.progressFill, { width: `${Math.min((value / targetValue) * 100, 100)}%`, backgroundColor: color }]} />
            </View>
        </GlassCard>
    );

    return (
        <View style={styles.container}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Today</Text>
            <GlassCard style={styles.card} variant="smoked">
                <View style={styles.meterContainer}>
                    <Svg width={METER_SIZE} height={METER_SIZE / 2 + 30} viewBox={`0 0 ${METER_SIZE} ${METER_SIZE / 2 + 30}`}>
                        <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#8B5CF6" stopOpacity="1" />
                                <Stop offset="1" stopColor="#C4B5FD" stopOpacity="1" />
                            </LinearGradient>
                        </Defs>

                        {/* Render Segments */}
                        {renderSegments()}

                        {/* Inner Dashed Line */}
                        {/* Simple dashed arc */}
                        <Path
                            d={`M ${(METER_SIZE / 2) - INNER_RADIUS} ${METER_SIZE / 2} A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${(METER_SIZE / 2) + INNER_RADIUS} ${METER_SIZE / 2}`}
                            stroke={colors.icon}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            strokeOpacity={0.3}
                            fill="none"
                        />
                    </Svg>

                    <View style={styles.centerContent}>
                        <Ionicons name="flame" size={28} color="#F59E0B" style={{ marginBottom: 4 }} />
                        <Text style={[styles.caloriesValue, { color: colors.text }]}>{Math.round(calories)}</Text>
                        <Text style={[styles.caloriesLabel, { color: colors.icon }]}>kcal</Text>
                    </View>
                </View>

                {/* Bottom Stats Row */}
                <View style={styles.statsRow}>
                    {/* Calories - Custom layout to match image */}
                    <View style={styles.statColumn}>
                        <Text style={[styles.statLabel, { color: colors.icon }]}>Calories</Text>
                        <Text style={[styles.statValueSmall, { color: colors.text }]}>
                            {Math.round(calories)} <Text style={{ color: colors.icon, fontSize: 11, fontWeight: '400' }}>/ {Math.round(target)}</Text>
                        </Text>
                        <View style={[styles.progressBarSmall, { backgroundColor: '#F59E0B20' }]}>
                            <View style={[styles.progressFill, { width: `${percentage * 100}%`, backgroundColor: '#F59E0B' }]} />
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.statColumn}>
                        <Text style={[styles.statLabel, { color: colors.icon }]}>Protein</Text>
                        <Text style={[styles.statValueSmall, { color: colors.text }]}>
                            {Math.round(protein)} <Text style={{ color: colors.icon, fontSize: 11, fontWeight: '400' }}>/ {Math.round(proteinTarget)}g</Text>
                        </Text>
                        <View style={[styles.progressBarSmall, { backgroundColor: '#10B98120' }]}>
                            <View style={[styles.progressFill, { width: `${Math.min((protein / proteinTarget) * 100, 100)}%`, backgroundColor: '#10B981' }]} />
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.statColumn}>
                        <Text style={[styles.statLabel, { color: colors.icon }]}>Fat</Text>
                        <Text style={[styles.statValueSmall, { color: colors.text }]}>
                            {Math.round(fat)} <Text style={{ color: colors.icon, fontSize: 11, fontWeight: '400' }}>/ {Math.round(fatTarget)}g</Text>
                        </Text>
                        <View style={[styles.progressBarSmall, { backgroundColor: '#8B5CF620' }]}>
                            <View style={[styles.progressFill, { width: `${Math.min((fat / fatTarget) * 100, 100)}%`, backgroundColor: '#8B5CF6' }]} />
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        padding: 24,
        borderRadius: 30, // Extra rounded as per image
    },
    meterContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
    },
    centerContent: {
        position: 'absolute',
        bottom: 20, // Adjust based on arc
        alignItems: 'center',
    },
    caloriesValue: {
        fontSize: 40,
        fontWeight: '800',
        lineHeight: 44,
    },
    caloriesLabel: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
    },
    statColumn: {
        flex: 1,
        alignItems: 'flex-start',
        paddingHorizontal: 8,
    },
    divider: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
        opacity: 0.5,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    statValueSmall: {
        fontSize: 13, // Smaller to double stack
        fontWeight: '700',
        marginBottom: 6,
    },
    progressBarSmall: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    // Unused but kept for reference or removal
    statItem: { padding: 10 },
    statHeader: { flexDirection: 'row' },
    statContent: { marginBottom: 5 },
    statValue: { fontSize: 16 },
    statTarget: { fontSize: 12 },
    progressBar: { height: 4, borderRadius: 2 },
    caloriesTarget: { fontSize: 12 },
});

