import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
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
const METER_SIZE = width * 0.8; // Larger to fill space nicely
const STROKE_WIDTH = 32; // Chunkier segments
const RADIUS = (METER_SIZE - STROKE_WIDTH) / 2;
// const CIRCUMFERENCE = Math.PI * RADIUS;

// Inner dash ring constants
const INNER_RADIUS = RADIUS - 35; // Better spacing

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
    const TOTAL_SEGMENTS = 24; // Fewer, chunkier segments
    const SEGMENT_GAP_RATIO = 0.15; // Tighter gaps

    const FILLED_SEGMENTS = Math.round(percentage * TOTAL_SEGMENTS);

    const renderSegments = () => {
        const segs = [];
        // Angles: 180 (left) to 360 (right).
        // Total angle span = 180 degrees.
        const totalAngle = 180;
        const perSegmentAngle = totalAngle / TOTAL_SEGMENTS;
        const gapAngle = perSegmentAngle * SEGMENT_GAP_RATIO;
        const blockAngle = perSegmentAngle - gapAngle;

        for (let i = 0; i < TOTAL_SEGMENTS; i++) {
            const isFilled = i < FILLED_SEGMENTS;

            // Start from 180 degrees and move clockwise
            const startAngle = 180 + (i * perSegmentAngle);
            const endAngle = startAngle + blockAngle;

            // Calculate coordinates
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = (METER_SIZE / 2) + RADIUS * Math.cos(startRad);
            const y1 = (METER_SIZE / 2) + RADIUS * Math.sin(startRad);
            const x2 = (METER_SIZE / 2) + RADIUS * Math.cos(endRad);
            const y2 = (METER_SIZE / 2) + RADIUS * Math.sin(endRad);

            const d = `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`;

            segs.push(
                <Path
                    key={i}
                    d={d}
                    stroke={isFilled ? 'url(#grad)' : (colorScheme === 'dark' ? '#333' : '#F3E8FF')}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round" // Rounded edges for "modern" look
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
                    <Svg width={METER_SIZE} height={METER_SIZE / 2 + 10} viewBox={`0 0 ${METER_SIZE} ${METER_SIZE / 2 + 10}`}>
                        <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#8B5CF6" stopOpacity="1" />
                                <Stop offset="1" stopColor="#A78BFA" stopOpacity="1" />
                            </LinearGradient>
                        </Defs>

                        {/* Render Segments */}
                        {renderSegments()}

                        {/* Inner Dashed Line */}
                        <Path
                            d={`M ${(METER_SIZE / 2) - INNER_RADIUS} ${METER_SIZE / 2} A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${(METER_SIZE / 2) + INNER_RADIUS} ${METER_SIZE / 2}`}
                            stroke={colors.icon}
                            strokeWidth={2}
                            strokeDasharray="4 6" // More spaced out dots
                            strokeOpacity={0.4}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </Svg>

                    <View style={styles.centerContent}>
                        <Ionicons name="flame" size={32} color="#F59E0B" style={{ marginBottom: 4 }} />
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
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        padding: 24,
        borderRadius: 32,
    },
    meterContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
    },
    centerContent: {
        position: 'absolute',
        bottom: 25,
        alignItems: 'center',
    },
    caloriesValue: {
        fontSize: 48,
        fontWeight: '800',
        lineHeight: 54,
        letterSpacing: -1,
    },
    caloriesLabel: {
        fontSize: 16,
        fontWeight: '500',
        opacity: 0.6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)', // Very subtle divider
    },
    statColumn: {
        flex: 1,
        alignItems: 'flex-start',
        paddingHorizontal: 4,
    },
    divider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
        opacity: 0.2,
    },
    statLabel: {
        fontSize: 13,
        marginBottom: 6,
        fontWeight: '500',
        opacity: 0.7,
    },
    statValueSmall: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    progressBarSmall: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
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
