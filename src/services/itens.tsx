const DishesService = {
    buscar: async () => {
        const resposta = await fetch("/db.json");
        const data = await resposta.json();
        return data;
    }
}

export default DishesService;