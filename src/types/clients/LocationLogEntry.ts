// Konum jurnalı sətri (0087 place_location_log; yalnız admin oxuyur)
export type LocationLogEntry = {
  id: number; place_kind: string; place_id: number; created_at: string; accuracy_m: number | null;
  old_lat: number | null; old_lng: number | null; old_address: string | null;
  new_lat: number | null; new_lng: number | null; new_address: string | null;
  employees: { full_name: string } | null;
};
