import { useMemo } from "react";
import type { CrewGroup, Task, TasksData, TaskTeam } from "@/types/tasks";

// Siyahının qrupları: ustalara görə tək tapşırıqlar, qrup tapşırıqları (0071), eyni üzvlü qruplar, saylar
export function useTaskGroups(data: TasksData | null) {
  const groups = useMemo(() => {
    if (!data) return [];
    return data.employees
      .map((e) => ({ employee: e, items: data.tasks.filter((t) => t.employee_id === e.id && !t.group_id) }))
      .filter((g) => g.items.length > 0);
  }, [data]);
  // Qrup tapşırıqları (0071): bir group_id = bir tapşırıq; üzvlər birlikdə göstərilir (geri alınan üzv üstüxətli qalır)
  const teams = useMemo<TaskTeam[]>(() => {
    const map = new Map<string, Task[]>();
    for (const t of data?.tasks ?? []) if (t.group_id) map.set(t.group_id, [...(map.get(t.group_id) ?? []), t]);
    return [...map].map(([id, rows]) => ({ id, rows, live: rows.filter((t) => !t.cancelled_at) }));
  }, [data]);
  // Eyni üzvlərdən ibarət qruplar bir seçimdir (Xəyyam + Fərhad: 5 iş)
  const crewsView = useMemo<CrewGroup[]>(() => {
    const map = new Map<string, TaskTeam[]>();
    for (const g of teams) {
      const ids = [...new Set((g.live.length ? g.live : g.rows).map((r) => r.employee_id))].sort((x, y) => x - y);
      const key = ids.join("-");
      map.set(key, [...(map.get(key) ?? []), g]);
    }
    return [...map].map(([key, items]) => ({ key, items, ids: key.split("-").map(Number) }));
  }, [teams]);
  // Saylar: qrup bir tapşırıq sayılır; geri alınanlar saya düşmür (siyahıda tarixçə kimi qalır)
  const single = data?.tasks.filter((t) => !t.group_id && !t.cancelled_at) ?? [];
  const liveTeams = teams.filter((g) => g.live.length > 0);
  return {
    groups, teams, crewsView, single, liveTeams,
    total: single.length + liveTeams.length,
    doneCount: single.filter((t) => t.done).length + liveTeams.filter((g) => g.live.every((t) => t.done)).length,
  };
}
