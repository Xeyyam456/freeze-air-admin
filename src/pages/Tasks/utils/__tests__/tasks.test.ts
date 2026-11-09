import { describe, expect, it } from "vitest";
import { mergeGroups } from "@/pages/Home/utils/mergeGroups";
import { iso, shiftDay } from "@/pages/Tasks/utils/days";
import { crewLabel, hasVideo, placeOf, teamLabel } from "@/pages/Tasks/utils/labels";
import type { SelectableEmployee } from "@/types/employees";
import type { Task, TaskEmployee } from "@/types/tasks";

const at = (p: object) => ({ stores: null, companies: null, place_text: null, ...p }) as unknown as Task;

describe("placeOf", () => {
  it("mağaza (şirkətlə) → sabit məkan → yazılan yer → silinib", () => {
    expect(placeOf(at({ stores: { code: "ARZ-045", name: "Nərimanov", companies: { name: "Araz" } } }))).toBe("Araz · ARZ-045 Nərimanov");
    expect(placeOf(at({ companies: { name: "Port Baku" } }))).toBe("Port Baku");
    expect(placeOf(at({ place_text: "Ev, Yasamal" }))).toBe("Ev, Yasamal");
    expect(placeOf(at({}))).toBe("Yer silinib");
  });
});

describe("qrup və briqada adları", () => {
  const people = [{ id: 1, full_name: "Əlizadə Xəyyam" }, { id: 2, full_name: "Məmmədov Fərhad" }] as TaskEmployee[];
  it("teamLabel: soyadsız adlar, tapılmayan —", () => {
    expect(teamLabel([1, 2], people)).toBe("Xəyyam + Fərhad");
    expect(teamLabel([1, 9], people)).toBe("Xəyyam + —");
  });
  it("crewLabel: adı varsa ad, yoxdursa üzvlər, boşdursa Adsız", () => {
    const sel = people as unknown as SelectableEmployee[];
    expect(crewLabel({ id: 1, name: "Səhər briqadası", members: [1, 2] }, sel)).toBe("Səhər briqadası");
    expect(crewLabel({ id: 1, name: null, members: [1, 2] }, sel)).toBe("Xəyyam + Fərhad");
    expect(crewLabel({ id: 1, name: null, members: [] }, [])).toBe("Adsız briqada");
  });
  it("hasVideo", () => {
    const withFiles = (...kinds: string[]) => ({ work_logs: { work_files: kinds.map((kind) => ({ kind })) } }) as unknown as Task;
    expect(hasVideo([withFiles("photo"), withFiles("act", "video")])).toBe(true);
    expect(hasVideo([withFiles("photo"), { work_logs: null } as unknown as Task])).toBe(false);
  });
});

describe("günlər (TZ=Asia/Baku)", () => {
  it("shiftDay: ay və il sərhədi, fevral", () => {
    expect(shiftDay("2026-10-31", 1)).toBe("2026-11-01");
    expect(shiftDay("2027-01-01", -1)).toBe("2026-12-31");
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("iso: yerli tarix", () => expect(iso(new Date(2026, 10, 9))).toBe("2026-11-09"));
});

describe("mergeGroups — Panel: qrup tapşırığı bir sətir", () => {
  it("eyni group_id birləşir, adlar və şəkillər toplanır, sıra saxlanır", () => {
    const row = (id: number, group_id: string | null, full_name: string | null) =>
      ({ id, group_id, employees: full_name ? { full_name, photo_url: null } : null });
    const out = mergeGroups([row(1, "g", "Xəyyam"), row(2, null, "Fərhad"), row(3, "g", "Anar"), row(4, null, null)]);
    expect(out.map((r) => [r.id, r.names])).toEqual([[1, ["Xəyyam", "Anar"]], [2, ["Fərhad"]], [4, ["—"]]]);
    expect(out[0].people).toHaveLength(2);
  });
});
