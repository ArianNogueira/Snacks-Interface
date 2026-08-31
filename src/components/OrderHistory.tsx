"use client";

import { useEffect, useState } from "react";
import { Download, History, Printer, X } from "lucide-react";
import OrdersService, { Order } from "@/services/orders";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import ReactDOMServer from "react-dom/server";
import { BrintableTicket } from "./BrintableTicket";
import { printTicket } from "./Cart";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportToExcel(orders: Order[]) {
  const header = [
    "Data e hora",
    "Período",
    "Número do pedido",
    "Cliente",
    "Pagamento",
    "Endereço de entrega",
    "Item",
    "Quantidade",
    "Preço unitário",
    "Total do item",
    "Total do pedido",
    "Observação",
  ];

  const rows = orders.flatMap((order) =>
    order.items.map((item) => [
      formatDate(order.created_at),
      order.periodo ?? "",
      order.numeroPedido ?? "",
      order.nomeCliente,
      order.metodoPagamento,
      order.enderecoEntrega ?? "",
      item.nome,
      item.quantidade,
      item.precoUnitario.toFixed(2).replace(".", ","),
      item.total.toFixed(2).replace(".", ","),
      order.total.toFixed(2).replace(".", ","),
      order.observacao ?? "",
    ])
  );

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(";"))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historico-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrderHistory() {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    OrdersService.buscar()
      .then((data) => setOrders(data.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))))
      .catch(() => toast.error("Não foi possível carregar o histórico de pedidos."))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const channel = supabase.channel("online-orders-inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        if (!open) {
          toast.info("Novo pedido online recebido! Abra o histórico para imprimir.");
          return;
        }
        window.setTimeout(() => {
          void OrdersService.buscar().then(setOrders).catch(() => undefined);
        }, 300);
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [open]);

  function printOrder(order: Order) {
    const items = order.items.map((item) => ({ id: item.dishId, nome: item.nome, preco: item.total, precoUnitario: item.precoUnitario, quantidade: item.quantidade }));
    const html = ReactDOMServer.renderToStaticMarkup(BrintableTicket(items, order.metodoPagamento, order.total, order.nomeCliente, order.observacao ?? "", order.numeroPedido!, order.periodo ?? "", order.created_at));
    printTicket(html);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[#926e56] bg-white px-5 py-3 text-[#382110] transition-colors hover:bg-[#f5f5f5]"
      >
        <History size={20} />
        Histórico
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6" onClick={() => setOpen(false)}>
          <section className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-lg" onClick={(event) => event.stopPropagation()}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-[#382110] sm:text-2xl">Histórico de pedidos</h2>
                <p className="text-sm text-zinc-600">{orders.length} pedido(s) salvo(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!orders.length}
                  onClick={() => exportToExcel(orders)}
                  className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={18} />
                  Exportar para Excel
                </button>
                <button type="button" aria-label="Fechar histórico" onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-zinc-100">
                  <X />
                </button>
              </div>
            </header>

            <div className="overflow-auto p-4 sm:p-6">
              {loading ? (
                <p>Carregando histórico...</p>
              ) : orders.length === 0 ? (
                <p>Nenhum pedido foi salvo.</p>
              ) : (
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-[#f5f5f5]">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Período</th>
                      <th className="p-3">Nº</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Pagamento</th>
                      <th className="p-3">Entrega</th>
                      <th className="p-3">Itens</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Imprimir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id ?? order.created_at} className="border-b align-top hover:bg-zinc-50">
                        <td className="whitespace-nowrap p-3">{formatDate(order.created_at)}</td>
                        <td className="whitespace-nowrap p-3">{order.periodo ?? "Anterior"}</td>
                        <td className="p-3 font-bold">{order.numeroPedido ?? "—"}</td>
                        <td className="p-3">{order.nomeCliente}</td>
                        <td className="p-3">{order.metodoPagamento}</td>
                        <td className="max-w-56 whitespace-pre-line p-3">{order.enderecoEntrega || "Retirada/balcão"}</td>
                        <td className="p-3">{order.items.map((item) => `${item.quantidade}× ${item.nome}`).join(", ")}</td>
                        <td className="whitespace-nowrap p-3 text-right font-bold">R$ {order.total.toFixed(2)}</td>
                        <td className="p-3 text-center"><button type="button" aria-label={`Imprimir pedido ${order.numeroPedido}`} onClick={() => printOrder(order)} className="rounded-md p-2 text-[#382110] hover:bg-zinc-200"><Printer size={19} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
