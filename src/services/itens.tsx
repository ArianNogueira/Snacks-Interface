interface Dish {
    id: number;
    nome: string;
    preco: number;
    quantidade: number,
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

    editar: async (dish: Dish | null) => {
        console.log(dish?.id);
        const resposta = await fetch(`http://localhost:3001/dishes/${dish?.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dish),
        });

        if(!resposta.ok) {
            throw new Error("Erro ao editar prato!");
        }
        return await resposta.json();
    },
    deletar: async(dish: Dish) => {
        const resposta = await fetch(`http://localhost:3001/dishes/${dish?.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dish),
        });
        if(!resposta.ok) {
            throw new Error("Erro ao deletar o prato!");
        }
        return await resposta.json();
    }
}

export default DishesService;