import { formatDateAz } from "@/components/DatePicker";
import { fetchFileCounts, fetchGroupMap, mergeGroupLogs } from "@/lib/jobs";
import { useData } from "@/lib/useData";
import { fetchAllLogs } from "@/services/dashboard/fetchAllLogs";
import { norm } from "@/shared/utils/norm";
import type { AllLog } from "@/types/dashboard";
import { allPlaceOf } from "../utils/allLogs";

// Yerli tarix "YYYY-MM-DD"; offset gün qədər geri
function localDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Bütün iş qeydləri: son 300, qrup işi bir sətir, fayl sayları; axtarışa görə süzülüb günlərə bölünür
export function useAllLogs(query: string) {
  const logs = useData("all-logs", fetchAllLogs);
  // Qrup xəritəsi yalnız yüklənmiş işlərin dövrü üçün (əvvəl bütün tarixçə yüklənirdi)
  const oldest = logs?.at(-1)?.work_date ?? null;
  const groupMap = useData("group-map-all", () => (oldest ? fetchGroupMap(oldest) : Promise.resolve(new Map<number, string>())), [oldest]);
  const logIds = (logs ?? []).map((l) => l.id);
  const files = useData("file-counts-all", () => fetchFileCounts(logIds), [logIds.join()]); // ▶ Video / şəkil / akt (qrup üzrə)

  const q = norm(query.trim());
  const list = mergeGroupLogs(logs ?? [], groupMap).filter((l) => !q || [l.employees?.full_name, allPlaceOf(l), l.description].some((v) => norm(v).includes(q)));
  const groups: { day: string; items: AllLog[] }[] = [];
  for (const l of list) {
    const last = groups.at(-1);
    if (last?.day === l.work_date) last.items.push(l);
    else groups.push({ day: l.work_date, items: [l] });
  }
  const dayLabel = (day: string) => (day === localDate() ? "Bu gün" : day === localDate(-1) ? "Dünən" : formatDateAz(day));
  return { logs, files, q, list, groups, dayLabel };
}
