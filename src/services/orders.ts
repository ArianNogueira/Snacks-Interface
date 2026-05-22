export interface OrderItem {
  dishId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  total: number;
}

export interface Order {
  id?: number | string;
  nomeCliente: string;
  metodoPagamento: string;
  observacao?: string;
  items: OrderItem[];
  total: number;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const OrdersService = {
  buscar: async (): Promise<Order[]> => {
    const resposta = await fetch(`${API_URL}/orders`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar pedidos!");
    }

    return await resposta.json();
  },

  adicionar: async (order: Order): Promise<Order> => {
    const resposta = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!resposta.ok) {
      throw new Error("Erro ao salvar pedido!");
    }

    return await resposta.json();
  },
};

export default OrdersService;
