
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { parseCoordinates } from "@/lib/navigation";
import { dbError, text, type FormState } from "@/lib/form-state";

export type StoreInput = {
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
};

function storeFields(formData: FormData): { error: string } | { data: StoreInput & { company_id: number } } {
  const companyId = Number(formData.get("company_id"));
  if (!companyId) return { error: "Şirkət və ya market seçilməyib." };

  const code = text(formData, "code");
  const name = text(formData, "name");
  if (!code || !name) return { error: "Kod və ad vacibdir." };

  const coordsInput = text(formData, "coords");
  const coords = coordsInput ? parseCoordinates(coordsInput) : null;
  if (coordsInput && !coords) {
    return { error: "Koordinat formatı səhvdir. Nümunə: 40.40930, 49.86710" };
  }

  return {
    data: {
      company_id: companyId,
      code,
      name,
      address: text(formData, "address"),
      phone: text(formData, "phone"),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    },
  };
}

export async function addStore(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = storeFields(formData);
  if ("error" in parsed) return parsed;

  const supabase = createClient();
  const { error } = await supabase.from("stores").insert(parsed.data);
  if (error) return dbError(error, `"${parsed.data.code}" kodu bu siyahıda artıq var.`);
  revalidate();
  return { ok: true };
}

// Şirkət də dəyişə bilər: mağazanı başqa şirkətə keçirmək üçün.
export async function updateStore(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = storeFields(formData);
  if ("error" in parsed) return parsed;

  const supabase = createClient();
  const { error } = await supabase.from("stores").update(parsed.data).eq("id", id);
  if (error) return dbError(error, `"${parsed.data.code}" kodu bu siyahıda artıq var.`);
  revalidate();
  return { ok: true };
}

export async function deleteStore(id: number) {
  const supabase = createClient();
  await supabase.from("stores").delete().eq("id", id);
  revalidate();
}

// Excel-dən toplu yükləmə: eyni kodlu mağaza varsa yenilənir, yoxdursa əlavə olunur.
export async function importStores(companyId: number, rows: StoreInput[]): Promise<FormState> {
  if (!companyId) return { error: "Şirkət və ya market seçilməyib." };
  const clean = rows.filter((r) => r.code?.trim() && r.name?.trim());
  if (clean.length === 0) return { error: "Yüklənəcək düzgün sətir yoxdur." };

  const supabase = createClient();
  const { error } = await supabase
    .from("stores")
    .upsert(clean.map((r) => ({ ...r, company_id: companyId })), { onConflict: "company_id,code" });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
