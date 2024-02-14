import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";

const reducer = {
  counter: counterReducer,
};

export const store = configureStore({
  reducer: reducer,
  devTools: true,
});
