"use client";

import { mudarQuantidade, removerDish, resetarCart } from "@/store/reduceres/cartSlice";
import { AppDispatch, RootState } from "@/store/reduceres/store";
import { useDispatch, useSelector } from "react-redux";
import { LoaderCircle, Printer, Send, ShoppingBag, ShoppingCart, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { BrintableTicket } from "./BrintableTicket";
import { Form } from "./Form";
import { toast } from "react-toastify";
import OrdersService, { DeliveryType, getOrderPeriod } from "@/services/orders";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function printTicket(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  document.body.appendChild(iframe);
  const printWindow = iframe.contentWindow;
  const printDocument = iframe.contentDocument;
  if (!printWindow || !printDocument) { iframe.remove(); throw new Error("Não foi possível preparar a impressão."); }
  const cleanup = () => iframe.remove();
  printWindow.onafterprint = cleanup;
  printDocument.open();
  printDocument.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pedido</title><style>@page{size:80mm auto;margin:4mm}*{box-sizing:border-box}html,body{width:72mm;margin:0;padding:0;color:#000;background:#fff;font-family:Arial,sans-serif;font-size:12px;line-height:1.25}.thermal-ticket{width:72mm;max-width:72mm;overflow:hidden}.thermal-ticket h1{margin:2mm 0;font-size:20px!important}.thermal-ticket p{margin:1.5mm 0}.ticket-separator{width:100%;margin:1.5mm 0;border-top:1px dashed #000}@media print{html,body{width:72mm}.thermal-ticket{break-inside:avoid}}</style></head><body>${html}</body></html>`);
  printDocument.close();
  window.setTimeout(() => { printWindow.focus(); printWindow.print(); }, 100);
  window.setTimeout(cleanup, 300000);
}

export function Aside() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { role, profile } = useAuth();
  const isStaff = role === "administrador" || role === "funcionario";
  const { items = [] } = useSelector((state: RootState) => state.cart);
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [nomeCliente, setNomeCliente] = useState(profile?.nome ?? "");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [residencia, setResidencia] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [searchingCep, setSearchingCep] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("retirada");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const subtotal = items.reduce((acc, item) => acc + item.preco, 0);
  const deliveryFee = deliveryType === "delivery" ? 10 : 0;
  const total = subtotal + deliveryFee;
  const totalItems = items.reduce((acc, item) => acc + item.quantidade, 0);
  const enderecoEntrega = [logradouro, residencia && `Nº/Casa/Apto: ${residencia}`, bairro && `Bairro: ${bairro}`, complemento && `Complemento: ${complemento}`, cidade && `${cidade}${uf ? ` - ${uf}` : ""}`, cep && `CEP: ${cep}`].filter(Boolean).join(", ");

  useEffect(() => { if (profile?.nome && !nomeCliente) setNomeCliente(profile.nome); }, [nomeCliente, profile?.nome]);
  useEffect(() => {
    if (items.length) localStorage.setItem("dishCart", JSON.stringify(items));
    else localStorage.removeItem("dishCart");
  }, [items]);

  async function searchAddressByCep(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return toast.error("Informe um CEP com 8 números.");
    setSearchingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
      if (!response.ok) throw new Error("CEP não encontrado.");
      const data = await response.json() as { street?: string; neighborhood?: string; city?: string; state?: string };
      setLogradouro(data.street ?? "");
      setBairro(data.neighborhood ?? "");
      setCidade(data.city ?? "");
      setUf(data.state ?? "");
     
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível consultar o CEP.");
    } finally { setSearchingCep(false); }
  }

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
   
    if (digits.length === 8) void searchAddressByCep(digits);
  }

  async function handleSubmit() {
    if (!nomeCliente.trim()) return toast.error("Informe o nome do cliente!");
    if (!metodoPagamento) return toast.error("Informe o método de pagamento!");
    if (!isStaff && !telefone.trim()) return toast.error("Informe um telefone para contato!");
    if (!isStaff && deliveryType === "delivery" && (cep.replace(/\D/g, "").length !== 8 || !bairro.trim() || !logradouro.trim() || !residencia.trim())) return toast.error("Preencha CEP, bairro, endereço e casa/apartamento.");
    const now = new Date();
    const periodo = getOrderPeriod(now);
    if (!periodo) return toast.error("Pedidos disponíveis das 09h às 14h e das 18h às 22:30h.");
    const createdAt = now.toISOString();
    const selectedDeliveryType: DeliveryType = isStaff ? "retirada" : deliveryType;
    const deliveryDetails = selectedDeliveryType === "delivery" ? [`Entrega: Delivery`, `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}`, `Endereço: ${enderecoEntrega.trim()}`] : ["Entrega: Retirada no local"];
    const detalhes = isStaff ? observacao : ["PEDIDO ONLINE", `Telefone: ${telefone.trim()}`, ...deliveryDetails, observacao.trim() && `Observação: ${observacao.trim()}`].filter(Boolean).join("\n");
    setEnviando(true);
    try {
      const saved = await OrdersService.adicionar({
        nomeCliente: nomeCliente.trim(), metodoPagamento, observacao: detalhes, enderecoEntrega: selectedDeliveryType === "delivery" ? enderecoEntrega.trim() : "", total, created_at: createdAt, periodo, deliveryType: selectedDeliveryType, deliveryFee,
        items: items.map((item) => ({ dishId: item.id, nome: item.nome, precoUnitario: item.precoUnitario, quantidade: item.quantidade, total: item.preco })),
      });
      if (isStaff) {
        const html = ReactDOMServer.renderToStaticMarkup(BrintableTicket(items, metodoPagamento, total, nomeCliente, detalhes, saved.numeroPedido!, periodo, createdAt));
        printTicket(html);
      }
      dispatch(resetarCart());
      setMobileOpen(false);
      setMetodoPagamento(""); setObservacao(""); setTelefone(""); setCep(""); setBairro(""); setLogradouro(""); setResidencia(""); setComplemento(""); setCidade(""); setUf(""); setDeliveryType("retirada");
      if (isStaff) setNomeCliente("");
      toast.success(isStaff ? "Pedido salvo e enviado para impressão!" : `Pedido nº ${saved.numeroPedido} enviado com sucesso!`);
      if (!isStaff && saved.trackingToken) router.push(`/acompanhar/${saved.trackingToken}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally { setEnviando(false); }
  }

  const cartContent = !items.length ? <p className="py-6 text-center">Seu carrinho está vazio</p> : <div>
      <h2 className="mb-4 font-bold text-[#382110]">Seu pedido</h2>
      <input className="mb-3 w-full rounded-md p-2 placeholder:text-zinc-500" required placeholder="Nome do cliente" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} />
      {!isStaff && <input className="mb-5 w-full rounded-md p-2 placeholder:text-zinc-500" required type="tel" placeholder="Telefone/WhatsApp" value={telefone} onChange={(e) => setTelefone(e.target.value)} />}
      {!isStaff && <div className="mb-4"><p className="mb-2 text-sm font-semibold text-[#382110]">Como deseja receber?</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { setDeliveryType("retirada"); }} className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-sm font-semibold ${deliveryType === "retirada" ? "border-[#382110] bg-[#382110] text-white" : "border-zinc-300 bg-white"}`}><ShoppingBag size={17} />Retirada</button><button type="button" onClick={() => setDeliveryType("delivery")} className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-sm font-semibold ${deliveryType === "delivery" ? "border-[#382110] bg-[#382110] text-white" : "border-zinc-300 bg-white"}`}><Truck size={17} />Delivery</button></div></div>}
      {!isStaff && deliveryType === "delivery" && <div className="mb-5 space-y-2"><div className="relative"><input className="w-full rounded-md p-2 pr-10 placeholder:text-zinc-500" inputMode="numeric" autoComplete="postal-code" placeholder="CEP" value={cep} onChange={(e) => handleCepChange(e.target.value)} onBlur={() => { if (cep.replace(/\D/g, "").length === 8 && !logradouro) void searchAddressByCep(cep); }} />{searchingCep && <LoaderCircle className="absolute right-3 top-2.5 animate-spin text-zinc-500" size={18} />}</div><input className="w-full rounded-md p-2 placeholder:text-zinc-500" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} /><input className="w-full rounded-md p-2 placeholder:text-zinc-500" placeholder="Endereço (rua/avenida)" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} /><input className="w-full rounded-md p-2 placeholder:text-zinc-500" placeholder="Casa/apartamento e número" value={residencia} onChange={(e) => setResidencia(e.target.value)} /><input className="w-full rounded-md p-2 placeholder:text-zinc-500" placeholder="Complemento ou referência (opcional)" value={complemento} onChange={(e) => setComplemento(e.target.value)} /><p className="rounded-md bg-emerald-50 p-2 text-sm font-semibold text-emerald-800">Taxa fixa de entrega: R$ 10,00</p></div>}
      <ul>{items.map((item) => <li key={item.id} className="mt-2 list-none">
        <div className="flex items-start justify-between gap-2"><p className="break-words text-lg font-bold">{item.nome}</p><button aria-label={`Remover ${item.nome}`} onClick={() => dispatch(removerDish({ id: item.id }))}><X /></button></div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-1">Quantidade: <button className="min-w-7 rounded-sm bg-[#926e56] px-2 text-white" onClick={() => dispatch(mudarQuantidade({ id: item.id, quantidade: -1 }))}>−</button>{item.quantidade}<button className="min-w-7 rounded-sm bg-[#926e56] px-2 text-white" onClick={() => dispatch(mudarQuantidade({ id: item.id, quantidade: 1 }))}>+</button></p><p>R$ {item.preco.toFixed(2)}</p></div>
        <hr className="mb-3 border-[#926e56]" />
      </li>)}</ul>
      <div className="mt-8 space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>{deliveryType === "delivery" && <div className="flex justify-between"><span>Taxa de entrega:</span><span>R$ {deliveryFee.toFixed(2)}</span></div>}<div className="flex justify-between border-t pt-2 text-base"><strong>TOTAL:</strong><strong>R$ {total.toFixed(2)}</strong></div></div>
      <h3 className="mb-2 mt-5 text-xl font-bold text-[#382110]">Pagamento</h3>
      <Form metodoPagamento={metodoPagamento} setMetodoPagamento={setMetodoPagamento} />
      <textarea className="my-5 w-full rounded-md p-3 placeholder:text-zinc-500" rows={4} placeholder="Observações do pedido" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
      <button type="button" disabled={enviando} onClick={() => void handleSubmit()} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#382110] px-5 py-3 font-bold text-white hover:bg-[#5a3822] disabled:cursor-wait disabled:opacity-60">{isStaff ? <Printer size={20} /> : <Send size={20} />}{enviando ? "Enviando..." : isStaff ? "Salvar e imprimir" : "Enviar pedido"}</button>
    </div>;

  return <>
    {items.length > 0 && <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-[#382110] px-5 py-3 text-white shadow-xl xl:hidden"
      aria-label={`Abrir carrinho com ${totalItems} item(ns)`}
    >
      <span className="flex items-center gap-3"><span className="relative"><ShoppingCart size={22} /><span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e7b98a] px-1 text-xs font-bold text-[#382110]">{totalItems}</span></span><strong>Ver carrinho</strong></span>
      <strong>R$ {total.toFixed(2)}</strong>
    </button>}

    {mobileOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/55 xl:hidden" onClick={() => setMobileOpen(false)}>
      <section className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-[#f5f5f5] px-4 pb-8 pt-4 shadow-2xl sm:px-6" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 mb-3 flex items-center justify-between border-b bg-[#f5f5f5] pb-3">
          <div className="flex items-center gap-2 text-[#382110]"><ShoppingCart size={21} /><strong>Carrinho</strong><span className="text-sm text-zinc-500">({totalItems})</span></div>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar carrinho" className="rounded-full p-2 hover:bg-zinc-200"><X /></button>
        </div>
        {cartContent}
      </section>
    </div>}

    <aside className="hidden w-full min-w-0 rounded-lg bg-[#f5f5f5] px-4 py-5 shadow-sm xl:sticky xl:top-5 xl:col-start-auto xl:block xl:max-h-[calc(100dvh-2.5rem)] xl:overflow-y-auto xl:px-7 xl:py-6">
      {cartContent}
    </aside>
  </>;
}
