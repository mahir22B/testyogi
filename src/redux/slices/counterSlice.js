import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
  rate: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    rate: (state, action) => {
      state.rate = action?.payload?.rate;
    },
  },
});

export const { increment, rate } = counterSlice.actions;
export default counterSlice.reducer;
