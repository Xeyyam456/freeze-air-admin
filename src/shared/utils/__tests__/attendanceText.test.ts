import { describe, expect, it } from "vitest";
import { durationText } from "@/shared/utils/attendance/durationText";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import { presenceText } from "@/shared/utils/attendance/presenceText";
import { sessionNo } from "@/shared/utils/attendance/sessionNo";
import { monthDays } from "@/shared/utils/monthDays";
import { timeBaku } from "@/shared/utils/timeBaku";
import type { Presence } from "@/types/attendance";

const T = (hm: string) => `2026-11-09T${hm}:00Z`; // Bakı = UTC+4
const pres = (sessions: { in: string; out: string | null }[], minutes = 0) =>
  ({ in: sessions[0].in, out: sessions.at(-1)!.out, sessions, minutes }) as Presence;

describe("timeBaku", () => {
  it("UTC → Bakı (UTC+4), gecə yarısını keçir", () => {
    expect(timeBaku(T("05:02"))).toBe("09:02");
    expect(timeBaku("2026-11-09T21:30:00Z")).toBe("01:30");
  });
});

describe("monthDays", () => {
  it("noyabr 30, fevral 28, uzun il 29", () => {
    const nov = monthDays("2026-11");
    expect([nov.length, nov[0], nov.at(-1)]).toEqual([30, "2026-11-01", "2026-11-30"]);
    expect([monthDays("2026-02").length, monthDays("2028-02").length]).toEqual([28, 29]);
  });
});

describe("leaveWorkdays — icazənin iş günləri (bazar sayılmır)", () => {
  it.each([
    ["2026-11-09", "2026-11-09", 1],
    ["2026-11-07", "2026-11-09", 2], // şənbə, bazar, bazar ertəsi
    ["2026-11-08", "2026-11-08", 0],
    ["2026-11-02", "2026-11-15", 12],
    ["2026-10-30", "2026-11-02", 3], // ay sərhədi
  ])("%s – %s → %i", (date_from, date_to, n) => {
    expect(leaveWorkdays({ date_from, date_to })).toBe(n);
  });
});

describe("yazılar", () => {
  it("leaveRange: bir gün və aralıq", () => {
    expect(leaveRange({ date_from: "2026-10-21", date_to: "2026-10-21" })).toBe("21.10");
    expect(leaveRange({ date_from: "2026-10-21", date_to: "2026-10-23" })).toBe("21.10 – 23.10");
  });

  it("sessionNo: tək seansda nömrə yoxdur", () => {
    expect([sessionNo(0, 1), sessionNo(0, 2), sessionNo(1, 2)]).toEqual(["", "1) ", "2) "]);
  });

  it("presenceText: bir seans, bir neçə seans, ayrıca sətirlər", () => {
    expect(presenceText(pres([{ in: T("05:02"), out: T("14:10") }]))).toBe("09:02 – 18:10");
    const two = pres([{ in: T("05:02"), out: T("09:00") }, { in: T("11:10"), out: null }]);
    expect(presenceText(two)).toBe("1) 09:02 – 13:00, 2) 15:10-dən");
    expect(presenceText(two, "\n")).toBe("1) 09:02 – 13:00\n2) 15:10-dən");
  });

  it("durationText", () => {
    expect(durationText(pres([{ in: T("05:00"), out: null }], 0))).toBe("");
    expect(durationText(pres([{ in: T("05:00"), out: T("14:02") }], 542))).toBe("9 saat 2 dəq");
  });
});
