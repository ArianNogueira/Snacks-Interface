import DishesService from "@/services/itens";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Dish {
    id: number;
    nome: string;
    preco: number;
    quantidade: number,
    categoria: string,
    imagem: string
}

interface DishesState {
    items: Dish[];
}

interface AddDishAction {
    type: string;
    payload: Dish;
}

export const buscarDishes = createAsyncThunk(
    'dishes/buscar',
    DishesService.buscar
)

const dishesSlice = createSlice({
    name: 'dishes',
    initialState: { 
        items: [],
    },
    reducers: {
        adiconarDishes: (state: DishesState, action: AddDishAction) => {
            state.items.push(action.payload);
        }
    },
    extraReducers: buider => {
        buider.addCase(buscarDishes.fulfilled, (state, action) => {
            state.items = action.payload;
        })
    }
});

export const { adiconarDishes } = dishesSlice.actions;

export default dishesSlice.reducer;