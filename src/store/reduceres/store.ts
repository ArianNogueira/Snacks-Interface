import { configureStore } from "@reduxjs/toolkit";
import dishesSlice from "./dishesSlice";

export const store = configureStore({
    reducer: {
        dishes: dishesSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;