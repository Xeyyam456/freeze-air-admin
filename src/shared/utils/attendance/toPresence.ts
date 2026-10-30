import type { AttRow, Presence } from "@/types/attendance";

// Gündə bir neçə seans (0066): in = ilk gəlmə, out = son getmə (açıq seans varsa null), minutes = bağlanmış seansların cəmi
export function toPresence(rows: AttRow[]) {
  const map = new Map<string, Presence>();
  for (const a of [...rows].sort((x, y) => x.checked_in_at.localeCompare(y.checked_in_at))) {
    const p = map.get(a.day) ?? { in: a.checked_in_at, out: null, sessions: [], minutes: 0 };
    p.sessions.push({ in: a.checked_in_at, out: a.checked_out_at });
    if (a.checked_out_at) p.minutes += Math.max(0, Math.round((new Date(a.checked_out_at).getTime() - new Date(a.checked_in_at).getTime()) / 60000));
    p.out = p.sessions.every((s) => s.out) ? a.checked_out_at : null;
    map.set(a.day, p);
  }
  return map;
}
