import { describe, expect, it } from "vitest";
import { holdQty } from "@/pages/Depot/utils/holdQty";
import { inStock } from "@/pages/Depot/utils/inStock";
import { inPack, measureOf } from "@/pages/Depot/utils/measures";
import { fmt, isPacked, packSuffix, parseQty, pieceWord, round2, showQty, unitOf, withUnit } from "@/pages/Depot/utils/quantity";
import { isLowStock } from "@/pages/Depot/utils/stock";
import type { Holding, Tool } from "@/types/depot";

const R410 = { kind: "material", unit: "kq", pack_name: "balon", pack_size: 11.3 } as Tool;
const PIPE = { kind: "material", unit: "metr", pack_name: null, pack_size: null } as Tool;
const PUMP = { kind: "tool", unit: "ədəd", pack_name: null, pack_size: null } as Tool;

describe("round2 / fmt / parseQty", () => {
  it("kəsr xətası yoxdur: 11,3 × 2 = 22,6; 0,1 + 0,2 = 0,3", () => {
    expect(round2(11.3 * 2)).toBe(22.6);
    expect(fmt(0.1 + 0.2)).toBe("0,3");
    expect(fmt(11.3 * 3)).toBe("33,9");
    expect(fmt(5)).toBe("5");
  });

  it("vergül və nöqtə ikisi də qəbul olunur; boş və mətn NaN", () => {
    expect([parseQty("11,3"), parseQty(" 11.3 "), parseQty("0")]).toEqual([11.3, 11.3, 0]);
    expect(parseQty("")).toBeNaN();
    expect(parseQty("  ")).toBeNaN();
    expect(parseQty("abc")).toBeNaN();
  });
});

describe("qablı material (balon ↔ kq)", () => {
  it("isPacked: qabın adı və ölçüsü ikisi də lazımdır", () => {
    expect([isPacked(R410), isPacked(PIPE), isPacked(null), isPacked({ pack_name: "balon", pack_size: null })]).toEqual([true, false, false, false]);
  });

  it("tam balon sayı mötərizədə, yarımçıqda yox", () => {
    expect(packSuffix(22.6, R410)).toBe(" (2 balon)");
    expect(packSuffix(11.3 * 3, R410)).toBe(" (3 balon)");
    expect(packSuffix(16.95, R410)).toBe("");
    expect(packSuffix(0, R410)).toBe("");
    expect(packSuffix(5, PIPE)).toBe("");
  });

  it("withUnit / showQty / unitOf", () => {
    expect(withUnit(22.6, R410)).toBe("22,6 kq (2 balon)");
    expect(withUnit(12, PIPE)).toBe("12 metr");
    expect(withUnit(3, PUMP)).toBe("3");
    expect(showQty(11.3, "kq", R410)).toBe("11,3 kq (1 balon)");
    expect(showQty(4.5, "kq")).toBe("4,5 kq");
    expect([unitOf(R410), unitOf(PUMP)]).toEqual(["kq", "ədəd"]);
  });

  it("depoya qayıdan qalığın adı", () => {
    expect(pieceWord(R410)).toBe("açıq balon");
    expect(pieceWord({ pack_name: "ədəd", pack_size: 5 })).toBe("açıq qab");
    expect(pieceWord(PIPE)).toBe("parça");
  });
});

describe("measureOf — material necə sayılır", () => {
  it.each([
    [["kq", "balon"], { unit: "kq", pack: "balon" }],
    [["metr"], { unit: "metr", pack: null }],
    [["balon"], { unit: "balon", pack: null }],
    [["ədəd"], { unit: "ədəd", pack: null }],
    [["litr", "ədəd"], { unit: "litr", pack: "ədəd" }],
    [["kq", "balon", "ədəd"], { unit: "kq", pack: "balon" }],
    [[], { unit: "ədəd", pack: null }],
  ])("%j → %j", (sel, want) => {
    expect(measureOf(sel)).toEqual(want);
  });

  it("inPack", () => expect([inPack("balon"), inPack("ədəd")]).toEqual(["1 balonda", "1 ədəddə"]));
});

describe("depo qalığı", () => {
  it("inStock: tam hissə + açıq parçalar", () => {
    expect(inStock({ available: 22.6, pieces_total: 5 } as Tool)).toBe(27.6);
  });

  it("isLowStock: hədd yoxdursa heç vaxt; hədd = qalıq olanda bəli", () => {
    expect(isLowStock({ min_stock: null, available: 0, pieces_total: 0 })).toBe(false);
    expect(isLowStock({ min_stock: 5, available: 3, pieces_total: 2 })).toBe(true);
    expect(isLowStock({ min_stock: 5, available: 3, pieces_total: 2.5 })).toBe(false);
  });

  it("holdQty: alətdə ×N (1 olanda boş), materialda vahidlə", () => {
    const h = (quantity: number) => ({ quantity }) as Holding;
    expect([holdQty(h(2), PUMP), holdQty(h(1), PUMP), holdQty(h(4.5), PIPE)]).toEqual(["×2", "", "4,5 metr"]);
  });
});
