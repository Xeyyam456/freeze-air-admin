
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text, type FormState } from "@/lib/form-state";

function employeeFields(formData: FormData) {
  return {
    full_name: text(formData, "full_name"),
    specialty: text(formData, "specialty"),
    start_date: text(formData, "start_date"),
    phone: text(formData, "phone"),
  };
}

export async function addEmployee(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields = employeeFields(formData);
  if (!fields.full_name) return { error: "Ad və soyad vacibdir." };

  // Rəhbərlik formasında gizli "is_management" sahəsi və vəzifə var; hesabı açılanda admin yetkisi alır
  const management = formData.get("is_management") === "1";
  const supabase = createClient();
  const { error } = await supabase.from("employees").insert({
    ...fields,
    full_name: fields.full_name,
    position: management ? (text(formData, "position") ?? "Rəhbərlik") : "Usta",
    is_management: management,
  });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateEmployee(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const fields = employeeFields(formData);
  if (!fields.full_name) return { error: "Ad və soyad vacibdir." };

  const supabase = createClient();
  const position = formData.has("position") ? { position: text(formData, "position") ?? "Rəhbərlik" } : {};
  const { error } = await supabase.from("employees").update({ ...fields, ...position, full_name: fields.full_name }).eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteEmployee(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  // Ustada alət varsa (depo tarixçəsi), baza silməyə icazə vermir: əvəzinə deaktiv edirik.
  if (error?.code === "23503") {
    await supabase.from("employees").update({ is_active: false }).eq("id", id);
  }
  revalidate();
}
