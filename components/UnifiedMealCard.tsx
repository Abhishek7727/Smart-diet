import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GlassCard } from './GlassCard';

interface Meal {
    id: string;
    title: string;
    time: string;
    food?: {
        name: string;
        calories: number;
    };
    hasFood: boolean;
}

interface UnifiedMealCardProps {
    meals: Meal[];
    onMealPress: (mealId: string) => void;
}

export const UnifiedMealCard: React.FC<UnifiedMealCardProps> = ({ meals, onMealPress }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const getIconFn = (id: string) => {
        switch (id) {
            case 'breakfast': return 'sunny-outline';
            case 'lunch': return 'restaurant-outline';
            case 'dinner': return 'moon-outline';
            default: return 'cafe-outline';
        }
    };

    return (
        <GlassCard style={styles.container}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Meals</Text>

            <View style={styles.listContainer}>
                {meals.map((meal, index) => (
                    <TouchableOpacity
                        key={meal.id}
                        style={[
                            styles.mealRow,
                            index !== meals.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                        ]}
                        onPress={() => onMealPress(meal.id)}
                        activeOpacity={0.7}
                    >
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: meal.hasFood ? colors.primary + '20' : colors.surfaceHighlight }]}>
                            <Ionicons
                                name={getIconFn(meal.id) as any}
                                size={20}
                                color={meal.hasFood ? colors.primary : colors.icon}
                            />
                        </View>

                        {/* Content */}
                        <View style={styles.contentContainer}>
                            <Text style={[styles.mealTitle, { color: colors.text }]}>{meal.title}</Text>
                            {meal.hasFood ? (
                                <Text style={[styles.foodName, { color: colors.icon }]} numberOfLines={1}>
                                    {meal.food?.name} • {meal.food?.calories} kcal
                                </Text>
                            ) : (
                                <Text style={[styles.mealTime, { color: colors.icon }]}>{meal.time}</Text>
                            )}
                        </View>

                        {/* Action/Status */}
                        <Ionicons
                            name={meal.hasFood ? "checkmark-circle" : "add-circle-outline"}
                            size={24}
                            color={meal.hasFood ? colors.success : colors.icon}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        padding: 20,
        marginBottom: 100, // Space for bottom tab
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    listContainer: {
        gap: 0,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
        marginRight: 12,
    },
    mealTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    mealTime: {
        fontSize: 12,
    },
    foodName: {
        fontSize: 12,
    }
});
