import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Dish {
    id: number;
    nome: string;
    preco: number;
    precoUnitario: number;
    quantidade: number;
  }

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [] as Dish[],
    },
    reducers: {
        addCart: (state, action: PayloadAction<Dish>) => {
            const temDish = state.items.find(item => item.id === action.payload.id);
            const item = action.payload;

            if(!temDish) {    
                state.items.push({
                    ...item,
                    precoUnitario: item.preco,
                });
            } else {
                temDish.quantidade += 1;
                temDish.preco += item.preco
            }
        },
        mudarQuantidade: (
            state, 
            action: PayloadAction<{id: number, quantidade: number}>) => {
            state.items = state.items.map(itemNoCarrinho => {
                if (itemNoCarrinho.id === action.payload.id) {
                    itemNoCarrinho.quantidade += action.payload.quantidade;

                    itemNoCarrinho.preco = itemNoCarrinho.precoUnitario * itemNoCarrinho.quantidade
                }
                return itemNoCarrinho;
            })
            .filter((itemNoCarrinho) => itemNoCarrinho.quantidade > 0)
        },
        removerDish: (state, action: PayloadAction<{id: number}>) => {
            state.items = state.items.filter(itemNoCarrinho => itemNoCarrinho.id !== action.payload.id)
        }, 
        resetarCart: (state) => {
            state.items = [];
        } 
    },
})

export const { addCart, mudarQuantidade, removerDish, resetarCart } = cartSlice.actions;

export default cartSlice.reducer;
