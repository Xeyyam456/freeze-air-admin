import { useMemo, useState } from "react";
import { jobKey, type FileCount } from "@/lib/jobs";
import type { LogDay, WorkLog } from "@/types/workLogs";

type GroupMap = Parameters<typeof jobKey>[1];

// Fayl sayları işə görə və günlərə bölünmüş siyahı (qrup işləri eyni üzvlü qrupa görə bir açılan sətirdə)
export function useLogGroups(logs: WorkLog[] | null, list: WorkLog[], groupMap: GroupMap) {
  // Faylların sayı işə görə: qrup işində fayl istənilən üzvün qeydinə yüklənə bilər, ona görə qrup üzrə toplanır
  const filesByJob = useMemo(() => {
    const m = new Map<string, FileCount>();
    for (const l of logs ?? []) {
      const k = jobKey(l.id, groupMap);
      const c = m.get(k) ?? { act: 0, photo: 0, video: 0 };
      for (const f of l.work_files) if (f.kind === "act" || f.kind === "photo" || f.kind === "video") c[f.kind] += 1;
      m.set(k, c);
    }
    return m;
  }, [logs, groupMap]);

  // Gün → tək işlər sətir kimi, qrup işləri (Tapşırıqlardakı kimi) eyni üzvlü qrupa görə bir açılan sətirdə
  const days = useMemo(() => {
    const out: LogDay[] = [];
    for (const l of list) {
      let day = out.at(-1);
      if (day?.day !== l.work_date) { day = { day: l.work_date, count: 0, entries: [] }; out.push(day); }
      day.count += 1;
      if (!groupMap?.has(l.id)) { day.entries.push({ type: "solo", log: l }); continue; }
      const names = l.employees?.full_name ?? "—";
      const key = `${l.work_date}|${names.split(" + ").sort().join("|")}`;
      const crew = day.entries.find((e) => e.type === "crew" && e.key === key);
      if (crew && crew.type === "crew") crew.logs.push(l);
      else day.entries.push({ type: "crew", key, names, logs: [l] });
    }
    return out;
  }, [list, groupMap]);

  const [openCrews, setOpenCrews] = useState<Set<string>>(new Set()); // qrup sətirləri bağlı başlayır
  const toggleCrew = (key: string) => setOpenCrews((v) => { const n = new Set(v); if (!n.delete(key)) n.add(key); return n; });

  return { days, openCrews, toggleCrew, filesOf: (l: WorkLog) => filesByJob.get(jobKey(l.id, groupMap)) };
}
