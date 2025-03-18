import DishesService from "@/services/itens";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Dish {
    id: number,
    nome: string,
    preco: number,
    quantidade: number,
    categoria: string,
    imagem: string
}

interface DishesState {
    items: Dish[];
}

export const adicionarDish = createAsyncThunk(
    'dishes/adicionar',
    async (dish: Dish) => {
        return await DishesService.adicionar(dish);
    }
)

export const editarDish = createAsyncThunk (
    'dishes/editar',
    async(dish: Dish | null) => {
        return await DishesService.editar(dish);
    }
)

export const deletarDish = createAsyncThunk (
    'dishes/deletar',
    async(dish: Dish) => {
        return await DishesService.deletar(dish);
    }
)

export const buscarDishes = createAsyncThunk(
    'dishes/buscar',
    DishesService.buscar
)

const dishesSlice = createSlice({
    name: 'dishes',
    initialState: { 
        items: [],
    } as DishesState,
    reducers: {
        // adiconarDishes: (state: DishesState, action: AddDishAction) => {
        //     state.items.push(action.payload);
        // }
    },
    extraReducers: buider => {
        buider.addCase(buscarDishes.fulfilled, (state, action) => {
            state.items = action.payload;
        })
        .addCase(adicionarDish.fulfilled, (state, action) => {
            state.items.push(action.payload);
        })
        .addCase(editarDish.fulfilled, (state, action) => {
            const index = state.items.findIndex(dishesSlice => dishesSlice.id === action.payload.id)
            state.items[index] = action.payload;
        })
        .addCase(deletarDish.fulfilled, (state, action) => {
            const index = state.items.findIndex(dishesSlice => dishesSlice.id === action.payload.id)
            state.items[index] = action.payload;
        }) 
    }
});

// export const { adiconarDishes } = dishesSlice.actions;

export default dishesSlice.reducer;