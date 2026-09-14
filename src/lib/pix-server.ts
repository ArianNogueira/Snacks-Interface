import { createClient } from "@supabase/supabase-js";
import { pagbankRequest, verifiedCharge, chargeStatus, pixEnabled, pagbankBase } from "./pagbank";
import type { ProviderOrder } from "./pagbank";
import { PIX_METHOD, type PixPayment } from "./pix";

export function paymentDb() {
  if (!pixEnabled()) throw new Error("Pagamento Pix indisponível no momento.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function findOrder(token: string) {
  if (!/^[a-zA-Z0-9_-]{20,128}$/.test(token)) throw new Error("Link de pedido inválido.");
  const db = paymentDb();
  const { data, error } = await db.from("orders").select("id,nome_cliente,total,status,metodo_pagamento,created_at")
    .eq("tracking_token", token).single();
  if (error || !data || data.metodo_pagamento !== PIX_METHOD) throw new Error("Pedido Pix não encontrado.");
  return data;
}

export async function readPayment(orderId: number) {
  const { data, error } = await paymentDb().from("pagbank_payments").select("*").eq("order_id", orderId).maybeSingle();
  if (error) throw new Error("Não foi possível consultar o pagamento.");
  return data;
}

export async function saveProvider(orderId: number, provider: ProviderOrder) {
  const payment = await readPayment(orderId);
  if (!payment) throw new Error("Pagamento não encontrado.");
  const charge = verifiedCharge(provider, payment.reference, payment.amount);
  const expires = charge.payment_method.pix?.expiration_date ?? payment.expires_at;
  const image = charge.links?.find((link) => link.rel === "QRCODE.PNG")?.href ?? null;
  // Never persist an arbitrary URL that would later receive the provider token.
  if (image && (!image.startsWith(`${pagbankBase()}/qrcode/`) || new URL(image).origin !== pagbankBase())) {
    throw new Error("Imagem Pix inválida.");
  }
  const status = chargeStatus(charge, expires);
  const { error } = await paymentDb().rpc("save_pagbank_payment", {
    p_order_id: orderId, p_provider_id: provider.id, p_status: status,
    p_text: charge.qr_code?.text ?? null, p_image: image, p_expires: expires,
    p_paid_at: charge.paid_at ?? null,
  });
  if (error) throw new Error("Não foi possível registrar o pagamento. Consulte novamente.");
  return readPayment(orderId);
}

export async function syncPayment(orderId: number) {
  const payment = await readPayment(orderId);
  if (!payment?.provider_id) return payment;
  if (Date.now() - Date.parse(payment.checked_at) < 10000) return payment;
  return saveProvider(orderId, await pagbankRequest(`/orders/${encodeURIComponent(payment.provider_id)}`));
}

export function publicPayment(payment: Awaited<ReturnType<typeof readPayment>>, token: string): PixPayment | null {
  if (!payment) return null;
  return { status: payment.status === "pending" && Date.parse(payment.expires_at) <= Date.now() ? "expired" : payment.status,
    amount: payment.amount / 100, text: payment.qr_text,
    image: payment.qr_image ? `/api/pix/image?token=${encodeURIComponent(token)}` : null,
    expiresAt: payment.expires_at };
}
