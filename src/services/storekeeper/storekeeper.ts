import { createEmployeeAccount } from "@/actions/accounts";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text } from "@/lib/form-state";
import { toast } from "@/lib/toast";
import type { FormState } from "@/types/shared";

// Yeni depo məsulu (yalnız admin): əməkdaş kartı + giriş hesabı bir addımda. Depo məsulu usta paneli ilə daxil olur (orada Depo bölməsi).
// Hesab açılmasa, kart qalır və kartdakı açar düyməsi ilə yenidən cəhd edilir.
export async function addStorekeeper(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "full_name");
  if (!name) return { error: "Ad və soyad vacibdir." };
  if (!text(formData, "email") || !text(formData, "password")) return { error: "E-poçt və parol vacibdir (depo məsulu bununla daxil olacaq)." };

  const { data: emp, error } = await createClient().from("employees")
    .insert({ full_name: name, phone: text(formData, "phone"), position: "Depo məsulu", is_management: false, is_storekeeper: true })
    .select("id").single();
  if (error || !emp) return { error: error?.message ?? "Əlavə olunmadı." };

  const res = await createEmployeeAccount(emp.id, null, formData);
  revalidate();
  if (res?.error) return { error: `Depo məsulu əlavə olundu, amma hesab açılmadı: ${res?.error} Kartdakı açar düyməsi ilə yenidən yoxla.` };
  return { ok: true };
}

// Depo məsulunu yalnız admin təyin edir (bazada trigger yoxlayır) (bazada trigger yoxlayır)
export async function setStorekeeper(employeeId: number, value: boolean) {
  const { error } = await createClient().from("employees").update({ is_storekeeper: value }).eq("id", employeeId);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success(value ? "Depo məsulu təyin edildi" : "Depo məsulu götürüldü");
  revalidate();
}
