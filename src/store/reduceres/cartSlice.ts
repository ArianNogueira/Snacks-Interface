import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Dish {
    id: number,
    nome: string,
    preco: number,
    quantidade: number,
}

interface DishesState {
    items: Dish[];
}

interface AddDishAction {
    type: string;
    payload: Dish;
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
    },
    reducers: {
        addCart: (state: DishesState, action: AddDishAction) => {
            state.items.push(action.payload);
        }
    },
})

export const { addCart } = cartSlice.actions;

export default cartSlice.reducer;