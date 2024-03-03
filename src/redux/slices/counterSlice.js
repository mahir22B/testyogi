import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
  failed:0,
  rate: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    reset: (state) => {
      state.value = 0;
    },
    failed:(state, action)=>{
      state.failed = action?.payload?.failed;
    },
    rate: (state, action) => {
      state.rate = action?.payload?.rate;
    },
  },
});

export const { increment, rate, failed, reset } = counterSlice.actions;
export default counterSlice.reducer;
