import { text } from "@/lib/form-state";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { FormState } from "@/types/shared";

// Usta hesabları Supabase Edge Function ("admin-accounts") ilə idarə olunur:
// gizli açar orada, serverdədir; funksiya çağıranın admin olduğunu özü yoxlayır.
async function call(body: Record<string, unknown>): Promise<{ error?: string; ok?: boolean; emails?: Record<number, string> }> {
  const { data, error } = await createClient().functions.invoke("admin-accounts", { body });
  if (error) return { error: "Hesab xidmətinə qoşulmaq olmadı. Bir az sonra yenidən yoxla." };
  return data;
}

// Usta id → e-poçt (yalnız admin üçün)
export async function listAccountEmails(): Promise<Record<number, string> | null> {
  const res = await call({ action: "list_emails" });
  return res.error ? null : (res.emails ?? {});
}

export async function createEmployeeAccount(employeeId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const res = await call({ action: "create", employeeId, email: text(formData, "email"), password: text(formData, "password") });
  if (res.error) return { error: res.error };
  revalidate();
  return { ok: true };
}

export async function resetEmployeePassword(employeeId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const res = await call({ action: "reset_password", employeeId, password: text(formData, "password") });
  return res.error ? { error: res.error } : { ok: true };
}

export async function deleteEmployeeAccount(employeeId: number) {
  await call({ action: "delete", employeeId });
  revalidate();
}
