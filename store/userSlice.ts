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
            return { ...state, ...action.payload };
        },
        register: (state, action: PayloadAction<Partial<UserState>>) => {
            return { ...state, ...action.payload, isAuthenticated: true, isOnboarded: true };
        },
        loginSuccess: (state) => {
            state.isAuthenticated = true;
        },
        logout: (state) => {
            // Only clear session, keep data
            state.isAuthenticated = false;
        },
        deleteAccount: () => initialState,
    },
});

export const { setUser, setApiKey, updateProfile, logout, register, loginSuccess, deleteAccount } = userSlice.actions;

export default userSlice.reducer;
