import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    category: string;
}

export interface Meal {
    id: string;
    title: string;
    time: string;
    food?: FoodItem;
    hasFood: boolean;
}

export interface MealsState {
    meals: Meal[];
    lastResetDate?: string;
}

const initialState: MealsState = {
    meals: [
        {
            id: 'breakfast',
            title: 'Breakfast',
            time: '7 AM',
            hasFood: false,
        },
        {
            id: 'lunch',
            title: 'Lunch',
            time: '12 PM',
            hasFood: false,
        },
        {
            id: 'snacks',
            title: 'Snacks',
            time: '3 PM',
            hasFood: false,
        },
        {
            id: 'dinner',
            title: 'Dinner',
            time: '7 PM',
            hasFood: false,
        },
    ],
    // Initialize with local date
    lastResetDate: (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    })(),
};

const mealsSlice = createSlice({
    name: 'meals',
    initialState,
    reducers: {
        setMeals: (state, action: PayloadAction<Meal[]>) => {
            state.meals = action.payload;
        },
        updateMeal: (state, action: PayloadAction<{ id: string; food: FoodItem, time: string }>) => {
            const meal = state.meals.find((m) => m.id === action.payload.id);
            if (meal) {
                meal.food = action.payload.food;
                meal.time = action.payload.time ?? meal.time;
                meal.hasFood = true;
            }
        },
        removeMeal: (state, action: PayloadAction<string>) => {
            const meal = state.meals.find((m) => m.id === action.payload);
            if (meal) {
                meal.food = undefined;
                meal.hasFood = false;
            }
        },
        clearAllMeals: (state) => {
            state.meals.forEach((meal) => {
                meal.food = undefined;
                meal.hasFood = false;
            });
        },
        checkDailyReset: (state) => {
            const now = new Date();
            // Use local time instead of UTC (toISOString) to ensure reset happens at local 12 AM
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            if (!state.lastResetDate) {
                // If checking for the first time (migration), just set the date
                state.lastResetDate = today;
            } else if (state.lastResetDate !== today) {
                // It's a new day! Reset meals.
                state.meals.forEach((meal) => {
                    meal.food = undefined;
                    meal.hasFood = false;
                });
                state.lastResetDate = today;
            }
        },
    },
});

export const { setMeals, updateMeal, removeMeal, clearAllMeals, checkDailyReset } = mealsSlice.actions;

export default mealsSlice.reducer;
