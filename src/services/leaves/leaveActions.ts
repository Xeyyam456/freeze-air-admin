import { createClient } from "@/lib/supabase/client";

// Köhnə sorğunu silmək (0067): yalnız cavablanmış; təsdiqlənmiş icazə silinsə həmin günlər "gəlmədi" sayılır
export async function removeLeaves(ids: number[]) {
  const { error } = await createClient().from("leave_requests").delete().in("id", ids).neq("status", "pending");
  return error;
}

// Gözləyən sorğunu təsdiqlə / rədd et (baza funksiyası leave_decide)
export async function decideLeave(id: number, approve: boolean) {
  const { error } = await createClient().rpc("leave_decide", { p_id: id, p_approve: approve });
  return error;
}
