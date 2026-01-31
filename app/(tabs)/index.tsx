import { useMealPlan } from "@/components/MealPlanContext";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSelector } from 'react-redux';
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { GlassCard } from "@/components/GlassCard";


const { width } = Dimensions.get("window");

// Home Screen Component
const HomeScreen = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const colorScheme = useColorScheme();
  // ... (keep existing hooks)

  // Note: I am not including the entire component body in ReplacementContent to avoid huge output,
  // but I must target the lines carefully.
  // The tool requires EXACT target content. 
  // I will replace the imports and the render wrapper.

  // Let's do it in chunks.
  // Chunk 1: Imports

  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [selectedView, setSelectedView] = useState("Daily");
  const { meals, nutritionalData, getTotalNutrition, personalInfo } =
    useMealPlan();

  const totalNutrition = getTotalNutrition();
  const userData = useSelector((state: any) => state.user);

  const MetricCard = ({
    icon,
    color,
    title,
    value,
    target,
  }: {
    icon: string;
    color: string;
    title: string;
    value: number;
    target: number;
  }) => {
    const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    const isOverTarget = value > target;

    return (
      <GlassCard
        style={styles.metricCard}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <Text style={[styles.metricTitle, { color: colors.icon }]}>
            {title}
          </Text>
        </View>

        <View style={styles.metricContent}>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {value}
            <Text style={[styles.metricTarget, { color: colors.icon }]}>
              /{target}
            </Text>
          </Text>
          <Text style={[styles.metricUnit, { color: colors.icon }]}>
            {title === "Calorie" ? "kcal" : "g"}
          </Text>
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.surfaceHighlight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isOverTarget ? colors.danger : color,
              },
            ]}
          />
        </View>
      </GlassCard>
    );
  };

  const MealCard = ({ meal }: { meal: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
    >
      <GlassCard style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealIconContainer}>
            <Ionicons
              name={meal.id === 'breakfast' ? 'sunny-outline' : meal.id === 'lunch' ? 'restaurant-outline' : meal.id === 'dinner' ? 'moon-outline' : 'cafe-outline'}
              size={24}
              color={meal.hasFood ? colors.primary : colors.icon}
            />
          </View>
          <View style={styles.mealTitleContainer}>
            <Text style={[styles.mealTitle, { color: colors.text }]}>
              {meal.title}
            </Text>
            <Text style={[styles.mealTime, { color: colors.icon }]}>
              {meal.time}
            </Text>
          </View>
          <Ionicons
            name={meal.hasFood ? "checkmark-circle" : "add-circle"}
            size={32}
            color={meal.hasFood ? colors.success : colors.primary}
          />
        </View>

        {meal.food ? (
          <View style={[styles.mealFoodContainer, { backgroundColor: colors.surfaceHighlight }]}>
            <Text style={[styles.mealFood, { color: colors.text }]} numberOfLines={1}>
              {meal.food.name}
            </Text>
            <Text style={[styles.mealCalories, { color: colors.icon }]}>
              {meal.food.calories} kcal
            </Text>
          </View>
        ) : (
          <View style={[styles.detailsPlaceholder, { borderColor: colors.border }]}>
            <Text style={[styles.placeholderText, { color: colors.icon }]}>
              Tap to add a healthy meal
            </Text>
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greetingText, { color: colors.icon }]}>
              Hello, {userData.name?.split(' ')[0] || "Friend"}
            </Text>
            <Text style={[styles.questionText, { color: colors.text }]}>
              Scheduled Your Diet
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.surfaceHighlight }]}
            onPress={() => onNavigate?.("profile")}
          >
            <Ionicons name="person" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Metrics */}
        {personalInfo ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.metricsScroll}
            contentContainerStyle={styles.metricsContainer}
          >
            <MetricCard
              icon="flame"
              color={colors.warning}
              title="Calorie"
              value={totalNutrition.calories}
              target={parseInt(personalInfo.targetCalories) || 2000}
            />
            <MetricCard
              icon="water"
              color={colors.primary}
              title="Protein"
              value={totalNutrition.protein}
              target={nutritionalData.protein}
            />
            <MetricCard
              icon="leaf"
              color={colors.success}
              title="Carbs"
              value={totalNutrition.carbs}
              target={nutritionalData.carbs}
            />
            <MetricCard
              icon="egg"
              color={colors.secondary}
              title="Fat"
              value={totalNutrition.fat}
              target={nutritionalData.fat}
            />
          </ScrollView>
        ) : (
          <GlassCard style={styles.setupPrompt}>
            <Ionicons name="nutrition" size={48} color={colors.primary} />
            <Text style={[styles.setupPromptTitle, { color: colors.text }]}>
              Start Your Journey
            </Text>
            <Text style={[styles.setupPromptText, { color: colors.icon }]}>
              Set up your profile to receive personalized nutrition targets and meal plans.
            </Text>
            <TouchableOpacity
              style={[styles.setupButton, { backgroundColor: colors.primary }]}
              onPress={() => onNavigate?.("profile")}
            >
              <Text style={styles.setupButtonText}>Complete Profile</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === "Daily" && { backgroundColor: colors.glass.backgroundColor },
            ]}
            onPress={() => setSelectedView("Daily")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: selectedView === "Daily" ? colors.text : colors.icon },
              ]}
            >
              Daily Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === "Weekly" && { backgroundColor: colors.surfaceHighlight },
            ]}
            onPress={() => setSelectedView("Weekly")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: selectedView === "Weekly" ? colors.text : colors.icon },
              ]}
            >
              Weekly Overview
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meals Grid */}
        <View style={styles.mealsGrid}>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsScroll: {
    paddingLeft: 24,
    marginBottom: 32,
  },
  metricsContainer: {
    paddingRight: 24,
    gap: 16,
  },
  metricCard: {
    width: 150,
    height: 170,
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  metricContent: {
    marginVertical: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  metricTarget: {
    fontSize: 14,
    fontWeight: "400",
  },
  metricUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  toggleContainer: {
    flexDirection: "row",
    padding: 4,
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  mealsGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  mealCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mealIconContainer: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  mealTime: {
    fontSize: 13,
    marginTop: 4,
  },
  mealFoodContainer: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealFood: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsPlaceholder: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
  },
  setupPrompt: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  setupPromptTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  setupPromptText: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    fontSize: 16,
  },
  setupButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  setupButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  bottomSpacer: {
    height: 100,
  }
});
