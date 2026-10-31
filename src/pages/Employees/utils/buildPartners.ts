import type { MonthLog, Partner } from "@/types/employees";

// Birlikdə işləyənlər: eyni qrup işində olan ustalar bir-birinin kartında görünür (ad + bu gün / bu ay neçə iş)
export function buildPartners(logs: MonthLog[], groups: Map<number, string>, nameOf: (id: number) => string, today: string) {
  const members = new Map<string, { ids: Set<number>; today: boolean }>();
  for (const l of logs) {
    const g = groups.get(l.id);
    if (!g) continue;
    const m = members.get(g) ?? { ids: new Set<number>(), today: false };
    m.ids.add(l.employee_id);
    if (l.work_date === today) m.today = true;
    members.set(g, m);
  }

  const partners: Record<number, Partner[]> = {};
  for (const m of members.values()) {
    if (m.ids.size < 2) continue;
    for (const id of m.ids) {
      const others = [...m.ids].filter((x) => x !== id).sort((a, b) => a - b);
      const key = others.join("-");
      const list = (partners[id] ??= []);
      const p = list.find((x) => x.key === key);
      if (p) { p.month += 1; if (m.today) p.today += 1; }
      else list.push({ key, names: others.map(nameOf).join(" + "), month: 1, today: m.today ? 1 : 0 });
    }
  }
  return partners;
}
