import { describe, expect, it } from "vitest";
import { toPeaks } from "../toPeaks";

describe("toPeaks", () => {
  it("boş nümunədə n sütun, hamısı minimum", () => {
    const p = toPeaks([], 10);
    expect(p).toHaveLength(10);
    expect(p.every((x) => x === 6)).toBe(true);
  });
  it("0..100 aralığına sıxılır", () => {
    expect(toPeaks([500], 2)).toEqual([100, 100]);
    expect(toPeaks([0], 2)).toEqual([6, 6]);
    expect(toPeaks([40], 2)).toEqual([40, 40]);
  });
  it("çox nümunə ortalanır, sıra qorunur", () => {
    expect(toPeaks([0, 0, 100, 100], 2)).toEqual([6, 100]);
  });
  it("az nümunə təkrarlanır", () => {
    expect(toPeaks([100, 0], 4)).toEqual([100, 100, 6, 6]);
  });
});
