import { describe, expect, it } from "vitest";
import { coverDays } from "@/shared/utils/fuelCover";

// Mobil fuelDebt.coverage ilə eyni qayda: pul günlərə köhnədən yeniyə paylanır
const d = (day: string, cost: number) => ({ day, cost });

describe("coverDays", () => {
  it("bir ödəniş bir neçə günü bağlayır (06.11-də 45.66 ₼ → 02.11 + 06.11)", () => {
    const c = coverDays([d("2026-11-02", 20), d("2026-11-06", 25.66)], 45.66);
    expect(c["2026-11-02"].covered).toBe(20);
    expect(c["2026-11-06"].cost - c["2026-11-06"].covered).toBeLessThan(0.005);
  });

  it("pul çatmayanda: köhnə tam, sonrakı qismən, ən yeni boş", () => {
    const c = coverDays([d("2026-11-02", 20), d("2026-11-03", 30), d("2026-11-04", 25)], 35);
    expect([c["2026-11-02"].covered, c["2026-11-03"].covered, c["2026-11-04"].covered]).toEqual([20, 15, 0]);
  });

  it("günlər qarışıq sırada gəlsə də köhnədən yeniyə", () => {
    const c = coverDays([d("2026-11-05", 10), d("2026-11-01", 10)], 10);
    expect([c["2026-11-01"].covered, c["2026-11-05"].covered]).toEqual([10, 0]);
  });

  it("artıq pul günün sərfindən çox yazılmır", () => {
    expect(coverDays([d("2026-11-02", 20)], 100)["2026-11-02"]).toEqual({ cost: 20, covered: 20 });
  });

  it("pul yoxdursa hamısı ödənilməmiş; gün yoxdursa boş obyekt", () => {
    expect(coverDays([d("2026-11-02", 20)], 0)["2026-11-02"].covered).toBe(0);
    expect(coverDays([], 50)).toEqual({});
  });

  it("giriş massivi dəyişdirilmir (sıralama surətdə)", () => {
    const days = [d("2026-11-05", 10), d("2026-11-01", 10)];
    coverDays(days, 10);
    expect(days[0].day).toBe("2026-11-05");
  });
});
