import { supabase } from "@/lib/supabase";
import { ImagesService } from "@/services/images";

export interface Dish {
  id: number;
  nome: string;
  preco: number;
  em_promocao: boolean;
  preco_promocional: number | null;
  quantidade: number;
  categoria: string;
  imagem: string;
  descricao?: string;
  availableToday: boolean;
  averageRating: number;
  reviewCount: number;
}

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDish(row: Record<string, unknown>, availableToday = true, averageRating = 0, reviewCount = 0): Dish {
  return {
    id: Number(row.id),
    nome: String(row.nome),
    preco: Number(row.preco),
    em_promocao: Boolean(row.em_promocao),
    preco_promocional: row.preco_promocional == null ? null : Number(row.preco_promocional),
    quantidade: Number(row.quantidade ?? 1),
    categoria: String(row.categoria),
    imagem: String(row.imagem),
    descricao: row.descricao ? String(row.descricao) : undefined,
    availableToday,
    averageRating,
    reviewCount,
  };
}

const DishesService = {
  buscar: async (): Promise<Dish[]> => {
    const [{ data, error }, { data: availability, error: availabilityError }, { data: reviews, error: reviewsError }] = await Promise.all([
      supabase.from("dishes").select("*").order("id"),
      supabase
        .from("dish_availability")
        .select("dish_id, available")
        .eq("availability_date", getLocalDateKey()),
      supabase.from("reviews").select("dish_id, rating"),
    ]);
    if (error) throw new Error(`Erro ao buscar pratos: ${error.message}`);
    if (availabilityError) throw new Error(`Erro ao buscar disponibilidade: ${availabilityError.message}`);
    if (reviewsError) throw new Error(`Erro ao buscar avaliações: ${reviewsError.message}`);
    const availabilityByDish = new Map(
      (availability ?? []).map((row) => [Number(row.dish_id), Boolean(row.available)])
    );
    const ratingsByDish = (reviews ?? []).reduce<Record<number, { total: number; count: number }>>((result, review) => {
      const dishId = Number(review.dish_id);
      result[dishId] ??= { total: 0, count: 0 };
      result[dishId].total += Number(review.rating);
      result[dishId].count += 1;
      return result;
    }, {});
    return (data ?? []).map((row) => {
      const rating = ratingsByDish[Number(row.id)];
      return normalizeDish(
        row,
        availabilityByDish.get(Number(row.id)) ?? true,
        rating ? rating.total / rating.count : 0,
        rating?.count ?? 0
      );
    });
  },

  definirDisponibilidade: async (dishId: number, available: boolean): Promise<{ dishId: number; available: boolean }> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error("Sessão inválida. Entre novamente.");

    const { error } = await supabase.from("dish_availability").upsert(
      {
        dish_id: dishId,
        availability_date: getLocalDateKey(),
        available,
        updated_by: userData.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dish_id,availability_date" }
    );
    if (error) throw new Error(`Erro ao atualizar disponibilidade: ${error.message}`);
    return { dishId, available };
  },

  adicionar: async (dish: Dish): Promise<Dish> => {
    const { id: _id, availableToday: _availableToday, averageRating: _averageRating, reviewCount: _reviewCount, ...newDish } = dish;
    const { data, error } = await supabase.from("dishes").insert(newDish).select().single();
    if (error) throw new Error(`Erro ao adicionar prato: ${error.message}`);
    return normalizeDish(data);
  },

  editar: async (dish: Dish | null): Promise<Dish> => {
    if (!dish) throw new Error("Prato não informado.");
    const { id, availableToday, averageRating, reviewCount, ...changes } = dish;
    const { data, error } = await supabase.from("dishes").update(changes).eq("id", id).select().single();
    if (error) throw new Error(`Erro ao editar prato: ${error.message}`);
    return normalizeDish(data, availableToday, averageRating, reviewCount);
  },

  deletar: async (dish: Dish): Promise<Dish> => {
    const { data, error } = await supabase.from("dishes").delete().eq("id", dish.id).select().single();
    if (error) throw new Error(`Erro ao excluir prato: ${error.message}`);
    await ImagesService.removeByUrl(dish.imagem).catch(() => undefined);
    return normalizeDish(data);
  },
};

export default DishesService;
