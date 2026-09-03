"use client";

import OrdersService, { Order, OrderStatus } from "@/services/orders";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CalendarClock, Download, LoaderCircle, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ReactDOMServer from "react-dom/server";
import { BrintableTicket } from "./BrintableTicket";
import { printTicket } from "./Cart";

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "recebido", label: "Recebido" },
  { value: "confirmado", label: "Confirmado" },
  { value: "preparando", label: "Em preparo" },
  { value: "saiu_entrega", label: "Saiu para entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const statusColors: Record<OrderStatus, string> = {
  recebido: "bg-sky-500",
  confirmado: "bg-indigo-500",
  preparando: "bg-amber-500",
  saiu_entrega: "bg-violet-500",
  entregue: "bg-emerald-500",
  cancelado: "bg-red-500",
};

function getStatusLabel(status: OrderStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? "Recebido";
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportOrders(orders: Order[]) {
  const header = ["Data e hora", "Período", "Número do pedido", "Status", "Modalidade", "Taxa de entrega", "Cliente", "Pagamento", "Endereço de entrega", "Item", "Quantidade", "Preço unitário", "Total do item", "Total do pedido", "Observação"];
  const rows = orders.flatMap((order) => order.items.map((item) => [
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.created_at)),
    order.periodo ?? "",
    order.numeroPedido ?? "",
    getStatusLabel(order.status ?? "recebido"),
    order.deliveryType === "delivery" ? "Delivery" : "Retirada",
    (order.deliveryFee ?? 0).toFixed(2).replace(".", ","),
    order.nomeCliente,
    order.metodoPagamento,
    order.enderecoEntrega ?? "",
    item.nome,
    item.quantidade,
    item.precoUnitario.toFixed(2).replace(".", ","),
    item.total.toFixed(2).replace(".", ","),
    order.total.toFixed(2).replace(".", ","),
    order.observacao ?? "",
  ]));
  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await OrdersService.buscar()); }
    catch { toast.error("Não foi possível carregar os pedidos."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const channel = supabase.channel("orders-dashboard").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load]);

  async function changeStatus(order: Order, status: OrderStatus) {
    if (!order.id) return;
    setUpdating(order.id);
    try {
      await OrdersService.atualizarStatus(order.id, status);
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
      toast.success("Status atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally { setUpdating(null); }
  }

  function printOrder(order: Order) {
    if (order.numeroPedido == null) {
      toast.error("Não foi possível identificar o número do pedido.");
      return;
    }
    const items = order.items.map((item) => ({
      id: item.dishId,
      nome: item.nome,
      preco: item.total,
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
    }));
    const html = ReactDOMServer.renderToStaticMarkup(BrintableTicket(
      items,
      order.metodoPagamento,
      order.total,
      order.nomeCliente,
      order.observacao ?? "",
      order.numeroPedido,
      order.periodo ?? "",
      order.created_at,
    ));
    printTicket(html);
  }

  return <main className="min-h-screen bg-[#E4EDE3]">
    <header className="bg-[#382110] text-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6"><div className="flex min-w-0 items-center gap-3"><Link href="/" aria-label="Voltar" className="shrink-0 rounded-full p-2 hover:bg-white/10"><ArrowLeft /></Link><div><p className="text-xs uppercase tracking-wider text-[#d8c3b3]">Atendimento</p><h1 className="text-xl font-bold sm:text-2xl">Pedidos dos clientes</h1></div></div><div className="ml-auto flex items-center gap-2"><button type="button" disabled={!orders.length} onClick={() => exportOrders(orders)} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-3 py-2 text-sm font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"><Download size={18} /><span className="hidden sm:inline">Exportar CSV</span><span className="sm:hidden">CSV</span></button><button type="button" aria-label="Atualizar pedidos" onClick={() => void load()} className="rounded-full p-2 hover:bg-white/10"><RefreshCw className={loading ? "animate-spin" : ""} /></button></div></div></header>
    <section className="mx-auto max-w-7xl p-3 sm:p-5">
      {loading && !orders.length ? <div className="flex justify-center py-20"><LoaderCircle className="animate-spin" /></div> : !orders.length ? <p className="rounded-xl bg-white p-8 text-center">Nenhum pedido encontrado.</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => {
          const currentStatus = order.status ?? "recebido";
          const statusLabel = getStatusLabel(currentStatus);
          return <article key={order.id} className="rounded-xl bg-white p-3 shadow-sm sm:p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-medium tracking-wide text-zinc-500">PEDIDO Nº</p><h2 className="text-lg font-bold leading-tight text-[#382110]">{order.numeroPedido}</h2></div><div className="flex items-start gap-2"><button type="button" onClick={() => printOrder(order)} aria-label={`Imprimir pedido nº ${order.numeroPedido}`} title="Imprimir nota" className="rounded-full border border-[#926e56] p-2 text-[#382110] transition hover:bg-[#f3e8df]"><Printer size={18} /></button><div className="text-right"><span className="text-sm font-bold">R$ {order.total.toFixed(2)}</span><p className="mt-1 flex items-center justify-end gap-1.5 text-xs font-semibold text-zinc-600" role="status" aria-label={`Status: ${statusLabel}`}><span className={`h-2.5 w-2.5 rounded-full ${statusColors[currentStatus]}`} aria-hidden="true" />{statusLabel}</p></div></div></div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><CalendarClock size={14} className="shrink-0" /><time dateTime={order.created_at}>{dateFormatter.format(new Date(order.created_at))} às {timeFormatter.format(new Date(order.created_at))}</time></div>
            <div className="mt-2 min-w-0"><p className="break-words text-sm font-semibold leading-tight">{order.nomeCliente}</p><p className="mt-0.5 break-words text-xs leading-5 text-zinc-600">{order.deliveryType === "delivery" ? `Delivery • Taxa R$ ${(order.deliveryFee ?? 10).toFixed(2)}` : "Retirada no local"}</p>{order.deliveryType === "delivery" && <p className="break-words text-xs leading-5 text-zinc-600">{order.enderecoEntrega}</p>}<p className="mt-1 text-xs text-zinc-500">Pagamento: <span className="font-medium text-zinc-700">{order.metodoPagamento}</span></p></div>
            <div className="my-2 min-w-0 border-y py-2 text-xs leading-5">{order.items.map((item) => <p className="break-words" key={`${item.dishId}-${item.nome}`}>{item.quantidade}× {item.nome}</p>)}</div>
            {order.observacao && <p className="mb-2 break-words whitespace-pre-line rounded-md bg-amber-50 px-2 py-1.5 text-xs"><span className="font-semibold">Observação: </span>{order.observacao}</p>}
            <label className="flex items-center gap-2 text-xs font-semibold"><span className="shrink-0">Alterar status</span><select value={currentStatus} disabled={updating === order.id} onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)} className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1.5 text-xs font-normal disabled:opacity-50">{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
          </article>;
        })}
      </div>}
    </section>
  </main>;
}
