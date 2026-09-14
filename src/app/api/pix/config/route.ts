import { pixEnabled } from "@/lib/pagbank";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ enabled: pixEnabled() }, { headers: { "Cache-Control": "no-store" } });
}
