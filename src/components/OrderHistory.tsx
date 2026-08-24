"use client";

import { useEffect, useState } from "react";
import { Download, History, X } from "lucide-react";
import OrdersService, { Order } from "@/services/orders";
import { toast } from "react-toastify";

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
                      <th className="p-3">Itens</th>
                      <th className="p-3 text-right">Total</th>
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
                        <td className="p-3">{order.items.map((item) => `${item.quantidade}× ${item.nome}`).join(", ")}</td>
                        <td className="whitespace-nowrap p-3 text-right font-bold">R$ {order.total.toFixed(2)}</td>
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
