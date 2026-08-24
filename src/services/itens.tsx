import { supabase } from "@/lib/supabase";
import { ImagesService } from "@/services/images";

export interface Dish {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
  imagem: string;
  descricao?: string;
}

function normalizeDish(row: Record<string, unknown>): Dish {
  return {
    id: Number(row.id),
    nome: String(row.nome),
    preco: Number(row.preco),
    quantidade: Number(row.quantidade ?? 1),
    categoria: String(row.categoria),
    imagem: String(row.imagem),
    descricao: row.descricao ? String(row.descricao) : undefined,
  };
}

const DishesService = {
  buscar: async (): Promise<Dish[]> => {
    const { data, error } = await supabase.from("dishes").select("*").order("id");
    if (error) throw new Error(`Erro ao buscar pratos: ${error.message}`);
    return (data ?? []).map(normalizeDish);
  },

  adicionar: async (dish: Dish): Promise<Dish> => {
    const { id: _id, ...newDish } = dish;
    const { data, error } = await supabase.from("dishes").insert(newDish).select().single();
    if (error) throw new Error(`Erro ao adicionar prato: ${error.message}`);
    return normalizeDish(data);
  },

  editar: async (dish: Dish | null): Promise<Dish> => {
    if (!dish) throw new Error("Prato não informado.");
    const { id, ...changes } = dish;
    const { data, error } = await supabase.from("dishes").update(changes).eq("id", id).select().single();
    if (error) throw new Error(`Erro ao editar prato: ${error.message}`);
    return normalizeDish(data);
  },

  deletar: async (dish: Dish): Promise<Dish> => {
    const { data, error } = await supabase.from("dishes").delete().eq("id", dish.id).select().single();
    if (error) throw new Error(`Erro ao excluir prato: ${error.message}`);
    await ImagesService.removeByUrl(dish.imagem).catch(() => undefined);
    return normalizeDish(data);
  },
};

export default DishesService;
