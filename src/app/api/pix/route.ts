import { randomUUID } from "node:crypto";
import { findOrder, paymentDb, publicPayment, readPayment, saveProvider, syncPayment } from "@/lib/pix-server";
import { pagbankRequest } from "@/lib/pagbank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function reply(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const order = await findOrder(token);
    return reply({ payment: publicPayment(await syncPayment(order.id), token) });
  } catch { return reply({ error: "Não foi possível consultar o Pix. Tente novamente." }, 503); }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(process.env.APP_URL!).origin) return reply({ error: "Origem inválida." }, 403);
    const raw = await request.text();
    if (raw.length > 4096) return reply({ error: "Dados inválidos." }, 400);
    const { token, email, document } = JSON.parse(raw);
    if (typeof token !== "string") return reply({ error: "Link inválido." }, 400);
    const order = await findOrder(token);
    if (order.status === "cancelado") return reply({ error: "Pedido cancelado. Entre em contato com a loja." }, 409);
    let payment = await readPayment(order.id);
    if (!payment) {
      const taxId = typeof document === "string" ? document.replace(/\D/g, "") : "";
      if (!/^\d{11}$|^\d{14}$/.test(taxId) || typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return reply({ error: "Informe CPF/CNPJ e e-mail válidos." }, 400);
      }
      const amount = Math.round(Number(order.total) * 100);
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Valor inválido.");
      const reference = randomUUID();
      const expires = new Date(Date.now() + 15 * 60000).toISOString();
      const payload = { reference_id: reference,
        customer: { name: order.nome_cliente, email: email.trim(), tax_id: taxId },
        items: [{ name: `Pedido ${order.id} (inclui entrega quando aplicável)`, quantity: 1, unit_amount: amount }],
        charges: [{ reference_id: reference, amount: { value: amount, currency: "BRL" },
          payment_method: { type: "PIX", pix: { expiration_date: expires } } }],
        notification_urls: [new URL("/api/pix/webhook", process.env.APP_URL!).href] };
      // The unique order_id chooses a single durable payload/key across concurrent requests.
      const { error } = await paymentDb().from("pagbank_payments").upsert({ order_id: order.id,
        reference, amount, expires_at: expires, request_payload: payload }, { onConflict: "order_id", ignoreDuplicates: true });
      if (error) throw new Error("Não foi possível preparar a cobrança.");
      payment = await readPayment(order.id);
    }
    if (!payment) throw new Error("Pagamento indisponível.");
    if (payment.provider_id) payment = await syncPayment(order.id);
    else {
      if (Date.parse(payment.expires_at) <= Date.now()) return reply({ error: "Prazo encerrado. Entre em contato com a loja antes de fazer outro pedido." }, 409);
      payment = await saveProvider(order.id, await pagbankRequest("/orders", payment.request_payload, payment.reference));
    }
    return reply({ payment: publicPayment(payment, token) });
  } catch { return reply({ error: "Não foi possível gerar o Pix. Seu pedido foi salvo; tente novamente nesta página." }, 503); }
}
