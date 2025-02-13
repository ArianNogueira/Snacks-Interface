import { configureStore } from "@reduxjs/toolkit";
import dishesSlice from "./dishesSlice";
import cartSlice from "./cartSlice";

export const store = configureStore({
    reducer: {
        dishes: dishesSlice,
        cart: cartSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;