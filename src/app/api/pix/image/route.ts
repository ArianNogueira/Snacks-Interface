import { findOrder, readPayment } from "@/lib/pix-server";
import { pagbankBase } from "@/lib/pagbank";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const order = await findOrder(new URL(request.url).searchParams.get("token") ?? "");
    const payment = await readPayment(order.id);
    const url = payment?.qr_image;
    if (!url || !url.startsWith(`${pagbankBase()}/qrcode/`) || new URL(url).origin !== pagbankBase()) return new Response(null, { status: 404 });
    const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.PAGBANK_TOKEN}` },
      redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) throw new Error();
    return new Response(await response.arrayBuffer(), { headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 503 }); }
}
