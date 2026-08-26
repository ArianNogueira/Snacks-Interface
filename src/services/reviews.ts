import { supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  dish_id: number;
  dishName?: string;
}

export async function createReview(dishId: number, rating: number, comment: string) {
  const normalizedComment = comment.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Escolha uma nota de 1 a 5 estrelas.");
  if (!normalizedComment) throw new Error("Escreva um comentário.");
  if (normalizedComment.length > 500) throw new Error("O comentário deve ter no máximo 500 caracteres.");

  const { error } = await supabase.from("reviews").insert({ dish_id: dishId, rating, comment: normalizedComment });
  if (error) throw new Error(`Não foi possível enviar a avaliação: ${error.message}`);
}

export async function getReviews(dishId?: number): Promise<Review[]> {
  let query = supabase.from("reviews").select("id, dish_id, rating, comment, created_at, dishes(nome)").order("created_at", { ascending: false });
  if (dishId !== undefined) query = query.eq("dish_id", dishId);
  const { data, error } = await query;
  if (error) throw new Error(`Não foi possível consultar as avaliações: ${error.message}`);
  return (data ?? []).map((row) => {
    const dish = row.dishes as unknown as { nome: string } | { nome: string }[] | null;
    return {
      id: String(row.id),
      dish_id: Number(row.dish_id),
      rating: Number(row.rating),
      comment: String(row.comment),
      created_at: String(row.created_at),
      dishName: Array.isArray(dish) ? dish[0]?.nome : dish?.nome,
    };
  });
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(`Não foi possível excluir a avaliação: ${error.message}`);
}
