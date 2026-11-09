import { describe, expect, it } from "vitest";
import { ATTENDANCE_START } from "@/shared/utils/attendance/constants";
import { dayStatus } from "@/shared/utils/attendance/dayStatus";
import { isWorkday } from "@/shared/utils/attendance/isWorkday";
import { summarize } from "@/shared/utils/attendance/summarize";
import { toPresence } from "@/shared/utils/attendance/toPresence";
import type { AttRow, Leave } from "@/types/attendance";

// 2026-11-09 bazar ertəsidir; 2026-11-01 və 2026-11-08 bazardır
const TODAY = "2026-11-09";
const row = (day: string, from: string, to: string | null) =>
  ({ employee_id: 1, day, checked_in_at: `${day}T${from}:00Z`, checked_out_at: to ? `${day}T${to}:00Z` : null }) as AttRow;
const leave = (from: string, to: string, status = "approved") =>
  ({ id: 1, employee_id: 1, date_from: from, date_to: to, status }) as Leave;

describe("isWorkday", () => {
  it("bazar iş günü deyil, şənbə iş günüdür", () => {
    expect([isWorkday("2026-11-08"), isWorkday("2026-11-07"), isWorkday(TODAY)]).toEqual([false, true, true]);
  });
});

describe("toPresence", () => {
  it("iki seans: ilk gəlmə, son getmə, dəqiqə cəmi; açıq seansda getmə yoxdur", () => {
    const closed = toPresence([row(TODAY, "09:00", "14:30"), row(TODAY, "05:00", "08:00")]).get(TODAY)!;
    expect([closed.in, closed.out, closed.minutes]).toEqual([`${TODAY}T05:00:00Z`, `${TODAY}T14:30:00Z`, 510]);
    const open = toPresence([row(TODAY, "05:00", "08:00"), row(TODAY, "09:00", null)]).get(TODAY)!;
    expect([open.out, open.minutes]).toEqual([null, 180]);
  });
});

describe("dayStatus", () => {
  const pres = toPresence([row("2026-11-06", "05:00", "13:00"), row("2026-11-08", "06:00", "10:00")]);
  it.each([
    ["bazar, gəlməyib", "2026-11-01", [], [], "off"],
    ["bazar, gəlib (əlavə)", "2026-11-08", [], [], "present"],
    ["gələcək", "2026-11-10", [], [], "future"],
    ["gələcək icazə", "2026-11-10", [leave("2026-11-10", "2026-11-10")], [], "leave"],
    ["icazə işdə olmaqdan üstündür", "2026-11-06", [leave("2026-11-06", "2026-11-06")], [], "leave"],
    ["gözləyən icazə sayılmır", "2026-11-06", [leave("2026-11-06", "2026-11-06", "pending")], [], "present"],
    ["admin qeyd edib", "2026-11-05", [], ["2026-11-05"], "absent"],
    ["keçmiş, gəlməyib", "2026-11-05", [], [], "absent"],
    ["bu gün, hələ gəlməyib", TODAY, [], [], "pending"],
    ["başlanğıcdan əvvəl", "2026-09-30", [], [], "before"],
    ["başlanğıcdan əvvəl, qeydli", "2026-09-30", [], ["2026-09-30"], "absent"],
  ] as const)("%s", (_t, d, leaves, marked, want) => {
    expect(dayStatus(d, TODAY, pres, [...leaves], new Set(marked))).toBe(want);
  });
  it("ATTENDANCE_START", () => expect(ATTENDANCE_START).toBe("2026-10-01"));
});

describe("summarize", () => {
  const pres = toPresence([
    row("2026-11-01", "06:00", "10:00"),
    row("2026-11-02", "05:00", "13:00"), row("2026-11-03", "05:00", "13:00"), row("2026-11-04", "05:00", "13:00"),
  ]);
  it("bu ay: iş günü, işdə, icazəli, gəlmədi, bazar işi, bu gün", () => {
    const leaves = [leave("2026-11-05", "2026-11-06"), leave("2026-11-20", "2026-11-21", "pending")];
    expect(summarize("2026-11", TODAY, pres, leaves)).toEqual({
      workdays: 7, present: 3, leave: 2, absent: 1, extra: 1, leaveTimes: 1, pendingLeave: 1,
      today: { status: "pending", presence: null },
    });
  });
  it("ay sərhədini kəsən və gələcək icazə dəfə sayına düşür", () => {
    const s = summarize("2026-11", TODAY, pres, [leave("2026-10-30", "2026-11-02"), leave("2026-11-20", "2026-11-20")]);
    expect([s.leaveTimes, s.leave]).toEqual([2, 1]);
  });
  it("keçmiş ay (oktyabr 27 iş günü) və davamiyyətdən əvvəlki ay", () => {
    const oct = summarize("2026-10", TODAY, new Map(), []);
    expect([oct.workdays, oct.absent, oct.today.status]).toEqual([27, 27, "future"]);
    expect(summarize("2026-09", TODAY, new Map(), []).workdays).toBe(0);
  });
});
