import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassCard } from '@/components/GlassCard';
import { GlassInput } from '@/components/GlassInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Colors } from '@/constants/Colors';
import { removeMeal, updateMeal } from '@/store/mealsSlice'; // Assuming updateMeal exists, if not I will add it or use remove/add pattern
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function MealsManagementScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const dispatch = useDispatch();
    const router = useRouter();
    const meals = useSelector((state: any) => state.meals.meals);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editCalories, setEditCalories] = useState('');

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Meal',
            'Are you sure you want to delete this meal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => dispatch(removeMeal(id)),
                },
            ]
        );
    };

    const saveEdit = () => {
        if (!selectedMeal || !editName || !editCalories) return;

        // Construct new food item preserving existing macros if possible, or defaulting to 0
        const currentFood = selectedMeal.food || {};
        const newFood = {
            ...currentFood,
            id: currentFood.id || Date.now().toString(), // Ensure ID
            name: editName,
            calories: parseInt(editCalories) || 0,
            protein: currentFood.protein || 0,
            carbs: currentFood.carbs || 0,
            fat: currentFood.fat || 0,
            category: currentFood.category || 'custom'
        };

        dispatch(updateMeal({
            id: selectedMeal.id,
            food: newFood
        }));
        setEditModalVisible(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <GlassCard style={styles.mealCard}>
            <View style={styles.mealInfo}>
                <Text style={[styles.mealName, { color: colors.text }]}>{item.title}</Text>
                {item.hasFood && item.food ? (
                    <>
                        <Text style={[styles.foodName, { color: colors.icon }]}>{item.food.name}</Text>
                        <Text style={[styles.mealCalories, { color: colors.primary }]}>{item.food.calories} kcal</Text>
                    </>
                ) : (
                    <Text style={[styles.emptyText, { color: colors.icon }]}>No food logged</Text>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                {item.hasFood && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                )}
            </View>
        </GlassCard>
    );

    const handleEdit = (meal: any) => {
        setSelectedMeal(meal);
        setEditName(meal.food?.name || '');
        setEditCalories(meal.food?.calories?.toString() || '');
        setEditModalVisible(true);
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Manage Meals</Text>
                <View style={{ width: 40 }} />
            </View>

            {meals.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={48} color={colors.icon} />
                    <Text style={[styles.emptyText, { color: colors.icon }]}>No meals saved yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={meals}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Meal</Text>

                        <Text style={[styles.label, { color: colors.text }]}>Meal Name</Text>
                        <GlassInput
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Meal Name"
                            icon="restaurant"
                        />

                        <Text style={[styles.label, { color: colors.text }]}>Calories</Text>
                        <GlassInput
                            value={editCalories}
                            onChangeText={setEditCalories}
                            placeholder="Calories"
                            icon="flame"
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: colors.border }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={{ color: colors.text }}>Cancel</Text>
                            </TouchableOpacity>
                            <PrimaryButton
                                title="Save Changes"
                                onPress={saveEdit}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    mealCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '600',
    },
    foodName: {
        fontSize: 15,
        fontWeight: '500',
        marginTop: 4,
    },
    mealCalories: {
        fontSize: 14,
        marginTop: 4,
    },
    mealDate: {
        fontSize: 12,
        marginTop: 2,
        opacity: 0.7,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderWidth: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
