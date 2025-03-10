interface Dish {
    id: Number;
    nome: string;
    preco: Number;
    quantidade: Number,
    categoria: string,
    imagem: string
}

const DishesService = {
    buscar: async () => {
        const resposta = await fetch("http://localhost:3001/dishes");
        const data = await resposta.json();
        return data;
    },

    adicionar: async (dish: Dish) => {
        const resposta = await fetch("http://localhost:3001/dishes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dish),
        });

        if(!resposta.ok) {
            throw new Error("Erro ao adicionar prato!")
        }

        return await resposta.json();
    },
}

export default DishesService;