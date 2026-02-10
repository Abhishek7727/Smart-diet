import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: any = {
    data: undefined,
    ts: Date.now(),
};

const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        addData: (state, action: PayloadAction<any>) => {
            state.data = action.payload;
            state.ts = Date.now();
        },
        removeData: (state) => {
            state.data = undefined;
            state.ts = Date.now();
        }
        },
    });

export const { addData, removeData } = commonSlice.actions;

export default commonSlice.reducer;
