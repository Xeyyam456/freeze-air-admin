import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

// Tapşırıqlar: yaratmaq və silmək yalnız admin və rəhbərlik (RLS: is_admin()); "görüldü" işarəsini usta yalnız öz
// tapşırığında dəyişir (bazadakı tətikçi başqa sahələrə toxunmağa icazə vermir). Xəta mətnləri bazadan gəlir.

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

export async function toggleTask(id: number, done: boolean) {
  const { error } = await createClient().from("tasks").update({ done }).eq("id", id);
  if (error) toast.error(error.message);
  revalidate();
}

export async function deleteTask(id: number) {
  const { error } = await createClient().from("tasks").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  revalidate();
  toast.success("Tapşırıq silindi");
}
