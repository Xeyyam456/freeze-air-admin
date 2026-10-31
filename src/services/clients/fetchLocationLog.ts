import { createClient } from "@/lib/supabase/client";
import type { LocationLogEntry, LocationUnit } from "@/types/clients";

const SELECT = "id, place_kind, place_id, created_at, accuracy_m, old_lat, old_lng, old_address, new_lat, new_lng, new_address, employees(full_name)";

// Konum jurnalı (yalnız admin oxuyur): ustanın "Konumu düzəlt" ilə etdiyi dəyişikliklər —
// şirkətin özü (sabit məkan) və filial/mağazaları üzrə, ən yenisi yuxarıda
export async function fetchLocationLog(companyId: number, units: LocationUnit[]): Promise<LocationLogEntry[]> {
  const supabase = createClient();
  const [own, viaUnits] = await Promise.all([
    supabase.from("place_location_log").select(SELECT).eq("place_kind", "company").eq("place_id", companyId).order("created_at", { ascending: false }).limit(200),
    units.length
      ? supabase.from("place_location_log").select(SELECT).eq("place_kind", "store").in("place_id", units.map((u) => u.id)).order("created_at", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] as LocationLogEntry[] }),
  ]);
  return [...((own.data ?? []) as LocationLogEntry[]), ...((viaUnits.data ?? []) as LocationLogEntry[])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
