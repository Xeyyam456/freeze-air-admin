import { describe, expect, it } from "vitest";
import { fmtMs } from "../fmtMs";

describe("fmtMs", () => {
  it("dəqiqə:saniyə", () => {
    expect(fmtMs(0)).toBe("0:00");
    expect(fmtMs(7400)).toBe("0:07");
    expect(fmtMs(83000)).toBe("1:23");
  });
  it("limit yoxdur: saatı da göstərir", () => {
    expect(fmtMs(3723000)).toBe("1:02:03");
  });
  it("mənfi və qırıq dəyər", () => {
    expect(fmtMs(-5)).toBe("0:00");
    expect(fmtMs(1500)).toBe("0:02");
  });
});
