import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDate } from "@/shared/utils/formatDate";
import { formatDateAz } from "@/shared/utils/formatDateAz";
import { formatTime } from "@/shared/utils/formatDateTime";
import { iso } from "@/shared/utils/isoDate";
import { localDate } from "@/shared/utils/localDate";
import { shiftMonth } from "@/shared/utils/shiftMonth";
import { timeBaku } from "@/shared/utils/timeBaku";
import { todayBaku } from "@/shared/utils/todayBaku";

// Bakı = UTC+4, yay saatı yoxdur. Testlər TZ=Asia/Baku ilə işləyir (vitest.config)
afterEach(() => vi.useRealTimers());
const at = (isoUtc: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoUtc));
};

describe("todayBaku — gecə yarısı sərhədi", () => {
  it.each([
    ["2026-11-08T19:59:00Z", "2026-11-08"], // Bakıda 23:59
    ["2026-11-08T20:00:00Z", "2026-11-09"], // Bakıda 00:00
    ["2026-12-31T20:30:00Z", "2027-01-01"], // il dəyişir
    ["2026-07-01T10:00:00Z", "2026-07-01"], // yayda da +4 (yay saatı yoxdur)
  ])("%s → %s", (now, want) => {
    at(now);
    expect(todayBaku()).toBe(want);
  });
});

describe("timeBaku", () => {
  it.each([
    ["2026-11-09T05:02:00Z", "09:02"],
    ["2026-11-09T20:00:00Z", "00:00"],
    ["2026-11-09T21:30:00Z", "01:30"],
    ["2026-06-15T05:02:00Z", "09:02"],
  ])("%s → %s", (t, want) => expect(timeBaku(t)).toBe(want));
});

describe("brauzerin yerli tarixi (Bakı)", () => {
  it("localDate: UTC 20:30 Bakıda artıq ertəsi gündür", () => {
    expect(localDate(new Date("2026-11-08T20:30:00Z"))).toBe("2026-11-09");
    expect(localDate(new Date("2026-11-08T19:30:00Z"))).toBe("2026-11-08");
  });
  it("formatTime: \"16.10.2026 18:41\"", () => {
    expect(formatTime("2026-10-16T14:41:00Z")).toBe("16.10.2026 18:41");
    expect(formatTime("2026-12-31T21:05:00Z")).toBe("01.01.2027 01:05");
  });
});

describe("tarix yazıları və ay hesabı", () => {
  it("formatDate", () => {
    expect(formatDate("2026-10-31")).toBe("31.10.2026");
    expect(formatDate(null)).toBeNull();
    expect(formatDate("")).toBeNull();
  });
  it("formatDateAz: ay adı kiçik hərflə (İyun → iyun)", () => {
    expect(formatDateAz("2026-10-16")).toBe("16 oktyabr 2026");
    expect(formatDateAz("2026-06-01")).toBe("1 iyun 2026");
  });
  it("iso: ay 0-dan başlayır", () => {
    expect(iso(2026, 0, 5)).toBe("2026-01-05");
    expect(iso(2026, 10, 9)).toBe("2026-11-09");
  });
  it.each([
    ["2026-11", 1, "2026-12"], ["2026-12", 1, "2027-01"], ["2026-01", -1, "2025-12"], ["2026-11", -13, "2025-10"], ["2026-11", 0, "2026-11"],
  ] as const)("shiftMonth(%s, %i) → %s", (m, n, want) => expect(shiftMonth(m, n)).toBe(want));
});
