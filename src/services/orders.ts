import { supabase } from "@/lib/supabase";

export interface OrderItem {
  dishId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  total: number;
}

export type OrderPeriod = "09:00-14:59" | "18:00-23:59";

export interface Order {
  id?: number | string;
  nomeCliente: string;
  metodoPagamento: string;
  observacao?: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  numeroPedido?: number;
  periodo?: OrderPeriod;
}

interface OrderItemRow {
  dish_id: number | null;
  nome: string;
  preco_unitario: number | string;
  quantidade: number;
  total: number | string;
}

interface OrderRow {
  id: number;
  nome_cliente: string;
  metodo_pagamento: string;
  observacao: string | null;
  total: number | string;
  created_at: string;
  numero_pedido: number;
  periodo: OrderPeriod;
  order_items?: OrderItemRow[];
}

export function getOrderPeriod(date: Date): OrderPeriod | null {
  const hour = date.getHours();
  if (hour >= 9 && hour < 15) return "09:00-14:59";
  if (hour >= 18 && hour < 24) return "18:00-23:59";
  return null;
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeOrder(row: OrderRow): Order {
  return {
    id: row.id,
    nomeCliente: row.nome_cliente,
    metodoPagamento: row.metodo_pagamento,
    observacao: row.observacao ?? "",
    total: Number(row.total),
    created_at: row.created_at,
    numeroPedido: row.numero_pedido,
    periodo: row.periodo,
    items: (row.order_items ?? []).map((item) => ({
      dishId: Number(item.dish_id),
      nome: item.nome,
      precoUnitario: Number(item.preco_unitario),
      quantidade: item.quantidade,
      total: Number(item.total),
    })),
  };
}

const OrdersService = {
  buscar: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    return ((data ?? []) as OrderRow[]).map(normalizeOrder);
  },

  adicionar: async (order: Order): Promise<Order> => {
    if (!order.periodo) throw new Error("Período do pedido não informado.");

    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        nome_cliente: order.nomeCliente,
        metodo_pagamento: order.metodoPagamento,
        observacao: order.observacao ?? "",
        total: order.total,
        created_at: order.created_at,
        periodo: order.periodo,
      })
      .select()
      .single();

    if (orderError) throw new Error(`Erro ao salvar pedido: ${orderError.message}`);

    const { error: itemsError } = await supabase.from("order_items").insert(
      order.items.map((item) => ({
        order_id: insertedOrder.id,
        dish_id: item.dishId,
        nome: item.nome,
        preco_unitario: item.precoUnitario,
        quantidade: item.quantidade,
        total: item.total,
      }))
    );

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", insertedOrder.id);
      throw new Error(`Erro ao salvar itens do pedido: ${itemsError.message}`);
    }

    return normalizeOrder({ ...insertedOrder, order_items: order.items.map((item) => ({
      dish_id: item.dishId,
      nome: item.nome,
      preco_unitario: item.precoUnitario,
      quantidade: item.quantidade,
      total: item.total,
    })) } as OrderRow);
  },
};

export default OrdersService;
