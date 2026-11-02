import type { LogPerson } from "@/types/workLogs";

// Qrup işi (0071) bir işdir; xəritəni services/jobs/fetchGroupMap verir. Eyni qrupun işləri bir açardır
export const jobKey = (id: number, groups: Map<number, string> | null | undefined) => groups?.get(id) ?? `l${id}`;

// Qrup işi bir say olmaqla iş sayı
export const countJobs = (logs: { id: number }[], groups: Map<number, string> | null | undefined) =>
  new Set(logs.map((l) => jobKey(l.id, groups))).size;

// Admin siyahılarında qrup işi BİR sətirdir: üzvlərin adları birləşir ("Xəyyam + Fərhad"), şəkil birincinindir.
// Sıra birinci qeydin yerini saxlayır. Ustanın öz hesabında (web) hər üzv öz işini görür, bura aid deyil.
export function mergeGroupLogs<T extends { id: number; employees: LogPerson }>(logs: T[], groups: Map<number, string> | null | undefined): T[] {
  if (!groups?.size) return logs;
  const out: T[] = [];
  const at = new Map<string, number>();
  for (const l of logs) {
    const g = groups.get(l.id);
    if (!g) { out.push(l); continue; }
    const i = at.get(g);
    if (i === undefined) { at.set(g, out.length); out.push(l); continue; }
    const first = out[i];
    const name = l.employees?.full_name;
    if (first.employees && name && !first.employees.full_name.split(" + ").includes(name)) {
      out[i] = { ...first, employees: { ...first.employees, full_name: `${first.employees.full_name} + ${name}` } };
    }
  }
  return out;
}
