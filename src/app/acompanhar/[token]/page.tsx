"use client";

import OrdersService, { Order, OrderStatus } from "@/services/orders";
import { Check, ChefHat, CircleCheck, Clock3, LoaderCircle, PackageCheck, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

type TrackingStepStatus = Exclude<OrderStatus, "cancelado">;

const steps: Array<{ status: TrackingStepStatus; label: string }> = [
  { status: "recebido", label: "Recebido" }, { status: "confirmado", label: "Confirmado" },
  { status: "preparando", label: "Em preparo" }, { status: "saiu_entrega", label: "Saiu para entrega" }, { status: "entregue", label: "Entregue" },
];
const icons: Record<TrackingStepStatus, LucideIcon> = { recebido: Clock3, confirmado: CircleCheck, preparando: ChefHat, saiu_entrega: Truck, entregue: PackageCheck };

export default function TrackOrderPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setOrder(await OrdersService.acompanhar(token)); setError(""); }
    catch { setError("Não foi possível consultar o pedido."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 10000); return () => window.clearInterval(timer); }, [load]);
  const currentIndex = order?.status === "cancelado" ? -1 : steps.findIndex((step) => step.status === order?.status);

  return <main className="min-h-screen bg-[#E4EDE3] px-4 py-8 sm:py-12">
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#926e56]">Cléo Nogueira Lanches</p>
      <h1 className="mt-1 text-2xl font-bold text-[#382110]">Acompanhe seu pedido</h1>
      {loading ? <div className="flex justify-center py-16"><LoaderCircle className="animate-spin" /></div> : error ? <p className="my-8 rounded-lg bg-red-50 p-4 text-red-700">{error}</p> : !order ? <p className="my-8">Pedido não encontrado ou link inválido.</p> : <>
        <div className="mt-6 flex items-center justify-between rounded-xl bg-[#f5f5f5] p-4"><div><p className="text-sm text-zinc-500">Pedido</p><p className="text-2xl font-bold">Nº {order.numeroPedido}</p></div><div className="text-right"><p className="text-sm text-zinc-500">Total</p><p className="font-bold">R$ {order.total.toFixed(2)}</p></div></div>
        {order.status === "cancelado" ? <div className="mt-6 flex gap-3 rounded-xl bg-red-50 p-4 text-red-800"><XCircle /><div><strong>Pedido cancelado</strong><p className="text-sm">Entre em contato com a lanchonete caso tenha dúvidas.</p></div></div> : <ol className="mt-8 space-y-2">
          {steps.map((step, index) => { const Icon = icons[step.status]; const done = index <= currentIndex; return <li key={step.status} className={`flex items-center gap-4 rounded-xl p-3 ${done ? "bg-emerald-50 text-emerald-800" : "text-zinc-400"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-600 text-white" : "bg-zinc-100"}`}>{index < currentIndex ? <Check size={20} /> : <Icon size={20} />}</span><strong>{step.label}</strong></li>; })}
        </ol>}
        <div className="mt-8 border-t pt-5"><h2 className="font-bold text-[#382110]">Itens</h2>{order.items.map((item) => <div key={`${item.dishId}-${item.nome}`} className="mt-2 flex justify-between gap-3 text-sm"><span>{item.quantidade}× {item.nome}</span><span>R$ {item.total.toFixed(2)}</span></div>)}</div>
        <p className="mt-6 text-center text-xs text-zinc-500">Atualização automática a cada 10 segundos</p>
      </>}
      <Link href="/" target="_blank" rel="noopener noreferrer" className="mt-6 block text-center font-semibold text-[#765540] underline">Abrir cardápio em uma nova aba</Link>
    </section>
  </main>;
}
