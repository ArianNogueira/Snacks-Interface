import DishesService from "@/services/itens";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const buscarDishes = createAsyncThunk(
    'dishes/buscar',
    DishesService.buscar
)

const dishesSlice = createSlice({
    name: 'dishes',
    initialState: { 
        items: [],
    },
    reducers: {},
    extraReducers: buider => {
        buider.addCase(buscarDishes.fulfilled, (state, action) => {
            state.items = action.payload;
        })
    }
});

export default dishesSlice.reducer;