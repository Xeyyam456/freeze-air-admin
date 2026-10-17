import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text, type FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";

// Xəta kodları və kondisioner modelləri (yalnız admin yazır, RLS). Əvvəl modellər əlavə olunur, xəta kodu yazanda model seçilir.
// Sahələr: model (ac_models), kod (code), açıqlama (title), edilecək iş (solution).
// Təkrar yoxlaması bazadadır: eyni model adı, eyni modeldə eyni kod (böyük/kiçik hərf və boşluq nəzərə alınmır) ikinci dəfə yazılmır.

// ---------- Modellər ----------

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

// ---------- Xəta kodları ----------

export type ErrorCodeInput = { code: string; title: string; solution: string | null };

function fieldsOf(formData: FormData) {
  return {
    model_id: Number(formData.get("model_id") || 0),
    code: text(formData, "code") ?? "",
    title: text(formData, "title") ?? "",
    solution: text(formData, "solution"),
  };
}

function checkFields(f: ReturnType<typeof fieldsOf>): string | null {
  if (!f.model_id) return "Modeli seç.";
  if (!f.code) return "Xəta kodu vacibdir.";
  if (!f.title) return "Açıqlama vacibdir.";
  return null;
}

const codeDup = "Bu modeldə bu kodla xəta artıq var.";

export async function addErrorCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const f = fieldsOf(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("ac_error_codes").insert(f);
  if (error) return { error: error.code === "23505" ? codeDup : error.message };
  revalidate();
  return { ok: true };
}

export async function updateErrorCode(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const f = fieldsOf(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("ac_error_codes").update(f).eq("id", id);
  if (error) return { error: error.code === "23505" ? codeDup : error.message };
  revalidate();
  return { ok: true };
}

export async function deleteErrorCode(id: number) {
  const { error } = await createClient().from("ac_error_codes").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  revalidate();
  toast.success("Xəta kodu silindi");
}

// ---------- Excel-dən toplu yükləmə ----------

const norm = (s: string) => s.trim().toLowerCase();

// Faylda model adı var: yoxdursa model avtomatik yaradılır. Eyni model + kod varsa yenilənir, yoxdursa əlavə olunur.
export async function importErrorCodes(rows: (ErrorCodeInput & { model: string })[]): Promise<{ error?: string; added: number; updated: number; models: number }> {
  const supabase = createClient();
  const fail = (error: string, added = 0) => ({ error, added, updated: 0, models: 0 });

  const { data: existingModels, error: mErr } = await supabase.from("ac_models").select("id, name");
  if (mErr) return fail(mErr.message);
  const modelIds = new Map((existingModels ?? []).map((m) => [norm(m.name), m.id]));

  // Çatışmayan modelləri yarat
  const missing = [...new Map(rows.filter((r) => !modelIds.has(norm(r.model))).map((r) => [norm(r.model), r.model.trim()])).values()];
  if (missing.length) {
    const { data: created, error } = await supabase.from("ac_models").insert(missing.map((name) => ({ name }))).select("id, name");
    if (error) return fail(error.message);
    for (const m of created ?? []) modelIds.set(norm(m.name), m.id);
  }

  const { data: existing, error: cErr } = await supabase.from("ac_error_codes").select("id, model_id, code");
  if (cErr) return fail(cErr.message);
  const ids = new Map((existing ?? []).map((e) => [`${e.model_id}|${norm(e.code)}`, e.id]));

  const fresh = new Map<string, { model_id: number; code: string; title: string; solution: string | null }>();
  const changed = new Map<number, { code: string; title: string; solution: string | null }>();
  for (const r of rows) {
    const model_id = modelIds.get(norm(r.model))!;
    const k = `${model_id}|${norm(r.code)}`;
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
