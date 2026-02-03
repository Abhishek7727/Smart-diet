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
    },
});

export const { setMeals, updateMeal, removeMeal, clearAllMeals } = mealsSlice.actions;

export default mealsSlice.reducer;
