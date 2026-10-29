import type { MileageRow, TodayState } from "@/types/fuel";
import { timeBaku } from "../shared/dates";

// Bu günün hesabatının qısa vəziyyəti: yazılmayıb / açıq (yalnız səhər) / bağlı
export function todayState(r: MileageRow | undefined): TodayState {
  if (!r) return { tone: "muted", text: "Bu gün yazılmayıb" };
  if (r.end_km == null) return { tone: "open", text: `Açıqdır · səhər ${r.start_km.toLocaleString("az")} km (${timeBaku(r.start_at)})` };
  return { tone: "done", text: `${r.start_km.toLocaleString("az")} → ${r.end_km.toLocaleString("az")} km` };
}
