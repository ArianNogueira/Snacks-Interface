import DishesService from "@/services/itens";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Dish {
    id: number,
    nome: string,
    preco: number,
    em_promocao: boolean,
    preco_promocional: number | null,
    quantidade: number,
    categoria: string,
    imagem: string,
    availableToday: boolean,
    averageRating: number,
    reviewCount: number
}

interface DishesState {
    items: Dish[];
    loading: boolean;
    error: string | null;
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

export const definirDisponibilidade = createAsyncThunk(
    'dishes/definirDisponibilidade',
    async ({ dishId, available }: { dishId: number; available: boolean }) => {
        return await DishesService.definirDisponibilidade(dishId, available);
    }
)

const dishesSlice = createSlice({
    name: 'dishes',
    initialState: { 
        items: [],
        loading: false,
        error: null,
    } as DishesState,
    reducers: {
        // adiconarDishes: (state: DishesState, action: AddDishAction) => {
        //     state.items.push(action.payload);
        // }
    },
    extraReducers: buider => {
        buider.addCase(buscarDishes.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(buscarDishes.fulfilled, (state, action) => {
            state.items = action.payload;
            state.loading = false;
        })
        .addCase(buscarDishes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? "Não foi possível consultar os pratos no Supabase.";
        })
        .addCase(adicionarDish.fulfilled, (state, action) => {
            state.items.push(action.payload);
        })
        .addCase(editarDish.fulfilled, (state, action) => {
            const index = state.items.findIndex(dishesSlice => dishesSlice.id === action.payload.id)
            state.items[index] = action.payload;
        })
        .addCase(deletarDish.fulfilled, (state, action) => {
            state.items = state.items.filter((dish) => dish.id !== action.payload.id);
        })
        .addCase(definirDisponibilidade.fulfilled, (state, action) => {
            const dish = state.items.find((item) => item.id === action.payload.dishId);
            if (dish) dish.availableToday = action.payload.available;
        })
    }
});

// export const { adiconarDishes } = dishesSlice.actions;

export default dishesSlice.reducer;
