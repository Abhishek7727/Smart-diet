import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { updateProfile } from '@/store/userSlice';
import { setMeals, updateMeal as updateMealAction, removeMeal as removeMealAction, clearAllMeals as clearAllMealsAction, Meal, FoodItem } from '@/store/mealsSlice';

interface NutritionalData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PersonalInfo {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  goal: string;
  dietaryRestrictions: string[];
  allergies: string[];
  targetCalories: string;
}

interface MealPlanContextType {
  meals: Meal[];
  nutritionalData: NutritionalData;
  personalInfo: PersonalInfo | null;
  isLoading: boolean;
  updateMeal: (mealId: string, food: FoodItem) => void;
  removeMeal: (mealId: string) => void;
  getTotalNutrition: () => NutritionalData;
  addCustomMeal: (mealId: string, foodName: string, calories: number, protein: number, carbs: number, fat: number) => void;
  clearAllMeals: () => void;
  savePersonalInfo: (info: PersonalInfo) => Promise<void>;
  loadPersonalInfo: () => Promise<PersonalInfo | null>;
  clearPersonalInfo: () => Promise<void>;
  hasCompletedSetup: () => Promise<boolean>;
  saveMealsToStorage: () => Promise<void>;
  loadMealsFromStorage: () => Promise<void>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

interface MealPlanProviderProps {
  children: ReactNode;
}

export const MealPlanProvider: React.FC<MealPlanProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const meals = useSelector((state: RootState) => state.meals.meals);
  const userData = useSelector((state: RootState) => state.user);

  // isLoading is effectively false because data persists via Redux synchronously after rehydration
  // But we can keep it false to satisfy interface
  const isLoading = false;

  // Derive PersonalInfo from Redux UserData
  const personalInfo: PersonalInfo | null = useMemo(() => {
    if (!userData.name && !userData.targetCalories) return null;
    return {
      name: userData.name,
      age: userData.age,
      gender: userData.gender,
      weight: userData.weight,
      height: userData.height,
      activityLevel: userData.activityLevel,
      goal: userData.goal,
      dietaryRestrictions: userData.dietaryRestrictions || [],
      allergies: userData.allergies || [],
      targetCalories: userData.targetCalories,
    };
  }, [userData]);

  // Derive NutritionalData from PersonalInfo
  const nutritionalData: NutritionalData = useMemo(() => {
    if (!personalInfo || !personalInfo.targetCalories) {
      return {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65,
      };
    }

    const targetCalories = parseInt(personalInfo.targetCalories) || 2000;

    // Calculate macronutrient ratios based on goal (reusing logic from original context)
    let proteinRatio = 0.25;
    let carbsRatio = 0.55;
    let fatRatio = 0.20;

    switch (personalInfo.goal) {
      case 'lose_weight':
        proteinRatio = 0.30;
        carbsRatio = 0.45;
        fatRatio = 0.25;
        break;
      case 'gain_weight':
      case 'build_muscle':
        proteinRatio = 0.30;
        carbsRatio = 0.50;
        fatRatio = 0.20;
        break;
      case 'maintain_weight':
        proteinRatio = 0.25;
        carbsRatio = 0.55;
        fatRatio = 0.20;
        break;
      case 'improve_health':
        proteinRatio = 0.25;
        carbsRatio = 0.50;
        fatRatio = 0.25;
        break;
    }

    return {
      calories: targetCalories,
      protein: Math.round((targetCalories * proteinRatio) / 4),
      carbs: Math.round((targetCalories * carbsRatio) / 4),
      fat: Math.round((targetCalories * fatRatio) / 9),
    };
  }, [personalInfo]);

  const updateMeal = (mealId: string, food: FoodItem) => {
    dispatch(updateMealAction({ id: mealId, food }));
  };

  const removeMeal = (mealId: string) => {
    dispatch(removeMealAction(mealId));
  };

  const addCustomMeal = (mealId: string, foodName: string, calories: number, protein: number, carbs: number, fat: number) => {
    const customFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: foodName,
      calories,
      protein,
      carbs,
      fat,
      category: 'custom',
    };
    dispatch(updateMealAction({ id: mealId, food: customFood }));
  };

  const clearAllMeals = () => {
    dispatch(clearAllMealsAction());
  };

  const getTotalNutrition = (): NutritionalData => {
    return meals.reduce(
      (total, meal) => {
        if (meal.food) {
          total.calories += meal.food.calories;
          total.protein += meal.food.protein;
          total.carbs += meal.food.carbs;
          total.fat += meal.food.fat;
        }
        return total;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const savePersonalInfo = async (info: PersonalInfo) => {
    dispatch(updateProfile(info));
  };

  const loadPersonalInfo = async (): Promise<PersonalInfo | null> => {
    // Already loaded via Redux
    return personalInfo;
  };

  const clearPersonalInfo = async () => {
    // Resetting to empty object or initial state
    // For now we might just clear key fields if we had a clearProfile action, 
    // but updateProfile with empty strings works too or we can implement logout
    // dispatch(logout()); // If we want to clear everything
    // Or just partial update:
    /*
    dispatch(updateProfile({
      name: '', age: '', weight: '', height: '', targetCalories: '', ...
    }));
    */
  };

  const hasCompletedSetup = async (): Promise<boolean> => {
    return !!(personalInfo?.name && personalInfo?.targetCalories);
  };

  const saveMealsToStorage = async () => {
    // No-op, Redux Persist handles this
  };

  const loadMealsFromStorage = async () => {
    // No-op, Redux Persist handles this
  };

  const value: MealPlanContextType = {
    meals,
    nutritionalData,
    personalInfo,
    isLoading,
    updateMeal,
    removeMeal,
    getTotalNutrition,
    addCustomMeal,
    clearAllMeals,
    savePersonalInfo,
    loadPersonalInfo,
    clearPersonalInfo,
    hasCompletedSetup,
    saveMealsToStorage,
    loadMealsFromStorage,
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = (): MealPlanContextType => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};