import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Tapşırıqlar: admin və rəhbərlik yalnız VERİR və GERİ ALIR (migrasiya 0057). "Görüldü" işarəsini yalnız usta qoyur,
// silmək yoxdur: geri alınan tapşırıq tarixçədə qalır, istəsən başqa ustaya verilir. Xəta mətnləri bazadan gəlir.

export type TaskInput = {
  employee_id: number;
  task_date: string;
  store_id: number | null;
  company_id: number | null;
  place_text: string | null;
  reason: string;
};

export async function addTask(input: TaskInput): Promise<boolean> {
  const { error } = await createClient().from("tasks").insert({ ...input, reason: input.reason.trim() });
  if (error) {
    toast.error(error.message);
    return false;
  }
  revalidate();
  toast.success("Tapşırıq verildi");
  return true;
}

// Geri al; newEmployeeId verilsə eyni yer və səbəblə həmin ustaya yeni tapşırıq yaranır
export async function withdrawTask(id: number, newEmployeeId: number | null): Promise<boolean> {
  const { error } = await createClient().rpc("task_withdraw", { p_task_id: id, ...(newEmployeeId ? { p_new_employee_id: newEmployeeId } : {}) });
  if (error) {
    toast.error(error.message);
    return false;
  }
  revalidate();
  toast.success(newEmployeeId ? "Tapşırıq geri alındı və başqa ustaya verildi" : "Tapşırıq geri alındı");
  return true;
}
