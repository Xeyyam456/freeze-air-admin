type Person = { id: number; full_name: string; photo_url: string | null; specialty: string | null };
type TodayLog = { id: number; employee_id: number };

// "Ustalar bu gün" kartları: tək işləyən öz kartında; qrupla işləyənlər (eyni tapşırıq) bir qrup kartında, qrupun işi bir say.
// Ən çox iş görən yuxarıda.
export function crewCards<E extends Person>(masters: E[], employees: E[], todayLogs: TodayLog[], groups: Map<number, string>) {
  const soloCount: Record<number, number> = {};
  const groupMembers = new Map<string, Set<number>>();
  for (const l of todayLogs) {
    const g = groups.get(l.id);
    if (!g) { soloCount[l.employee_id] = (soloCount[l.employee_id] ?? 0) + 1; continue; }
    groupMembers.set(g, (groupMembers.get(g) ?? new Set<number>()).add(l.employee_id));
  }
  const crews = new Map<string, { ids: number[]; n: number }>();
  for (const set of groupMembers.values()) {
    const ids = [...set].sort((x, y) => x - y);
    const key = ids.join("-");
    const c = crews.get(key);
    if (c) c.n += 1; else crews.set(key, { ids, n: 1 });
  }
  const inCrew = new Set([...crews.values()].flatMap((c) => c.ids));
  return [
    ...masters.filter((m) => !inCrew.has(m.id) || soloCount[m.id]).map((m) => ({ key: `m${m.id}`, members: [m], n: soloCount[m.id] ?? 0 })),
    ...[...crews].map(([key, c]) => ({ key: `g${key}`, members: c.ids.map((id) => employees.find((e) => e.id === id)).filter((e): e is E => !!e), n: c.n })),
  ].sort((a, b) => b.n - a.n);
}
