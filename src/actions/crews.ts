import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Briqadalar (0071): hazır usta qrupları; tapşırıq formasında bir kliklə seçilir. Yazmaq yalnız admin (RLS).

export type Crew = { id: number; name: string | null; members: number[] }; // name: istəyə görə (0075)

export async function listCrews(): Promise<Crew[]> {
  const { data } = await createClient().from("crews").select("id, name, crew_members(employee_id)").order("name");
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, members: c.crew_members.map((m) => m.employee_id) }));
}

// Yeni və ya mövcud briqadanı saxla: ad + üzvlər (üzvlər tamamilə əvəz olunur)
export async function saveCrew(crew: { id?: number; name: string; members: number[] }): Promise<boolean> {
  const supabase = createClient();
  // Ad istəyə görədir (0075): boşdursa null, siyahıda üzvlərin adları göstərilir
  const name = crew.name.trim() || null;
  if (crew.members.length < 2) return toast.error("Briqadada ən azı 2 nəfər olmalıdır."), false;

  let id = crew.id;
  if (id) {
    const { error } = await supabase.from("crews").update({ name }).eq("id", id);
    if (error) return fail(error.message);
    const { error: delErr } = await supabase.from("crew_members").delete().eq("crew_id", id);
    if (delErr) return fail(delErr.message);
  } else {
    const { data, error } = await supabase.from("crews").insert({ name }).select("id").single();
    if (error) return fail(error.code === "23505" ? "Bu adda briqada artıq var." : error.message);
    id = data.id;
  }
  const { error } = await supabase.from("crew_members").insert(crew.members.map((employee_id) => ({ crew_id: id!, employee_id })));
  // 0074: bir usta yalnız bir briqadada (unikal indeks). Yeni briqadanın üzvləri yazılmadısa boş briqada silinir
  if (error && !crew.id) await supabase.from("crews").delete().eq("id", id!);
  if (error) return fail(error.code === "23505" ? "Usta yalnız bir briqadada ola bilər: seçilənlərdən biri artıq başqa briqadadadır." : error.message);
  revalidate();
  toast.success(crew.id ? "Briqada yeniləndi" : "Briqada yaradıldı");
  return true;
}

export async function deleteCrew(id: number): Promise<boolean> {
  const { error } = await createClient().from("crews").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidate();
  toast.success("Briqada silindi");
  return true;
}

function fail(message: string) {
  toast.error(message);
  return false;
}
