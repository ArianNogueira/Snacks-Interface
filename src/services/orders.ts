import { supabase } from "@/lib/supabase";

export interface OrderItem {
  dishId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  total: number;
}

export type OrderPeriod = "09:00-14:59" | "18:00-23:59";
export type OrderStatus = "recebido" | "confirmado" | "preparando" | "saiu_entrega" | "entregue" | "cancelado";
export type DeliveryType = "retirada" | "delivery";

export interface Order {
  id?: number | string;
  nomeCliente: string;
  metodoPagamento: string;
  observacao?: string;
  enderecoEntrega?: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  numeroPedido?: number;
  periodo?: OrderPeriod;
  status?: OrderStatus;
  trackingToken?: string;
  statusUpdatedAt?: string;
  deliveryType?: DeliveryType;
  deliveryDistanceKm?: number;
  deliveryFee?: number;
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
  endereco_entrega: string | null;
  total: number | string;
  created_at: string;
  numero_pedido: number;
  periodo: OrderPeriod;
  status?: OrderStatus;
  tracking_token?: string;
  status_updated_at?: string;
  delivery_type?: DeliveryType;
  delivery_distance_km?: number | string | null;
  delivery_fee?: number | string;
  order_items?: OrderItemRow[];
}

export function getOrderPeriod(date: Date): OrderPeriod | null {
  const hour = date.getHours();
  const minute = date.getMinutes();
  if (hour >= 9 && hour < 15) return "09:00-14:59";
  if (hour >= 18 && (hour < 22 || (hour === 22 && minute <= 30))) return "18:00-23:59";
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
    enderecoEntrega: row.endereco_entrega ?? "",
    total: Number(row.total),
    created_at: row.created_at,
    numeroPedido: row.numero_pedido,
    periodo: row.periodo,
    status: row.status,
    trackingToken: row.tracking_token,
    statusUpdatedAt: row.status_updated_at,
    deliveryType: row.delivery_type ?? (row.endereco_entrega ? "delivery" : "retirada"),
    deliveryDistanceKm: row.delivery_distance_km == null ? undefined : Number(row.delivery_distance_km),
    deliveryFee: Number(row.delivery_fee ?? 0),
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
    const { data, error } = await supabase.rpc("submit_order_with_delivery", {
      p_nome_cliente: order.nomeCliente,
      p_metodo_pagamento: order.metodoPagamento,
      p_observacao: order.observacao ?? "",
      p_endereco_entrega: order.enderecoEntrega ?? "",
      p_items: order.items.map((item) => ({ dish_id: item.dishId, quantidade: item.quantidade })),
      p_delivery_type: order.deliveryType ?? "retirada",
      // Compatibilidade com a versão da função ainda instalada no Supabase,
      // que exige uma distância. A interface não calcula nem exibe quilômetros;
      // 4 km apenas seleciona a faixa fixa de R$ 10,00 da função legada.
      p_delivery_distance_km: order.deliveryType === "delivery" ? 4 : null,
    });
    if (error) throw new Error(`Erro ao enviar pedido: ${error.message}`);
    return normalizeOrder(data as OrderRow);
  },

  acompanhar: async (token: string): Promise<Order | null> => {
    const { data, error } = await supabase.rpc("track_order", { p_tracking_token: token });
    if (error) throw new Error(`Erro ao acompanhar pedido: ${error.message}`);
    return data ? normalizeOrder(data as OrderRow) : null;
  },

  atualizarStatus: async (orderId: number | string, status: OrderStatus): Promise<void> => {
    const { error } = await supabase.rpc("update_order_status", { p_order_id: Number(orderId), p_status: status });
    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
  },
};

export default OrdersService;
