import { useMealPlan } from "@/components/MealPlanContext";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {

  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Image
} from "react-native";
import { useSelector } from 'react-redux';
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { GlassCard } from "@/components/GlassCard";
import { CalorieMeter } from "@/components/CalorieMeter";
import { UnifiedMealCard } from "@/components/UnifiedMealCard";
import { MealCategoryCarousel } from "@/components/MealCategoryCarousel";




// Home Screen Component
const HomeScreen = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const colorScheme = useColorScheme();

  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { meals, nutritionalData, getTotalNutrition, personalInfo } =
    useMealPlan();

  const totalNutrition = getTotalNutrition();
  const userData = useSelector((state: any) => state.user);

  const handleMealPress = (mealId: string) => {
    // Navigate to meals tab
    onNavigate?.('meals');
  };

  // Dynamic Greeting Logic
  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const currentCalories = totalNutrition.calories;
    const targetCalories = parseInt(personalInfo?.targetCalories || '2000');
    const progress = currentCalories / targetCalories;

    if (!personalInfo) return "Start Your Journey";

    // Morning (5 AM - 11 AM)
    if (hour >= 5 && hour < 12) {
      if (currentCalories === 0) return "Start with a healthy breakfast!";
      return "Ready to hit your goals?";
    }

    // Mid-day (12 PM - 5 PM)
    if (hour >= 12 && hour < 17) {
      if (progress < 0.3) return "Fuel up! You're behind on calories.";
      if (progress > 0.6) return "You're doing great, keep going!";
      return "Don't forget to log your lunch.";
    }

    // Evening (5 PM - 9 PM)
    if (hour >= 17 && hour < 21) {
      if (progress > 0.9 && progress < 1.1) return "Perfectly on track for today!";
      if (progress > 1.1) return "Watch your intake tonight.";
      if (progress < 0.7) return "Dinner time! Hit that target.";
      return "Finishing strong today?";
    }

    // Night (9 PM - 5 AM)
    if (progress >= 0.9) return "Great job hitting your goals!";
    return "Remember to rest and recover.";
  };

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={[styles.greetingText, { color: colors.icon }]}>
              Hello, {userData.name?.split(' ')[0] || "Friend"}
            </Text>
            <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
              {getDynamicGreeting()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.surfaceHighlight, overflow: 'hidden' }]}
            onPress={() => onNavigate?.("profile")}
          >
            {userData.gender?.toLowerCase() === 'male' ? (
              <Image
                source={require('@/assets/images/avatar_male.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : userData.gender?.toLowerCase() === 'female' ? (
              <Image
                source={require('@/assets/images/avatar_female.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={20} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>


        {/* Start Your Journey / Calorie Meter */}
        {!personalInfo ? (
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
        ) : (
          <View>
            <CalorieMeter
              calories={totalNutrition.calories}
              target={parseInt(personalInfo.targetCalories) || 2000}
              protein={totalNutrition.protein}
              proteinTarget={nutritionalData.protein}
              carbs={totalNutrition.carbs}
              carbsTarget={nutritionalData.carbs}
              fat={totalNutrition.fat}
              fatTarget={nutritionalData.fat}
            />

            {/* Meal Category Carousel */}
            <MealCategoryCarousel />
          </View>
        )}


        {/* Meals Unified Card */}
        <UnifiedMealCard meals={meals} onMealPress={handleMealPress} />

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
