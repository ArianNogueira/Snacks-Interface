"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Banknote, CalendarDays, ChevronLeft, ChevronRight, Clock3, CreditCard, PackageOpen, ReceiptText, RefreshCw, ShoppingBag, TrendingUp, Trophy, WalletCards } from "lucide-react";
import OrdersService, { getLocalDateKey, Order } from "@/services/orders";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const toDate = (key: string) => { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); };
const moveDate = (key: string, days: number) => { const date = toDate(key); date.setDate(date.getDate() + days); return getLocalDateKey(date); };
const dateLabel = (key: string) => key === getLocalDateKey(new Date()) ? "Hoje" : new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(toDate(key));

function StatCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof Banknote }) {
  return <article className="rounded-2xl border border-[#d9e3d7] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-500">{title}</p><p className="mt-2 text-2xl font-bold text-[#382110] sm:text-3xl">{value}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></div><span className="rounded-xl bg-[#e4ede3] p-3 text-[#5f7b5d]"><Icon size={23} /></span></div></article>;
}

export function DailyRevenue() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateKey(new Date()));
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true); setError("");
    try { setOrders(await OrdersService.buscar()); } catch { setError("Não foi possível carregar os pedidos. Tente novamente."); } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  const dailyOrders = useMemo(() => orders.filter(order => getLocalDateKey(new Date(order.created_at)) === selectedDate), [orders, selectedDate]);
  const stats = useMemo(() => {
    const revenue = dailyOrders.reduce((sum, order) => sum + order.total, 0);
    const itemCount = dailyOrders.reduce((sum, order) => sum + order.items.reduce((n, item) => n + item.quantidade, 0), 0);
    const payments = Object.entries(dailyOrders.reduce<Record<string, number>>((acc, order) => { const method = order.metodoPagamento || "Não informado"; acc[method] = (acc[method] ?? 0) + order.total; return acc; }, {})).sort((a, b) => b[1] - a[1]);
    const periods = ["09:00-14:59", "18:00-23:59"].map(period => { const list = dailyOrders.filter(order => order.periodo === period); return { period, orders: list.length, total: list.reduce((sum, order) => sum + order.total, 0) }; });
    const products = Object.values(dailyOrders.flatMap(order => order.items).reduce<Record<string, { name: string; quantity: number; total: number }>>((acc, item) => { const key = String(item.dishId || item.nome); acc[key] ??= { name: item.nome, quantity: 0, total: 0 }; acc[key].quantity += item.quantidade; acc[key].total += item.total; return acc; }, {})).sort((a, b) => b.quantity - a.quantity || b.total - a.total);
    return { revenue, itemCount, average: dailyOrders.length ? revenue / dailyOrders.length : 0, payments, periods, products };
  }, [dailyOrders]);
  const maxPayment = Math.max(...stats.payments.map(([, value]) => value), 1);
  const today = getLocalDateKey(new Date());

  return <main className="min-h-screen bg-[#e4ede3] text-zinc-800">
    <header className="border-b border-black/10 bg-[#382110] text-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8"><div className="flex items-center gap-4"><Link href="/" aria-label="Voltar ao cardápio" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft /></Link><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8c3b3]">Cléo Nogueira Lanches</p><h1 className="text-xl font-bold sm:text-2xl">Faturamento diário</h1></div></div><button type="button" onClick={loadOrders} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Atualizar</button></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center"><div><div className="flex items-center gap-2 text-[#5f7b5d]"><CalendarDays size={19} /><span className="text-sm font-semibold">Dia analisado</span></div><p className="mt-1 capitalize text-lg font-bold text-[#382110]">{dateLabel(selectedDate)}</p></div><div className="flex items-center gap-2"><button aria-label="Dia anterior" onClick={() => setSelectedDate(moveDate(selectedDate, -1))} className="rounded-lg border p-2 hover:bg-zinc-50"><ChevronLeft /></button><input type="date" value={selectedDate} max={today} onChange={e => e.target.value && setSelectedDate(e.target.value)} className="min-w-0 rounded-lg border border-zinc-300 px-3 py-2" /><button aria-label="Próximo dia" disabled={selectedDate === today} onClick={() => setSelectedDate(moveDate(selectedDate, 1))} className="rounded-lg border p-2 hover:bg-zinc-50 disabled:opacity-35"><ChevronRight /></button></div></section>
      {error ? <Empty icon={PackageOpen} text={error} /> : loading ? <Empty icon={RefreshCw} text="Carregando estatísticas..." loading /> : <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Faturamento" value={money.format(stats.revenue)} detail="Total recebido no dia" icon={TrendingUp} /><StatCard title="Pedidos" value={String(dailyOrders.length)} detail="Vendas registradas" icon={ReceiptText} /><StatCard title="Ticket médio" value={money.format(stats.average)} detail="Média por pedido" icon={WalletCards} /><StatCard title="Itens vendidos" value={String(stats.itemCount)} detail="Unidades comercializadas" icon={ShoppingBag} /></section>
        {!dailyOrders.length ? <Empty icon={PackageOpen} title="Nenhuma venda neste dia" text="Escolha outra data para consultar o faturamento." spaced /> : <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-[#382110]"><Clock3 size={20} /> Faturamento por período</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{stats.periods.map(row => <article key={row.period} className="rounded-xl border p-4"><p className="text-sm text-zinc-500">{row.period}</p><p className="mt-1 text-xl font-bold text-[#382110]">{money.format(row.total)}</p><p className="mt-2 text-xs text-zinc-500">{row.orders} pedido(s)</p></article>)}</div></section>
          <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-[#382110]"><CreditCard size={20} /> Formas de pagamento</h2><div className="mt-5 space-y-4">{stats.payments.map(([method, value]) => <div key={method}><div className="mb-1 flex justify-between text-sm"><span>{method}</span><strong>{money.format(value)}</strong></div><div className="h-2 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-[#5f7b5d]" style={{ width: `${value / maxPayment * 100}%` }} /></div></div>)}</div></section>
          <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2"><h2 className="flex items-center gap-2 text-lg font-bold text-[#382110]"><Trophy size={20} /> Produtos mais vendidos</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b text-xs uppercase text-zinc-500"><tr><th className="py-3">Posição</th><th>Produto</th><th className="text-center">Quantidade</th><th className="text-right">Faturamento</th></tr></thead><tbody>{stats.products.map((product, index) => <tr key={product.name} className="border-b last:border-0"><td className="py-3 font-bold text-[#926e56]">#{index + 1}</td><td>{product.name}</td><td className="text-center">{product.quantity}</td><td className="text-right font-semibold">{money.format(product.total)}</td></tr>)}</tbody></table></div></section>
        </div>}
      </>}
    </div>
  </main>;
}

function Empty({ icon: Icon, title, text, loading, spaced }: { icon: typeof PackageOpen; title?: string; text: string; loading?: boolean; spaced?: boolean }) {
  return <section className={`${spaced ? "mt-6 " : ""}rounded-2xl bg-white p-10 text-center shadow-sm`}><Icon className={`mx-auto mb-3 text-[#926e56] ${loading ? "animate-spin" : ""}`} size={38} />{title && <h2 className="text-lg font-bold text-[#382110]">{title}</h2>}<p className="mt-1 text-sm text-zinc-500">{text}</p></section>;
}
