import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GlassCard } from './GlassCard';

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
const METER_SIZE = width * 0.6;
const STROKE_WIDTH = 20;
const RADIUS = (METER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = Math.PI * RADIUS; // Semi-circle

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
    const strokeDashoffset = CIRCUMFERENCE * (1 - percentage);

    // Meter Needle Rotation (0 to 180 degrees)
    const rotation = percentage * 180;

    const MiniStat = ({ label, value, targetValue, color }: { label: string, value: number, targetValue: number, color: string }) => (
        <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.icon }]}>{label}</Text>
            <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.statTarget, { color: colors.icon }]}>/{targetValue}g</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.surfaceHighlight }]}>
                <View style={[styles.progressFill, { width: `${Math.min((value / targetValue) * 100, 100)}%`, backgroundColor: color }]} />
            </View>
        </View>
    );

    return (
        <GlassCard style={styles.container}>
            <View style={styles.meterContainer}>
                <Svg width={METER_SIZE} height={METER_SIZE / 2 + 20} viewBox={`0 0 ${METER_SIZE} ${METER_SIZE / 2 + 20}`}>
                    <G rotation="-90" origin={`${METER_SIZE / 2}, ${METER_SIZE / 2}`}>
                        {/* Background Arc */}
                        <Circle
                            cx={METER_SIZE / 2}
                            cy={METER_SIZE / 2}
                            r={RADIUS}
                            stroke={colors.surfaceHighlight}
                            strokeWidth={STROKE_WIDTH}
                            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                            fill="transparent"
                            strokeLinecap="round"
                        />
                        {/* Progress Arc */}
                        <Circle
                            cx={METER_SIZE / 2}
                            cy={METER_SIZE / 2}
                            r={RADIUS}
                            stroke={colors.primary}
                            strokeWidth={STROKE_WIDTH}
                            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                            strokeDashoffset={strokeDashoffset}
                            fill="transparent"
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>

                <View style={styles.centerContent}>
                    <Text style={[styles.caloriesValue, { color: colors.text }]}>{calories}</Text>
                    <Text style={[styles.caloriesLabel, { color: colors.icon }]}>kcal</Text>
                    <Text style={[styles.caloriesTarget, { color: colors.icon }]}>Target: {target}</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <MiniStat label="Protein" value={protein} targetValue={proteinTarget} color={colors.primary} />
                <MiniStat label="Carbs" value={carbs} targetValue={carbsTarget} color={colors.success} />
                <MiniStat label="Fat" value={fat} targetValue={fatTarget} color={colors.secondary} />
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        marginHorizontal: 20,
    },
    meterContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        height: 150, // Fixed height to contain the semi-circle and text
    },
    centerContent: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
    },
    caloriesValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    caloriesLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    caloriesTarget: {
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    statTarget: {
        fontSize: 10,
        marginLeft: 2,
    },
    progressBar: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    }
});
