import { mudarQuantidade, removerDish, resetarCart } from "@/store/reduceres/cartSlice";
import { AppDispatch, RootState } from "@/store/reduceres/store"
import { useDispatch, useSelector } from "react-redux"
import { Printer, X } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import { BrintableTicket } from "./BrintableTicket";
import { Form } from "./Form";

import { toast } from 'react-toastify';
import OrdersService, { getOrderPeriod } from "@/services/orders";

function printTicket(html: string) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    const printDocument = iframe.contentDocument;

    if (!printWindow || !printDocument) {
        iframe.remove();
        throw new Error("Não foi possível preparar a impressão.");
    }

    const cleanup = () => iframe.remove();
    printWindow.onafterprint = cleanup;
    printDocument.open();
    printDocument.write(`
        <!doctype html>
        <html lang="pt-BR">
            <head>
                <meta charset="utf-8" />
                <title>Impressão do pedido</title>
                <style>
                    @page { margin: 6mm; }
                    body { margin: 0; color: #000; font-family: Arial, sans-serif; }
                </style>
            </head>
            <body>${html}</body>
        </html>
    `);
    printDocument.close();

    window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 100);

    // Segurança para navegadores que não disparam o evento afterprint.
    window.setTimeout(cleanup, 300000);
}

export function Aside() {

    const dispatch = useDispatch<AppDispatch>();
    const { items = [] } = useSelector((state: RootState) => state.cart);
    const [metodoPagamento, setMetodoPagamento] = useState<string>('');
    const [nomeCliente, setNomeCliente] = useState<string>('');
    const [observacao, setObservacao] = useState<string>('');

    let total = items.reduce((acc, item) => acc + item.preco, 0);
    const printRef = useRef<HTMLDivElement>(null);

    function notify(mensagem: string) {
        toast.error(mensagem)
    }

    useEffect(() => {
        if(items.length > 0) {
            localStorage.setItem("dishCart", JSON.stringify(items));
        }
    }, [items]);

    // const savedItem = JSON.parse(localStorage.getItem("dishCart") || "[]");

    const handlePrint = async () => {

        if (!nomeCliente) {
            notify("Informe o nome do cliente!");
            return;
        }

        if (!metodoPagamento) {
            notify("Informe o método de pagamento!");
            return;
        }

        const now = new Date();
        const periodo = getOrderPeriod(now);

        if (!periodo) {
            notify("Os pedidos são numerados somente das 09h às 14h59 e das 18h às 23h59.");
            return;
        }

        if (printRef.current) {
            const createdAt = now.toISOString();
            let numeroPedido: number;

            try {
                const savedOrder = await OrdersService.adicionar({
                    nomeCliente,
                    metodoPagamento,
                    observacao,
                    total,
                    created_at: createdAt,
                    periodo,
                    items: items.map((item) => ({
                        dishId: item.id,
                        nome: item.nome,
                        precoUnitario: item.precoUnitario,
                        quantidade: item.quantidade,
                        total: item.preco,
                    })),
                });
                numeroPedido = savedOrder.numeroPedido!;
            } catch {
                notify("Não foi possível salvar o pedido. Tente novamente.");
                return;
            }

            const ticketHtml = ReactDOMServer.renderToStaticMarkup(BrintableTicket(items, metodoPagamento, total, nomeCliente, observacao, numeroPedido, periodo, createdAt));
            printTicket(ticketHtml);
            dispatch(resetarCart())
            setMetodoPagamento("")
            setNomeCliente("")
            setObservacao("")
            toast.success("Pedido salvo com sucesso!")
        }
    };
    
    return (
        <aside className="w-full min-w-0 rounded-lg bg-[#f5f5f5] px-4 py-5 shadow-sm sm:px-6 lg:col-start-2 xl:sticky xl:top-5 xl:col-start-auto xl:px-7 xl:py-6">
            {items && items.length > 0 ? (
                <ul className="">
                    <div className="text-end">
                        <button onClick={handlePrint}>
                            <Printer />
                        </button>
                    </div>

                    <div ref={printRef}>

                        <input className="w-full p-2 my-5 rounded-md placeholder:text-zinc-500"
                            required
                            type="text"
                            placeholder="Informe o nome do cliente"
                            value={nomeCliente}
                            onChange={(e) => setNomeCliente(e.target.value)}
                        />

                        {items.map((item: { id: number; nome: string; preco: number, quantidade: number }) => (
                            <li key={item.id} className="mt-2 w-full min-w-0 list-none">
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="min-w-0 break-words text-lg font-bold">{item.nome}</p>
                                        <button onClick={() => dispatch(removerDish({ id: item.id }))}>
                                            <X />
                                        </button>
                                    </div>
                                    <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center xl:flex-col xl:items-stretch 2xl:flex-row 2xl:items-center">
                                        <p className="flex flex-wrap items-center gap-1">
                                            Quantidade:
                                            <button
                                                className="bg-[#926e56] min-w-7 px-2 rounded-sm"
                                                onClick={() => dispatch(mudarQuantidade({ id: item.id, quantidade: -1 }))}>
                                                -
                                            </button>
                                            {item.quantidade}
                                            <button
                                                className="bg-[#926e56] min-w-7 px-2 rounded-sm"
                                                onClick={() => dispatch(mudarQuantidade({ id: item.id, quantidade: +1 }))}>
                                                +
                                            </button>
                                        </p>
                                        <p className="whitespace-nowrap">R$ {item.preco.toFixed(2)}</p>
                                    </div>
                                </div>
                                <hr className="border-[#926e56] border-x-1 mb-3"></hr>
                            </li>
                        ))}

                        <div className="flex justify-between mt-10">
                            <strong>TOTAL:</strong>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl text-[#382110] font-bold mb-2 mt-5">Pagamento</h3>
                        <Form
                            metodoPagamento={metodoPagamento}
                            setMetodoPagamento={setMetodoPagamento}
                        />
                    </div>

                    <div>
                        <textarea
                            className="w-full p-3 my-5 rounded-md placeholder:text-zinc-500"
                            rows={5}
                            placeholder="Coloque a observação aqui!"
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />
                    </div>
                    
                </ul>
                
            ) : (
                <p className="text-center">Ainda não há nenhum pedido</p>
            )}
        </aside>
    )
}
