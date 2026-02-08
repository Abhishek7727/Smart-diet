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
    lastLoginDate?: string;
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
    lastLoginDate: undefined,
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
            // Update basic fields
            Object.assign(state, action.payload);

            // Track weight history if weight has changed
            // Note: action.payload.weight might be undefined, so check strictly
            if (action.payload.weight) {
                const currentWeight = parseFloat(state.weight || '0');
                const newWeight = parseFloat(action.payload.weight);

                // Only add history if it's a valid number and (it changed OR it's a new entry and we have no history)
                if (!isNaN(newWeight) && (newWeight !== currentWeight || state.weightHistory.length === 0)) {
                    if (!state.weightHistory) state.weightHistory = [];

                    const today = new Date().toISOString().split('T')[0];
                    const existingEntryIndex = state.weightHistory.findIndex(h => h.date === today);

                    if (existingEntryIndex >= 0) {
                        // Update today's entry
                        state.weightHistory[existingEntryIndex].weight = newWeight;
                    } else {
                        // Add new entry
                        state.weightHistory.push({ date: today, weight: newWeight });
                    }
                }
            }
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
        setLastLoginDate: (state, action: PayloadAction<string>) => {
            state.lastLoginDate = action.payload;
        },
        deleteAccount: () => initialState,
    },
});

export const { setUser, setApiKey, updateProfile, logout, register, loginSuccess, deleteAccount, setOnboardingCompleted, setLastLoginDate } = userSlice.actions;

export default userSlice.reducer;
