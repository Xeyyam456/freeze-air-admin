
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { dbError, text, type FormState } from "@/lib/form-state";
import { asKind, KIND } from "@/lib/kinds";
import { parseCoordinates } from "@/lib/navigation";

const BAD_COORDS = "Koordinat formatı səhvdir. Nümunə: 40.40930, 49.86710";

function companyFields(formData: FormData) {
  // Ünvan və koordinat yalnız şirkət formasında var (marketlərin ünvanı mağazalardadır)
  const coordsInput = text(formData, "coords");
  const coords = coordsInput ? parseCoordinates(coordsInput) : null;
  return {
    badCoords: !!coordsInput && !coords,
    fields: {
      name: text(formData, "name"),
      phone: text(formData, "phone"),
      contact_person: text(formData, "contact_person"),
      notes: text(formData, "notes"),
      address: text(formData, "address"),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    },
  };
}

export async function addCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  const kind = asKind(text(formData, "kind"));
  const { fields, badCoords } = companyFields(formData);
  if (!fields.name) return { error: "Ad vacibdir." };
  if (badCoords) return { error: BAD_COORDS };

  const supabase = createClient();
  const { error } = await supabase.from("companies").insert({ ...fields, name: fields.name, kind });
  if (error) return dbError(error, "Bu adda qeyd artıq var.");
  revalidate();
  return { ok: true };
}

export async function updateCompany(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const { fields, badCoords } = companyFields(formData);
  if (!fields.name) return { error: "Ad vacibdir." };
  if (badCoords) return { error: BAD_COORDS };

  const supabase = createClient();
  const { error } = await supabase.from("companies").update({ ...fields, name: fields.name }).eq("id", id);
  if (error) return dbError(error, "Bu adda qeyd artıq var.");
  revalidate();
  return { ok: true };
}

// Sildikdən sonra hansı siyahıya qayıdılacağını qaytarır (şirkətlər və ya mağazalar)
export async function deleteCompany(id: number): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.from("companies").select("kind").eq("id", id).maybeSingle();
  await supabase.from("companies").delete().eq("id", id);
  revalidate();
  return KIND[asKind(data?.kind)].route;
}
