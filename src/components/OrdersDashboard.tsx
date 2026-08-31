"use client";

import OrdersService, { Order, OrderStatus } from "@/services/orders";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, LoaderCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "recebido", label: "Recebido" }, { value: "confirmado", label: "Confirmado" },
  { value: "preparando", label: "Em preparo" }, { value: "saiu_entrega", label: "Saiu para entrega" },
  { value: "entregue", label: "Entregue" }, { value: "cancelado", label: "Cancelado" },
];

export function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | number | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setOrders(await OrdersService.buscar()); } catch { toast.error("Não foi possível carregar os pedidos."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const channel = supabase.channel("orders-dashboard").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load()).subscribe(); return () => { void supabase.removeChannel(channel); }; }, [load]);

  async function changeStatus(order: Order, status: OrderStatus) {
    if (!order.id) return;
    setUpdating(order.id);
    try { await OrdersService.atualizarStatus(order.id, status); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item)); toast.success("Status atualizado."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar."); }
    finally { setUpdating(null); }
  }

  return <main className="min-h-screen bg-[#E4EDE3]">
    <header className="bg-[#382110] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6"><div className="flex items-center gap-3"><Link href="/" aria-label="Voltar" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft /></Link><div><p className="text-xs uppercase tracking-wider text-[#d8c3b3]">Atendimento</p><h1 className="text-2xl font-bold">Pedidos dos clientes</h1></div></div><button onClick={() => void load()} className="rounded-full p-2 hover:bg-white/10"><RefreshCw className={loading ? "animate-spin" : ""} /></button></div></header>
    <section className="mx-auto max-w-7xl p-4 sm:p-6">
      {loading && !orders.length ? <div className="flex justify-center py-20"><LoaderCircle className="animate-spin" /></div> : !orders.length ? <p className="rounded-xl bg-white p-8 text-center">Nenhum pedido encontrado.</p> : <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {orders.map((order) => <article key={order.id} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-zinc-500">PEDIDO Nº</p><h2 className="text-2xl font-bold text-[#382110]">{order.numeroPedido}</h2></div><span className="font-bold">R$ {order.total.toFixed(2)}</span></div>
          <p className="mt-3 font-semibold">{order.nomeCliente}</p><p className="text-sm text-zinc-600">{order.enderecoEntrega || "Balcão/retirada"}</p>
          <div className="my-4 border-y py-3 text-sm">{order.items.map((item) => <p key={`${item.dishId}-${item.nome}`}>{item.quantidade}× {item.nome}</p>)}</div>
          {order.observacao && <p className="mb-4 whitespace-pre-line rounded-lg bg-amber-50 p-3 text-sm">{order.observacao}</p>}
          <label className="text-sm font-semibold">Status<select value={order.status ?? "recebido"} disabled={updating === order.id} onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)} className="mt-1 w-full rounded-lg border bg-white p-3 font-normal disabled:opacity-50">{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
        </article>)}
      </div>}
    </section>
  </main>;
}
