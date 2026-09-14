"use client";
import { useCallback, useEffect, useState } from "react";
import { pixLabels, type PixPayment } from "@/lib/pix";

export function PixCheckout({ token, canceled }: { token: string; canceled: boolean }) {
  const [payment, setPayment] = useState<PixPayment | null>(null);
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/pix?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPayment(data.payment); setError("");
    } catch { setError("Não foi possível consultar o pagamento. Tentaremos novamente automaticamente."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => {
    void load();
    const poll = window.setInterval(() => void load(), 15000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(poll); window.clearInterval(tick); };
  }, [load]);
  async function create() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/pix", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, document }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPayment(data.payment); setDocument(""); setEmail("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível gerar o Pix."); }
    finally { setBusy(false); }
  }
  const expired = !!payment && now >= Date.parse(payment.expiresAt);
  const remaining = payment ? Math.max(0, Math.ceil((Date.parse(payment.expiresAt) - now) / 1000)) : 0;
  const status = payment?.status === "pending" && expired ? "expired" : payment?.status;
  return <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4" aria-label="Pagamento Pix">
    <h2 className="text-lg font-bold text-[#382110]">Pagamento via Pix</h2>
    {error && <p role="alert" className="my-2 text-sm text-red-700">{error}</p>}
    {loading ? <p role="status">Consultando pagamento…</p> : <>
      {status && <p role="status" className="my-2 font-semibold">{pixLabels[status]}</p>}
      {canceled && <p className="text-sm">Pedido cancelado. Caso tenha pago, entre em contato com a loja para verificar a devolução.</p>}
      {!canceled && (!payment || (status === "pending" && !payment.text)) && <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); void create(); }}>
        {!payment && <>
          <p className="text-sm">Informe os dados do pagador para emitir a cobrança. O preparo aguarda a confirmação do pagamento.</p>
          <label className="block text-sm">E-mail<input type="email" autoComplete="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
          <label className="block text-sm">CPF ou CNPJ<input inputMode="numeric" required minLength={11} maxLength={18} value={document} onChange={(e) => setDocument(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
        </>}
        <button disabled={busy} className="rounded-full bg-[#382110] px-5 py-2 text-white disabled:opacity-50">{busy ? "Gerando…" : payment ? "Retomar cobrança" : "Gerar QR Code Pix"}</button>
      </form>}
      {!canceled && status === "pending" && payment?.text && <div className="mt-3 space-y-3">
        <p>Valor: <strong>R$ {payment.amount.toFixed(2)}</strong></p>
        {payment.image && <img src={payment.image} alt="QR Code para pagamento Pix do pedido" width={240} height={240} className="mx-auto rounded bg-white" />}
        <p className="text-center text-sm">Válido por {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>
        <label className="block text-sm">Pix Copia e Cola<textarea readOnly value={payment.text} className="mt-1 w-full rounded border p-2 text-xs" rows={3} /></label>
        <button type="button" className="w-full rounded-full bg-[#382110] px-4 py-2 text-white" onClick={async () => {
          try { await navigator.clipboard.writeText(payment.text!); setCopied(true); }
          catch { setError("Selecione o código acima e copie manualmente."); }
        }}>{copied ? "Código copiado" : "Copiar código Pix"}</button>
        <p className="text-sm">A confirmação aparecerá automaticamente após o pagamento.</p>
      </div>}
      {!canceled && (status === "expired" || status === "declined") && <p className="text-sm">Entre em contato com a loja antes de fazer outro pedido. Esta cobrança não está disponível para pagamento.</p>}
    </>}
  </section>;
}
