import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
    name: string;
    email: string;
    age: string;
    gender: string;
    weight: string;
    height: string;
    activityLevel: string;
    goal: string;
    dietaryRestrictions: string[];
    allergies: string[];
    targetCalories: string;
    isOnboarded: boolean;
    isAuthenticated: boolean;
    password?: string;
    apiKey: string | null;
    weightHistory: { date: string; weight: number }[];
}

const initialState: UserState = {
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: [],
    allergies: [],
    targetCalories: '',
    isOnboarded: false,
    isAuthenticated: false,
    apiKey: null,
    weightHistory: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload };
        },
        setApiKey: (state, action: PayloadAction<string>) => {
            state.apiKey = action.payload;
        },
        updateProfile: (state, action: PayloadAction<Partial<UserState>>) => {
            const newState = { ...state, ...action.payload };

            // Track weight history if weight has changed or it's a new entry
            if (action.payload.weight && action.payload.weight !== state.weight) {
                const newWeight = parseFloat(action.payload.weight);
                if (!isNaN(newWeight)) {
                    // Create new array if it doesn't exist (migrations)
                    if (!newState.weightHistory) newState.weightHistory = [];

                    const today = new Date().toISOString().split('T')[0];
                    const existingEntryIndex = newState.weightHistory.findIndex(h => h.date === today);

                    if (existingEntryIndex >= 0) {
                        // Update today's entry
                        newState.weightHistory[existingEntryIndex].weight = newWeight;
                    } else {
                        // Add new entry
                        newState.weightHistory.push({ date: today, weight: newWeight });
                    }
                }
            }
            return newState;
        },
        register: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload, isAuthenticated: true, isOnboarded: false };
        },
        loginSuccess: (state) => {
            state.isAuthenticated = true;
        },
        logout: (state) => {
            // Only clear session, keep data
            state.isAuthenticated = false;
        },
        setOnboardingCompleted: (state) => {
            state.isOnboarded = true;
        },
        deleteAccount: () => initialState,
    },
});

export const { setUser, setApiKey, updateProfile, logout, register, loginSuccess, deleteAccount, setOnboardingCompleted } = userSlice.actions;

export default userSlice.reducer;
