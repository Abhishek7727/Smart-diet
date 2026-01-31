import { ScreenWrapper } from '@/components/ScreenWrapper';
import AIFoodRecommendation from '@/components/AIFoodRecommendation';
import { useMealPlan } from '@/components/MealPlanContext';
import { Colors } from '@/constants/Colors';
import StorageService from '@/services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassCard } from '@/components/GlassCard';
import { GlassInput } from '@/components/GlassInput';
import { PrimaryButton } from '@/components/PrimaryButton';

const { width } = Dimensions.get('window');

const MealsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [customMealData, setCustomMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const {
    meals,
    updateMeal,
    removeMeal,
    getTotalNutrition,
    addCustomMeal,
    clearAllMeals,
    personalInfo,
    isLoading: contextLoading
  } = useMealPlan();

  const totalNutrition = getTotalNutrition();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const [hasSetup, apiKey] = await Promise.all([
        StorageService.hasCompletedSetup(),
        StorageService.getGeminiApiKey(),
      ]);
      setHasCompletedSetup(hasSetup);
      setHasApiKey(!!apiKey);
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const handleSelectFood = (food: any) => {
    if (selectedMealId) {
      updateMeal(selectedMealId, food);
    }
    setShowAIRecommendations(false);
    setSelectedMealId(null);
  };

  const handleRemoveMeal = (mealId: string) => {
    Alert.alert(
      'Remove Meal',
      'Are you sure you want to remove this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeMeal(mealId) },
      ]
    );
  };

  const handleClearAllMeals = () => {
    Alert.alert(
      'Clear All Meals',
      'Are you sure you want to clear all meals? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllMeals },
      ]
    );
  };

  const handleAddCustomMeal = () => {
    if (!customMealData.name || !customMealData.calories) {
      Alert.alert('Error', 'Please enter at least a meal name and calories.');
      return;
    }

    const calories = parseInt(customMealData.calories) || 0;
    const protein = parseInt(customMealData.protein) || 0;
    const carbs = parseInt(customMealData.carbs) || 0;
    const fat = parseInt(customMealData.fat) || 0;

    if (selectedMealId) {
      addCustomMeal(selectedMealId, customMealData.name, calories, protein, carbs, fat);
      setShowCustomMealModal(false);
      setSelectedMealId(null);
      setCustomMealData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    }
  };

  const handleAIRecommendations = () => {
    if (!hasCompletedSetup) {
      Alert.alert(
        'Profile Setup Required',
        'Please complete your profile setup to get personalized AI recommendations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Setup', onPress: () => setShowAIRecommendations(true) },
        ]
      );
      return;
    }

    if (!hasApiKey) {
      Alert.alert(
        'API Key Required',
        'Please set your Gemini API key in Settings to use AI recommendations.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Settings', onPress: () => {
              // Navigate to settings
            }
          },
        ]
      );
      return;
    }

    setShowAIRecommendations(true);
  };

  const MealItem = ({ meal }: { meal: any }) => (
    <GlassCard style={styles.mealItem}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Text style={[styles.mealTitle, { color: colors.text }]}>{meal.title}</Text>
          <Text style={[styles.mealTime, { color: colors.icon }]}>{meal.time}</Text>
        </View>
        <View style={styles.mealActions}>
          {meal.hasFood && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMeal(meal.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedMealId(meal.id);
              setShowAIRecommendations(true);
            }}
          >
            <Ionicons name="add-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {meal.food ? (
        <View style={[styles.foodInfo, { borderTopColor: colors.border }]}>
          <Text style={[styles.foodName, { color: colors.text }]}>{meal.food.name}</Text>
          <View style={styles.nutritionRow}>
            <View style={[styles.nutritionBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.nutritionText, { color: colors.warning }]}>
                {meal.food.calories} kcal
              </Text>
            </View>
            <View style={[styles.nutritionBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.nutritionText, { color: colors.primary }]}>
                {meal.food.protein}g P
              </Text>
            </View>
            <View style={[styles.nutritionBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.nutritionText, { color: colors.success }]}>
                {meal.food.carbs}g C
              </Text>
            </View>
            <View style={[styles.nutritionBadge, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[styles.nutritionText, { color: colors.secondary }]}>
                {meal.food.fat}g F
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.emptyMeal, { borderTopColor: colors.border }]}
          onPress={() => {
            setSelectedMealId(meal.id);
            setShowAIRecommendations(true);
          }}
        >
          <Text style={[styles.emptyText, { color: colors.text }]}>No meal planned</Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>Tap + to suggest a meal</Text>
        </TouchableOpacity>
      )}
    </GlassCard>
  );

  const NutritionSummary = () => (
    <GlassCard style={styles.nutritionSummary}>
      <Text style={[styles.summaryTitle, { color: colors.text }]}>Today's Nutrition</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Calories</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{totalNutrition.calories}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Protein</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{totalNutrition.protein}g</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Carbs</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{totalNutrition.carbs}g</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>Fat</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{totalNutrition.fat}g</Text>
        </View>
      </View>

      {personalInfo && (
        <View style={[styles.targetInfo, { borderTopColor: colors.border }]}>
          <Text style={[styles.targetLabel, { color: colors.icon }]}>
            Target: <Text style={{ color: colors.text, fontWeight: '600' }}>{personalInfo.targetCalories} kcal</Text>
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceHighlight }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((totalNutrition.calories / parseInt(personalInfo.targetCalories)) * 100, 100)}%`,
                  backgroundColor: colors.primary
                }
              ]}
            />
          </View>
        </View>
      )}
    </GlassCard>
  );

  const CustomMealModal = () => (
    <Modal
      visible={showCustomMealModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCustomMealModal(false)}
    >
      <ThemedBackground>
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowCustomMealModal(false)} style={styles.modalCloseButton}>
              <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Custom Meal</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <GlassInput
              placeholder="e.g. Grilled Chicken Salad"
              value={customMealData.name}
              onChangeText={(text) => setCustomMealData(prev => ({ ...prev, name: text }))}
              label="Meal Name"
            />

            <GlassInput
              placeholder="0"
              value={customMealData.calories}
              onChangeText={(text) => setCustomMealData(prev => ({ ...prev, calories: text }))}
              label="Calories"
            // keyboardType="numeric" // GlassInput needs update
            />

            <View style={styles.macroInputsContainer}>
              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="0"
                  value={customMealData.protein}
                  onChangeText={(text) => setCustomMealData(prev => ({ ...prev, protein: text }))}
                  label="Protein (g)"
                // keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="0"
                  value={customMealData.carbs}
                  onChangeText={(text) => setCustomMealData(prev => ({ ...prev, carbs: text }))}
                  label="Carbs (g)"
                // keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <GlassInput
                  placeholder="0"
                  value={customMealData.fat}
                  onChangeText={(text) => setCustomMealData(prev => ({ ...prev, fat: text }))}
                  label="Fat (g)"
                // keyboardType="numeric"
                />
              </View>
            </View>

            <PrimaryButton
              title="Save Meal"
              onPress={handleAddCustomMeal}
              style={styles.modalSaveButton}
            />

          </ScrollView>
        </SafeAreaView>
      </ThemedBackground>
    </Modal>
  );

  if (contextLoading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading your meals...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meal Tracking</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.surfaceHighlight }]}
              onPress={handleClearAllMeals}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Summary */}
        <NutritionSummary />

        {/* Meals List */}
        <View style={styles.mealsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Detailed Breakdown</Text>
          </View>
          {meals.map((meal) => (
            <MealItem key={meal.id} meal={meal} />
          ))}
        </View>

        {/* Floating Action Buttons / Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAIRecommendations}
            style={{ flex: 1 }}
          >
            <GlassCard style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {!hasCompletedSetup ? 'Start Setup' : 'AI Assistant'}
              </Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setSelectedMealId('breakfast'); // Default to breakfast
              setShowCustomMealModal(true);
            }}
            style={{ flex: 1 }}
          >
            <GlassCard style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="create-outline" size={20} color={colors.secondary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Manual Entry</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* AI Food Recommendation Modal */}
      <AIFoodRecommendation
        visible={showAIRecommendations}
        onClose={() => {
          setShowAIRecommendations(false);
          setSelectedMealId(null);
        }}
        onSelectFood={handleSelectFood}
        selectedMealType={selectedMealId || 'breakfast'}
      />

      {/* Custom Meal Modal */}
      <CustomMealModal />
    </ScreenWrapper>
  );
};

export default MealsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionSummary: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '40%',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  targetInfo: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  targetLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  mealItem: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mealTime: {
    fontSize: 13,
    marginTop: 2,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
    opacity: 0.7,
  },
  foodInfo: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nutritionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyMeal: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalSaveButton: {
    marginTop: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  macroInputsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});
