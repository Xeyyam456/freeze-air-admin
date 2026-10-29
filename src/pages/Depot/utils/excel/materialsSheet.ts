import { fmt, isPacked } from "../quantity";
import { isLowStock } from "../stock";
import type { Tool, Col, Ctx } from "@/types/depot";
import { C, txt, num, pill, INK, MUTED } from "./style";
import { sheet } from "./sheet";
import { status, lossesOf } from "./losses";

export function materialsSheet({ tools, holdings, losses, stamp }: Ctx) {
  const list = tools.filter((t) => t.kind === "material").sort((a, b) => a.name.localeCompare(b.name, "az"));
  const who = (t: Tool) => holdings.filter((h) => h.tool_id === t.id).map((h) => `${h.employees?.full_name ?? "?"} ${fmt(h.quantity)} ${t.unit}`).join(", ");
  const cols: Col[] = [{ label: "№", width: 5 }, { label: "Material", width: 28, align: "left" }, { label: "Ölçü", width: 18 }, { label: "Depoda (tam)", width: 12 },
    { label: "Qab sayı", width: 10 }, { label: "Parça / açıq qab", width: 15 }, { label: "Ustalarda", width: 12 }, { label: "Minimum", width: 11 },
    { label: "Vəziyyət", width: 15 }, { label: "Silinib (səbəb)", width: 24, align: "left" }, { label: "Kimdədir", width: 40, align: "left" }];
  const rows = list.map((t, i) => {
    const s = status(t);
    const q = (v: number, extra: Record<string, unknown> = {}) => txt(i, v ? `${fmt(v)} ${t.unit}` : "—", { align: "center", indent: 0, textColor: v ? INK : "#b4bcc9", ...extra });
    const packs = isPacked(t) ? Math.floor(Math.round((t.available / t.pack_size) * 100) / 100) : null;
    const lost = lossesOf(losses, t.id, t.unit);
    return [num(i, i + 1, { textColor: MUTED }), txt(i, t.name, { fontWeight: "bold" }),
      txt(i, isPacked(t) ? `1 ${t.pack_name} = ${fmt(t.pack_size)} ${t.unit}` : t.unit, { align: "center", textColor: C.teal.main, indent: 0 }),
      q(t.available, { fontWeight: "bold", ...(t.available ? { textColor: C.green.main } : {}) }),
      txt(i, packs !== null ? `${packs} ${t.pack_name}` : "—", { align: "center", indent: 0, textColor: packs ? INK : "#b4bcc9" }),
      txt(i, t.pieces_count ? `${t.pieces_count} əd. · ${fmt(t.pieces_total)} ${t.unit}` : "—", { align: "center", indent: 0, textColor: t.pieces_count ? INK : "#b4bcc9" }),
      q(t.given_out, t.given_out ? { textColor: C.blue.main } : {}), txt(i, t.min_stock != null ? `${fmt(t.min_stock)} ${t.unit}` : "—", { align: "center", indent: 0, textColor: MUTED }),
      pill(i, s.v, s.h), txt(i, lost || "—", { textColor: lost ? C.red.main : "#b4bcc9", wrap: true }), txt(i, who(t) || "—", { wrap: true, textColor: who(t) ? INK : "#b4bcc9" })];
  });
  return sheet({
    name: "Materiallar", title: "Materiallar", hue: "teal", stamp, cols, rows,
    sub: `${stamp}  ·  ${list.length} növ material  ·  "Depoda (tam)" bütöv hissədir, parça və açıq qablar ayrıca sütundadır`,
    kpis: [{ label: "Növ", value: list.length, hue: "navy" }, { label: "Depoda var", value: list.filter((t) => t.available + t.pieces_total > 0).length, hue: "green" },
      { label: "Ustalarda var", value: list.filter((t) => t.given_out > 0).length, hue: "blue" }, { label: "Azalıb", value: list.filter(isLowStock).length, hue: "amber" },
      { label: "Qalmayıb", value: list.filter((t) => status(t).v === "Qalmayıb").length, hue: "red" }],
  });
}
