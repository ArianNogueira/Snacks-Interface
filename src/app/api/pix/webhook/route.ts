import { pagbankRequest, pixEnabled, validSignature } from "@/lib/pagbank";
import { paymentDb, saveProvider } from "@/lib/pix-server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!pixEnabled()) return new Response(null, { status: 503 });
  const raw = await request.text();
  if (raw.length > 100000 || !validSignature(raw, request.headers.get("x-authenticity-token"), process.env.PAGBANK_TOKEN!)) {
    return new Response(null, { status: 401 });
  }
  try {
    const event = JSON.parse(raw);
    if (typeof event.id !== "string" || !/^ORDE_[a-f\d-]+$/i.test(event.id)) return new Response(null, { status: 400 });
    const provider = await pagbankRequest(`/orders/${encodeURIComponent(event.id)}`);
    const { data, error } = await paymentDb().from("pagbank_payments").select("order_id")
      .eq("reference", provider.reference_id).maybeSingle();
    if (error) throw error;
    if (data) await saveProvider(data.order_id, provider);
    return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 503 }); }
}
