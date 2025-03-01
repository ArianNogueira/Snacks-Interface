import { mudarQuantidade, removerDish, resetarCart } from "@/store/reduceres/cartSlice";
import { AppDispatch, RootState } from "@/store/reduceres/store"
import { useDispatch, useSelector } from "react-redux"
import { Printer } from 'lucide-react';
import { useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import { BrintableTicket } from "./BrintableTicket";
import { Form } from "./Form";

export function Aside() {

    const dispatch = useDispatch<AppDispatch>();
    const { items = [] } = useSelector((state: RootState) => state.cart);
    const [metodoPagamento, setMetodoPagamento] = useState<string>('');
    const [nomeCliente, setNomeCliente] = useState<string>('');

    let total = items.reduce((acc, item) => acc + item.preco, 0);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if(!nomeCliente) {
            alert("Informe o nome do cliente");
            return;
        }

        if (!metodoPagamento) {
            alert("Selecione um método de pagamento antes de continuar!");
            return;
        }

        if (printRef.current) {
            const janela = window.open();
            if (!janela) return;

            const ticketHtml = ReactDOMServer.renderToStaticMarkup(BrintableTicket(items, metodoPagamento, total, nomeCliente));

            janela?.document.write(`
                <html>
                    <head>
                        <title>Impressão do Carrinho</title>
                    </head>
                    <body>
                        ${ticketHtml}
                    </body>
                </html>
            `);
            janela?.document.close();
            janela?.print();
            dispatch(resetarCart())
            setMetodoPagamento("")
        }
    };

    return (
        <aside className="w-full md:w-80 md:ml-6 bg-[#f5f5f5] px-7 py-6 rounded-lg">

            {items && items.length > 0 ? (

                <ul>
                    <button className="mb-3" onClick={handlePrint}>
                        <Printer />
                    </button>

                    <div ref={printRef}>

                        <input className="w-full p-2 my-3 rounded-md placeholder:text-zinc-500"
                        required 
                        type="text" 
                        placeholder="Informe o nome do cliente" 
                        onChange={(e) => setNomeCliente(e.target.value)}
                        />

                        {items.map((item: { id: number; nome: string; preco: number, quantidade: number }) => (
                            <li key={item.id} className="w-full list-none">
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-lg font-bold">{item.nome}</p>
                                        <button onClick={() => dispatch(removerDish({ id: item.id }))}>
                                            X
                                        </button>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <p className="flex gap-1">
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
                                        <p>R$ {item.preco.toFixed(2)}</p>
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

                </ul>

            ) : (
                <p className="text-center">Ainda não há nenhum pedido</p>
            )}
        </aside>
    )
}