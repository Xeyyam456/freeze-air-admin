import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { ErrorCodeRowInput, ImportResult } from "@/types/errorCodes";

const key = (s: string) => s.trim().toLowerCase();

// Excel-dən toplu yükləmə. Faylda model adı var: yoxdursa model avtomatik yaradılır.
// Eyni model + kod varsa yenilənir, yoxdursa əlavə olunur.
export async function importErrorCodes(rows: ErrorCodeRowInput[]): Promise<ImportResult> {
  const supabase = createClient();
  const fail = (error: string, added = 0) => ({ error, added, updated: 0, models: 0 });

  const { data: existingModels, error: mErr } = await supabase.from("ac_models").select("id, name");
  if (mErr) return fail(mErr.message);
  const modelIds = new Map((existingModels ?? []).map((m) => [key(m.name), m.id]));

  // Çatışmayan modelləri yarat
  const missing = [...new Map(rows.filter((r) => !modelIds.has(key(r.model))).map((r) => [key(r.model), r.model.trim()])).values()];
  if (missing.length) {
    const { data: created, error } = await supabase.from("ac_models").insert(missing.map((name) => ({ name }))).select("id, name");
    if (error) return fail(error.message);
    for (const m of created ?? []) modelIds.set(key(m.name), m.id);
  }

  const { data: existing, error: cErr } = await supabase.from("ac_error_codes").select("id, model_id, code");
  if (cErr) return fail(cErr.message);
  const ids = new Map((existing ?? []).map((e) => [`${e.model_id}|${key(e.code)}`, e.id]));

  const fresh = new Map<string, { model_id: number; code: string; title: string; solution: string | null }>();
  const changed = new Map<number, { code: string; title: string; solution: string | null }>();
  for (const r of rows) {
    const model_id = modelIds.get(key(r.model))!;
    const k = `${model_id}|${key(r.code)}`;
    const row = { code: r.code, title: r.title, solution: r.solution };
    const id = ids.get(k);
    if (id) changed.set(id, row);
    else fresh.set(k, { model_id, ...row }); // faylın içində təkrar olanın sonuncusu qalır
  }

  if (fresh.size) {
    const { error } = await supabase.from("ac_error_codes").insert([...fresh.values()]);
    if (error) return fail(error.message);
  }
  for (const [id, r] of changed) {
    const { error } = await supabase.from("ac_error_codes").update(r).eq("id", id);
    if (error) return fail(error.message, fresh.size);
  }
  revalidate();
  return { added: fresh.size, updated: changed.size, models: missing.length };
}
