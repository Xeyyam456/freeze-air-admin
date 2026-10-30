import { createClient } from "@/lib/supabase/client";
import type { AttendanceEmployee } from "@/types/attendance";

// Davamiyyət cədvəlinin ustaları (aktiv, rəhbərlik yox)
export async function fetchAttendanceEmployees() {
  const { data } = await createClient().from("employees").select("id, full_name, photo_url, specialty").eq("is_management", false).eq("is_active", true).order("full_name");
  return (data ?? []) as AttendanceEmployee[];
}
