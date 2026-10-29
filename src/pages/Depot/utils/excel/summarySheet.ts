import { daysSince } from "../dates";
import { isLowStock } from "../stock";
import { STALE_DAYS } from "../../constants/limits";
import type { Tool, Hue, Col, Ctx } from "@/types/depot";
import { C, txt, num, MUTED } from "./style";
import { sheet } from "./sheet";
import { status } from "./losses";

export function summarySheet({ tools, holdings, losses, stamp }: Ctx) {
  const t = tools.filter((x) => x.kind === "tool");
  const m = tools.filter((x) => x.kind === "material");
  const sum = (l: Tool[], f: (x: Tool) => number) => l.reduce((n, x) => n + f(x), 0);
  const cols: Col[] = [{ label: "Bölmə", width: 26, align: "left" }, { label: "Göstərici", width: 36, align: "left" }, { label: "Dəyər", width: 14 }, { label: "Qeyd", width: 50, align: "left" }];
  const items: [string, string, number, Hue, string][] = [
    ["Alətlər", "Növ", t.length, "navy", ""], ["Alətlər", "Cəmi ədəd", sum(t, (x) => x.quantity), "navy", ""],
    ["Alətlər", "Depoda", sum(t, (x) => x.available), "green", ""], ["Alətlər", "Ustalarda", sum(t, (x) => x.given_out), "blue", ""],
    ["Alətlər", "Təmirdə", sum(t, (x) => x.in_repair), "amber", ""],
    ["Materiallar", "Növ", m.length, "navy", ""], ["Materiallar", "Depoda var", m.filter((x) => x.available + x.pieces_total > 0).length, "green", ""],
    ["Materiallar", "Ustalarda var", m.filter((x) => x.given_out > 0).length, "blue", ""],
    ["Diqqət", "Azalıb (minimuma çatıb)", tools.filter(isLowStock).length, "amber", tools.filter(isLowStock).map((x) => x.name).join(", ")],
    ["Diqqət", "Qalmayıb", tools.filter((x) => status(x).v === "Qalmayıb").length, "red", tools.filter((x) => status(x).v === "Qalmayıb").map((x) => x.name).join(", ")],
    ["Ustalar", "Üzərində əşya olan usta", new Set(holdings.map((h) => h.employee_id)).size, "violet", ""],
    ["Ustalar", "«Aldım» gözləyən təhvil", holdings.filter((h) => !h.received_at).length, "amber", ""],
    ["Ustalar", `${STALE_DAYS}+ gündür ustada`, holdings.filter((h) => daysSince(h.taken_at) >= STALE_DAYS).length, "slate", ""],
    ["Silinənlər", "Təsdiqlənmiş silinmə aktı", losses.length, "red", ""],
  ];
  const rows = items.map(([sec, l, v, h, note], i) => [
    txt(i, sec, { fontWeight: "bold", textColor: MUTED }), txt(i, l, { fontWeight: "bold" }), num(i, v, { fontWeight: "bold", fontSize: 12, ...(v ? { textColor: C[h].main } : {}) }),
    txt(i, note || "", { wrap: true, textColor: MUTED })]);
  return sheet({
    name: "Xülasə", title: "Depo: ümumi xülasə", hue: "navy", stamp, cols, rows,
    sub: `${stamp}  ·  bu faylda: Xülasə, Alətlər, Materiallar, Ustalarda, Silinənlər, Təmirdə, Təmir tarixçəsi`,
    kpis: [{ label: "Alət (ədəd)", value: sum(t, (x) => x.quantity), hue: "blue" }, { label: "Material (növ)", value: m.length, hue: "teal" },
      { label: "Ustalarda (ədəd alət)", value: sum(t, (x) => x.given_out), hue: "violet" }, { label: "Silinib (akt)", value: losses.length, hue: "red" }],
  });
}
