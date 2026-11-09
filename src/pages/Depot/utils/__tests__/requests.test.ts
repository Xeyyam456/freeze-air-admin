import { describe, expect, it } from "vitest";
import { giveable } from "@/pages/Depot/utils/giveable";
import { needsOtherApprover, requestLabel } from "@/pages/Depot/utils/requests";
import { summary } from "@/pages/Depot/utils/requestSummary";
import { lossText } from "@/pages/Depot/utils/stock";
import type { DepotRequest, Loss, Tool } from "@/types/depot";

const req = (p: Partial<DepotRequest>) => ({ tool_kind: "material", unit: "kq", quantity: null, used: null, returned: null, expected: null, reason: null, ...p }) as DepotRequest;

describe("summary — sənədin əsas sətri", () => {
  it.each([
    [{ type: "receipt", quantity: 22.6 }, "+22,6 kq depoya"],
    [{ type: "writeoff", quantity: 2, reason: "broken" }, "−2 kq · Xarab olub"],
    [{ type: "writeoff", quantity: 1 }, "−1 kq · Başqa səbəb"],
    [{ type: "count", quantity: 12, expected: 10 }, "sistemdə 10, sayılan 12 kq (+2)"],
    [{ type: "count", quantity: 8.5, expected: 10 }, "sistemdə 10, sayılan 8,5 kq (−1,5)"],
    [{ type: "return", used: 3, returned: 8.3 }, "işlədib 3 kq, qaytarır 8,3 kq"],
    [{ type: "return", tool_kind: "tool", quantity: 2 }, "qaytarır 2 ədəd"],
    [{ type: "request", quantity: 11.3 }, "istəyir 11,3 kq"],
    [{ type: "request", tool_kind: "tool", quantity: 1 }, "istəyir 1 ədəd"],
  ] as const)("%j", (p, want) => {
    expect(summary(req(p))).toBe(want);
  });
});

describe("requestLabel", () => {
  it("istək materialdırsa Material, alətdirsə Alət; qalanları növün adı", () => {
    expect(requestLabel({ type: "request", tool_kind: "material" })).toBe("Material istəyi");
    expect(requestLabel({ type: "request", tool_kind: "tool" })).toBe("Alət istəyi");
    expect(requestLabel({ type: "writeoff", tool_kind: "tool" })).toBe("Silinmə aktı");
    expect(requestLabel({ type: "naməlum", tool_kind: "tool" })).toBe("naməlum");
  });
});

describe("needsOtherApprover — öz sənədini təsdiqləmək olmaz (müdirdən başqa)", () => {
  const mine = { created_by: "u1" };
  it.each([
    ["öz mədaxili", { type: "receipt", ...mine }, "u1", false, true],
    ["öz silinməsi", { type: "writeoff", ...mine }, "u1", false, true],
    ["öz sayımı", { type: "count", ...mine }, "u1", false, true],
    ["müdir öz sənədini təsdiqləyə bilər", { type: "receipt", ...mine }, "u1", true, false],
    ["başqasının sənədi", { type: "receipt", ...mine }, "u2", false, false],
    ["ustanın qaytarması bu qaydaya düşmür", { type: "return", ...mine }, "u1", false, false],
  ] as const)("%s", (_t, r, uid, owner, want) => {
    expect(needsOtherApprover(r, uid, owner)).toBe(want);
  });
});

describe("giveable — istək depodan verilə bilərmi", () => {
  const tool = (available: number) => ({ available }) as Tool;
  it("yalnız istək sənədində; depoda kifayət qədər varsa", () => {
    expect(giveable(req({ type: "request", quantity: 2 }), tool(2))).toBe(true);
    expect(giveable(req({ type: "request", quantity: 3 }), tool(2))).toBe(false);
    expect(giveable(req({ type: "request", quantity: 1 }), undefined)).toBe(false);
    expect(giveable(req({ type: "return", quantity: 1 }), tool(5))).toBeNull();
  });
});

describe("lossText — itki səbəbləri toplanır", () => {
  it("eyni səbəb cəmlənir, Azərbaycan kiçik hərfi (İ → i)", () => {
    const list = [{ reason: "broken", quantity: 1 }, { reason: "lost", quantity: 1 }, { reason: "broken", quantity: 0.5 }] as Loss[];
    expect(lossText(list, "ədəd")).toBe("1,5 ədəd xarab olub · 1 ədəd itib");
  });

  it("səbəbsiz → başqa səbəb; boş siyahı → boş mətn", () => {
    expect(lossText([{ reason: null, quantity: 2 }] as Loss[], "kq")).toBe("2 kq başqa səbəb");
    expect(lossText([], "kq")).toBe("");
  });
});
