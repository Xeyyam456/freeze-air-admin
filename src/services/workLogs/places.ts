import { createClient } from "@/lib/supabase/client";
import { norm } from "@/shared/utils/norm";
import type { Place } from "@/types/workLogs";

// Bütün yerlər: əvvəl sabit məkanlı şirkətlər, sonra hər şəbəkənin mağazaları koda görə
export async function loadPlaces(): Promise<Place[]> {
  const supabase = createClient();
  const [{ data: stores }, { data: companies }] = await Promise.all([
    supabase.from("stores").select("id, code, name, address, companies(name)"),
    supabase.from("companies").select("id, name, address, stores(count)").eq("kind", "company").order("name"),
  ]);

  // Filialı olmayan şirkətlər özü yerdir (stadion, Port Baku)
  const fixed: Place[] = (companies ?? [])
    .filter((c) => (c.stores[0]?.count ?? 0) === 0)
    .map((c) => ({
      key: `c${c.id}`, storeId: null, companyId: c.id, custom: null,
      group: "Sabit məkanlar", label: c.name, sub: c.address ?? "",
      search: norm(`${c.name} ${c.address}`),
    }));

  const fromStores: Place[] = (stores ?? [])
    .map((s) => {
      const owner = s.companies?.name ?? "";
      return {
        key: `s${s.id}`, storeId: s.id, companyId: null, custom: null,
        group: owner, label: `${s.code} ${s.name}`, sub: s.address ?? "",
        search: norm(`${owner} ${s.code} ${s.name} ${s.address}`),
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group, "az") || a.label.localeCompare(b.label, "az", { numeric: true }));

  return [...fixed, ...fromStores];
}
