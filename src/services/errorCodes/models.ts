import { text, type FormState } from "@/lib/form-state";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Kondisioner modelləri (yalnız admin yazır, RLS). Əvvəl modellər əlavə olunur, xəta kodu yazanda model seçilir.
// Təkrar yoxlaması bazadadır: eyni model adı ikinci dəfə yazılmır (böyük/kiçik hərf və boşluq nəzərə alınmır).
const modelDup = "Bu adlı model artıq var.";

export async function addModel(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  if (!name) return { error: "Model adı vacibdir." };
  const { error } = await createClient().from("ac_models").insert({ name });
  if (error) return { error: error.code === "23505" ? modelDup : error.message };
  revalidate();
  return { ok: true };
}

export async function renameModel(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  if (!name) return { error: "Model adı vacibdir." };
  const { error } = await createClient().from("ac_models").update({ name }).eq("id", id);
  if (error) return { error: error.code === "23505" ? modelDup : error.message };
  revalidate();
  return { ok: true };
}

// Model silinəndə onun xəta kodları da silinir (baza: on delete cascade)
export async function deleteModel(id: number) {
  const { error } = await createClient().from("ac_models").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  revalidate();
  toast.success("Model silindi");
}
