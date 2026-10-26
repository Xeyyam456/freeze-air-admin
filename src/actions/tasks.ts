import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Tapşırıqlar: admin və rəhbərlik yalnız VERİR və GERİ ALIR (migrasiya 0057). "Görüldü" işarəsini yalnız usta qoyur,
// silmək yoxdur: geri alınan tapşırıq tarixçədə qalır, istəsən başqa ustaya verilir. Xəta mətnləri bazadan gəlir.

export type TaskInput = {
  employee_ids: number[]; // bir neçə usta = qrup tapşırığı (hər üzvə ayrı sətir, eyni group_id; 0071)
  task_date: string;
  store_id: number | null;
  company_id: number | null;
  place_text: string | null;
  reason: string;
};

export async function addTask({ employee_ids, ...input }: TaskInput): Promise<boolean> {
  const group_id = employee_ids.length > 1 ? crypto.randomUUID() : null;
  const rows = employee_ids.map((employee_id) => ({ ...input, employee_id, group_id, reason: input.reason.trim() }));
  const { error } = await createClient().from("tasks").insert(rows);
  if (error) {
    toast.error(error.message);
    return false;
  }
  revalidate();
  toast.success(rows.length > 1 ? `Tapşırıq ${rows.length} nəfərlik qrupa verildi` : "Tapşırıq verildi");
  return true;
}

// Geri al; newEmployeeId verilsə eyni yer və səbəblə həmin ustaya yeni tapşırıq yaranır
export async function withdrawTask(id: number, newEmployeeId: number | null, quiet = false): Promise<boolean> {
  const { error } = await createClient().rpc("task_withdraw", { p_task_id: id, ...(newEmployeeId ? { p_new_employee_id: newEmployeeId } : {}) });
  if (error) {
    toast.error(error.message);
    return false;
  }
  if (quiet) return true;
  revalidate();
  toast.success(newEmployeeId ? "Tapşırıq geri alındı və başqa ustaya verildi" : "Tapşırıq geri alındı");
  return true;
}

// Qrupa sonradan usta əlavə et (0073): tək tapşırıq qrupa çevrilir; keçmiş, görülmüş tapşırıqda və təkrar usta bazada bloklanır
export async function addTaskMember(taskId: number, employeeId: number): Promise<boolean> {
  const { error } = await createClient().rpc("task_add_member", { p_task_id: taskId, p_employee_id: employeeId });
  if (error) {
    toast.error(error.message);
    return false;
  }
  revalidate();
  toast.success("Usta qrupa əlavə edildi");
  return true;
}
