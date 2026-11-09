import { describe, expect, it } from "vitest";
import { groupByMonth } from "@/pages/Leaves/utils/groupByMonth";
import { leavesView } from "@/pages/Leaves/utils/leavesView";
import { stamp } from "@/pages/Leaves/utils/stamp";
import { statusOf } from "@/pages/Leaves/utils/statusOf";
import type { LeaveRow } from "@/types/leaves";

const TODAY = "2026-11-09";
const leave = (id: number, employee_id: number, date_from: string, date_to: string, status: string, full_name: string | null = `Usta ${employee_id}`) =>
  ({ id, employee_id, date_from, date_to, status, employees: full_name ? { full_name, photo_url: null } : null }) as LeaveRow;

describe("leavesView — admin İcazələr", () => {
  const all = [
    leave(1, 1, "2026-11-20", "2026-11-21", "pending", "Şahin"),
    leave(2, 2, "2026-11-12", "2026-11-12", "pending", "Cavid"),
    leave(3, 3, "2026-11-08", "2026-11-10", "approved", "Əli"), // bu gün icazədədir
    leave(4, 1, "2026-11-25", "2026-11-26", "approved", "Şahin"), // qarşıdakı
    leave(5, 1, "2026-11-15", "2026-11-15", "approved", "Şahin"),
    leave(6, 2, "2026-10-01", "2026-10-02", "approved", "Cavid"), // keçmiş → tarixçə
    leave(7, 3, "2026-11-01", "2026-11-02", "rejected", "Əli"),
    leave(8, 2, "2025-12-29", "2026-01-03", "approved", "Cavid"), // ilin sərhədi
  ];
  const v = leavesView(all, TODAY);

  it("gözləyənlər, bu gün, qarşıdakılar (tarixə görə), tarixçə", () => {
    expect(v.pending.map((l) => l.id)).toEqual([2, 1]);
    expect(v.now.map((l) => l.id)).toEqual([3]);
    expect(v.upcoming.map((l) => l.id)).toEqual([5, 4]);
    expect(v.history.map((l) => l.id)).toEqual([6, 7, 8]);
  });

  it("bu ilin təsdiqli icazə günləri ustaya görə (bazar və keçən il sayılmır)", () => {
    // Şahin: 25–26 (2) + 15 bazardır (0) = 2; Cavid: 1–2 okt (2) + 1–3 yan 2026 (C.a, C, Ş → 3; 29–31 dek 2025 sayılmır) = 5; Əli: 8 bazar, 9, 10 = 2
    expect(Object.fromEntries(v.yearDays)).toEqual({ 1: 2, 2: 5, 3: 2 });
  });

  it("süzgəc üçün ustalar Azərbaycan əlifbası ilə (C < Ə < Ş)", () => {
    expect(v.people.map((p) => p.full_name)).toEqual(["Cavid", "Əli", "Şahin"]);
  });

  it("ustası silinmiş sorğu \"?\" kimi", () => {
    expect(leavesView([leave(1, 9, TODAY, TODAY, "pending", null)], TODAY).people[0]).toEqual({ id: 9, full_name: "?", photo_url: null });
  });
});

describe("kiçik köməkçilər", () => {
  it("groupByMonth: yeni ay yuxarıda", () => {
    const g = groupByMonth([leave(1, 1, "2026-10-05", "2026-10-05", "approved"), leave(2, 1, "2026-11-01", "2026-11-01", "approved"), leave(3, 1, "2026-10-20", "2026-10-20", "approved")]);
    expect(g.map(([m, l]) => [m, l.map((x) => x.id)])).toEqual([["2026-11", [2]], ["2026-10", [3, 1]]]);
  });

  it("stamp: Bakı vaxtı ilə", () => {
    expect(stamp("2026-10-21T14:41:00Z")).toBe("21.10.2026 18:41");
    expect(stamp("2026-12-31T20:05:00Z")).toBe("01.01.2027 00:05");
  });

  it("statusOf: naməlum status → Gözləyir", () => {
    expect([statusOf("approved").text, statusOf("cancelled").text, statusOf("xyz").text]).toEqual(["Təsdiqləndi", "Usta ləğv etdi", "Gözləyir"]);
  });
});
