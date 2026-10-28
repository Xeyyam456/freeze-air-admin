import { createClient } from "@/lib/supabase/client";
import type { DepotData, DepotRequest, Holding, Loss, Piece, Repair, Tool } from "@/types/depot";

// Depo ekranının bütün məlumatı bir dəfəyə (paralel sorğular)
export async function fetchDepot(): Promise<DepotData> {
  const supabase = createClient();
  const [{ data: tools }, { data: holdings }, { data: employees }, { data: pieces }, { data: requests }, { data: repairs }, { data: losses }] = await Promise.all([
    // Anbar vəziyyəti: ümumi say, ustalarda, təmirdə, depoda qalan (view tool_stock)
    supabase.from("tool_stock").select("*").order("name"),
    // Hazırda ustalarda olanlar (qaytarılmamış); received_at/disputed_at: ustanın "Aldım / Almadım" cavabı
    supabase.from("tool_assignments")
      .select("id, tool_id, employee_id, quantity, taken_at, received_at, disputed_at, employees(full_name, photo_url)")
      .is("returned_at", null)
      .order("taken_at"),
    supabase.from("employees")
      .select("id, full_name, photo_url, position, is_management, is_storekeeper, user_id")
      .eq("is_active", true)
      .order("full_name"),
    // Depodakı material parçaları / açıq balonlar
    supabase.from("material_pieces").select("id, tool_id, length, original_length, created_at, employees(full_name)").order("created_at"),
    // Təsdiq gözləyən sənədlər (0084)
    supabase.from("depot_requests").select("*").eq("status", "pending").order("created_at"),
    supabase.from("tool_repairs").select("*").is("returned_at", null).order("sent_at"),
    // Təsdiqlənmiş silinmələr (xarab, itib, oğurlanıb; "sərf olunub" yox): siyahıda və alət pəncərəsində səbəb göstərilir
    supabase.from("depot_requests").select("tool_id, quantity, reason, note, decided_at").eq("type", "writeoff").eq("status", "approved").neq("reason", "used").order("decided_at", { ascending: false }),
  ]);
  return {
    tools: (tools ?? []) as Tool[], holdings: (holdings ?? []) as Holding[], pieces: (pieces ?? []) as Piece[], employees: employees ?? [],
    requests: (requests ?? []) as DepotRequest[], repairs: (repairs ?? []) as Repair[], losses: (losses ?? []) as Loss[],
  };
}
