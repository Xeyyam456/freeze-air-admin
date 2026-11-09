import { describe, expect, it, vi } from "vitest";
import type { Task, TasksData } from "@/types/tasks";

// Hook-un məntiqi React-sız yoxlanır: useMemo sadəcə funksiyanı çağırır
vi.mock("react", () => ({ useMemo: (f: () => unknown) => f() }));
const { useTaskGroups } = await import("@/pages/Tasks/hooks/useTaskGroups");

const task = (id: number, employee_id: number, group_id: string | null, done = false, cancelled = false) =>
  ({ id, employee_id, group_id, done, cancelled_at: cancelled ? "2026-11-09T08:00:00Z" : null }) as Task;
const emp = (id: number) => ({ id, full_name: `Usta ${id}` });

// A=1, B=2, C=3
const data = {
  employees: [emp(1), emp(2), emp(3)],
  tasks: [
    task(1, 1, null, true), task(2, 1, null), // A: iki tək tapşırıq, biri görülüb
    task(3, 2, null, false, true), // B: geri alınıb
    task(4, 1, "g1", true), task(5, 2, "g1", true), // A+B qrupu, görülüb
    task(6, 1, "g2"), task(7, 2, "g2", false, true), task(8, 3, "g2"), // A+C (B geri alınıb)
    task(9, 2, "g3", false, true), task(10, 3, "g3", false, true), // hamısı geri alınıb
    task(11, 1, "g4"), task(12, 2, "g4"), // A+B ikinci qrup
  ],
} as unknown as TasksData;

describe("useTaskGroups — admin Tapşırıqlar", () => {
  const r = useTaskGroups(data);

  it("qrup bir tapşırıq sayılır, geri alınanlar saya düşmür", () => {
    expect(r.single.map((t) => t.id)).toEqual([1, 2]);
    expect(r.liveTeams.map((g) => g.id)).toEqual(["g1", "g2", "g4"]);
    expect(r.total).toBe(5);
  });

  it("görülən: tək tapşırıq + bütün canlı üzvləri görmüş qrup", () => {
    expect(r.doneCount).toBe(2); // t1 + g1
  });

  it("ustaların tək tapşırıqları (geri alınan tarixçə kimi qalır)", () => {
    expect(r.groups.map((g) => [g.employee.id, g.items.map((t) => t.id)])).toEqual([[1, [1, 2]], [2, [3]]]);
  });

  it("qrupda geri alınan üzv live-a düşmür, rows-da qalır", () => {
    const g2 = r.teams.find((g) => g.id === "g2")!;
    expect([g2.rows.length, g2.live.map((t) => t.employee_id)]).toEqual([3, [1, 3]]);
  });

  it("eyni üzvlü qruplar bir seçimdir; hamısı geri alınıbsa əvvəlki üzvlərlə", () => {
    expect(r.crewsView.map((c) => [c.key, c.items.map((g) => g.id)])).toEqual([["1-2", ["g1", "g4"]], ["1-3", ["g2"]], ["2-3", ["g3"]]]);
  });

  it("üzvlər rəqəm kimi sıralanır (9-10, 10-9 yox)", () => {
    const d = { employees: [], tasks: [task(1, 10, "x"), task(2, 9, "x")] } as unknown as TasksData;
    expect(useTaskGroups(d).crewsView[0]).toMatchObject({ key: "9-10", ids: [9, 10] });
  });

  it("məlumat yoxdursa boş", () => {
    expect(useTaskGroups(null)).toMatchObject({ groups: [], teams: [], total: 0, doneCount: 0 });
  });
});
