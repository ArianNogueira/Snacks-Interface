import { createHash, timingSafeEqual } from "node:crypto";
import type { PixStatus } from "./pix";

export function pixEnabled() {
  return process.env.PAGBANK_PIX_ENABLED === "true" && !!process.env.PAGBANK_TOKEN &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.APP_URL &&
    ["sandbox", "production"].includes(process.env.PAGBANK_ENVIRONMENT ?? "sandbox");
}

export function pagbankBase() {
  return process.env.PAGBANK_ENVIRONMENT === "production"
    ? "https://api.pagseguro.com" : "https://sandbox.api.pagseguro.com";
}

export interface ProviderOrder {
  id: string;
  reference_id: string;
  charges?: Array<{
    id: string; reference_id: string; status: string; paid_at?: string;
    amount: { value: number; currency: string; summary?: { paid: number; refunded: number } };
    payment_method: { type: string; pix?: { expiration_date: string } };
    qr_code?: { text: string };
    links?: Array<{ rel: string; href: string }>;
  }>;
}

export async function pagbankRequest(path: string, body?: unknown, key?: string): Promise<ProviderOrder> {
  const response = await fetch(`${pagbankBase()}${path}`, {
    method: body ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`, "Content-Type": "application/json",
      ...(key ? { "x-idempotency-key": key } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error("Não foi possível consultar o PagBank. Tente novamente em instantes.");
  return response.json();
}

export function validSignature(raw: string, signature: string | null, token: string) {
  if (!signature || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHash("sha256").update(`${token}-${raw}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function verifiedCharge(provider: ProviderOrder, reference: string, amount: number) {
  const charge = provider.charges?.find((item) => item.reference_id === reference);
  if (provider.reference_id !== reference || !charge || charge.payment_method.type !== "PIX" ||
      charge.amount.value !== amount || charge.amount.currency !== "BRL") {
    throw new Error("Cobrança incompatível com o pedido.");
  }
  return charge;
}

export function chargeStatus(charge: NonNullable<ProviderOrder["charges"]>[number], expires: string): PixStatus {
  if ((charge.amount.summary?.refunded ?? 0) > 0) return "refunded";
  if (charge.status === "PAID" && charge.amount.summary?.paid === charge.amount.value) return "paid";
  if (["DECLINED", "CANCELED"].includes(charge.status)) return "declined";
  return Date.parse(expires) <= Date.now() ? "expired" : "pending";
}
