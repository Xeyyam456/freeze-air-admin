import { daysSince } from "../dates";
import { fmt } from "../quantity";
import { isLowStock } from "../stock";
import type { Tool, Col, Ctx } from "@/types/depot";
import { C, txt, num, pill, MUTED, INK } from "./style";
import { sheet, totalRow } from "./sheet";
import { status, lossesOf } from "./losses";

export function toolsSheet({ tools, holdings, losses, stamp }: Ctx) {
  const list = tools.filter((t) => t.kind === "tool").sort((a, b) => a.name.localeCompare(b.name, "az"));
  const who = (id: number) => holdings.filter((h) => h.tool_id === id)
    .map((h) => `${h.employees?.full_name ?? "?"}${h.quantity > 1 ? ` ×${h.quantity}` : ""} (${daysSince(h.taken_at)} gün)`).join(", ");
  const cols: Col[] = [{ label: "№", width: 5 }, { label: "Alət", width: 30, align: "left" }, { label: "İnventar kodu", width: 14 }, { label: "Cəmi", width: 8 },
    { label: "Depoda", width: 9 }, { label: "Ustalarda", width: 10 }, { label: "Təmirdə", width: 9 }, { label: "Minimum", width: 9 }, { label: "Vəziyyət", width: 15 },
    { label: "Silinib (səbəb)", width: 24, align: "left" }, { label: "Kimdədir (neçə gündür)", width: 46, align: "left" }];
  const rows = list.map((t, i) => {
    const s = status(t);
    const lost = lossesOf(losses, t.id, "ədəd");
    return [num(i, i + 1, { textColor: MUTED }), txt(i, t.name, { fontWeight: "bold" }), txt(i, t.inventory_code ?? "—", { align: "center", textColor: MUTED, indent: 0 }),
      num(i, t.quantity), num(i, t.available, { fontWeight: "bold", ...(t.available ? { textColor: C.green.main } : {}) }), num(i, t.given_out, t.given_out ? { textColor: C.blue.main } : {}),
      num(i, t.in_repair, t.in_repair ? { textColor: C.amber.main } : {}), txt(i, t.min_stock != null ? fmt(t.min_stock) : "—", { align: "center", textColor: MUTED, indent: 0 }),
      pill(i, s.v, s.h), txt(i, lost || "—", { textColor: lost ? C.red.main : "#b4bcc9", wrap: true }), txt(i, who(t.id) || "—", { wrap: true, textColor: who(t.id) ? INK : "#b4bcc9" })];
  });
  const sum = (f: (t: Tool) => number) => list.reduce((n, t) => n + f(t), 0);
  return sheet({
    name: "Alətlər", title: "Alətlər", hue: "blue", stamp, cols, rows,
    sub: `${stamp}  ·  ${list.length} növ alət  ·  "Depoda" boşda olan, "Ustalarda" ustaların üzərində olan saydır`,
    kpis: [{ label: "Cəmi", value: sum((t) => t.quantity), hue: "navy" }, { label: "Depoda", value: sum((t) => t.available), hue: "green" },
      { label: "Ustalarda", value: sum((t) => t.given_out), hue: "blue" }, { label: "Təmirdə", value: sum((t) => t.in_repair), hue: "amber" },
      { label: "Azalan / qalmayan", value: `${list.filter(isLowStock).length} / ${list.filter((t) => status(t).v === "Qalmayıb").length}`, hue: "red" }],
    total: totalRow(cols.length, "Cəmi", { 3: sum((t) => t.quantity), 4: sum((t) => t.available), 5: sum((t) => t.given_out), 6: sum((t) => t.in_repair) }, "blue"),
  });
}
