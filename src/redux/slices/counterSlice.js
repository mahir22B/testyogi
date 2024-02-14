import { createSlice } from "@reduxjs/toolkit";

const presistCounter = JSON.parse(localStorage.getItem("counter"));

const initialState = {
  value: presistCounter > 0 ? presistCounter : 0,
  rate: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
      localStorage.setItem("counter", JSON.stringify(state.value));
    },
    rate: (state, action) => {
      state.rate = action?.payload?.rate;
    },
  },
});

export const { increment, rate } = counterSlice.actions;
export default counterSlice.reducer;
