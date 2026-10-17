import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text, type FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";

// Xəta kodları (yalnız admin yazır, RLS). Sahələr: model (model_series), kod (code), açıqlama (title), edilecək iş (solution).
// Təkrar yoxlaması bazadadır: eyni model + kod (böyük/kiçik hərf və boşluq nəzərə alınmır) ikinci dəfə yazılmır.

export type ErrorCodeInput = { model_series: string | null; code: string; title: string; solution: string | null };

const key = (model: string | null, code: string) => `${(model ?? "").trim().toLowerCase()}|${code.trim().toLowerCase()}`;

function fieldsOf(formData: FormData): ErrorCodeInput {
  return {
    model_series: text(formData, "model_series"),
    code: text(formData, "code") ?? "",
    title: text(formData, "title") ?? "",
    solution: text(formData, "solution"),
  };
}

function checkFields(f: ErrorCodeInput): string | null {
  if (!f.code) return "Xəta kodu vacibdir.";
  if (!f.title) return "Açıqlama vacibdir.";
  return null;
}

const dup = "Bu model və kodla xəta artıq var.";

export async function addErrorCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const f = fieldsOf(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("ac_error_codes").insert(f);
  if (error) return { error: error.code === "23505" ? dup : error.message };
  revalidate();
  return { ok: true };
}

export async function updateErrorCode(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const f = fieldsOf(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("ac_error_codes").update(f).eq("id", id);
  if (error) return { error: error.code === "23505" ? dup : error.message };
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

// Excel-dən toplu yükləmə: eyni model + kod varsa yenilənir, yoxdursa əlavə olunur
export async function importErrorCodes(rows: ErrorCodeInput[]): Promise<{ error?: string; added: number; updated: number }> {
  const supabase = createClient();
  const { data: existing, error: readError } = await supabase.from("ac_error_codes").select("id, model_series, code");
  if (readError) return { error: readError.message, added: 0, updated: 0 };

  const ids = new Map((existing ?? []).map((e) => [key(e.model_series, e.code), e.id]));
  const fresh = new Map<string, ErrorCodeInput>(); // faylın içində təkrar olanın sonuncusu qalır
  const changed = new Map<number, ErrorCodeInput>();
  for (const r of rows) {
    const k = key(r.model_series, r.code);
    const id = ids.get(k);
    if (id) changed.set(id, r);
    else fresh.set(k, r);
  }

  if (fresh.size) {
    const { error } = await supabase.from("ac_error_codes").insert([...fresh.values()]);
    if (error) return { error: error.message, added: 0, updated: 0 };
  }
  for (const [id, r] of changed) {
    const { error } = await supabase.from("ac_error_codes").update(r).eq("id", id);
    if (error) return { error: error.message, added: fresh.size, updated: 0 };
  }
  revalidate();
  return { added: fresh.size, updated: changed.size };
}
