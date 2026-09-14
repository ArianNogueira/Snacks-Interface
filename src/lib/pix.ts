export const PIX_METHOD = "Pix PagBank";
export type PixStatus = "pending" | "paid" | "expired" | "declined" | "refunded";
export const pixLabels: Record<PixStatus, string> = {
  pending: "Aguardando pagamento", paid: "Pago", expired: "Pix expirado",
  declined: "Cobrança recusada", refunded: "Devolução registrada",
};
export interface PixPayment {
  status: PixStatus;
  amount: number;
  text: string | null;
  image: string | null;
  expiresAt: string;
}
