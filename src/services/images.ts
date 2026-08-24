import { supabase } from "@/lib/supabase";

const BUCKET = "dish-images";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}

export const ImagesService = {
  upload: async (file: File): Promise<string> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Use uma imagem JPG, PNG ou WebP.");
    }
    if (file.size > MAX_SIZE) {
      throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const path = `dishes/${crypto.randomUUID()}.${extension(file)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
    });
    if (error) throw new Error(`Erro ao enviar imagem: ${error.message}`);

    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },

  removeByUrl: async (url: string): Promise<void> => {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const path = url.includes(marker) ? decodeURIComponent(url.split(marker)[1]) : null;
    if (!path) return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(`Erro ao remover imagem: ${error.message}`);
  },
};
