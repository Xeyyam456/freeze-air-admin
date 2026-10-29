import { daysSince } from "../dates";
import { fmt, unitOf } from "../quantity";
import { STALE_DAYS } from "../../constants/limits";
import type { Holding, Hue, Cell, Col, Ctx } from "@/types/depot";
import { C, txt, num, date, time, pill, LINE, MUTED } from "./style";
import { sheet } from "./sheet";

// Ustalarda: hər usta öz qrupunda (bənövşəyi başlıq sətri: ad + xülasə), altında əşyaları
export function peopleSheet({ tools, holdings, employees, stamp }: Ctx, empId: number | null) {
  const toolOf = new Map(tools.map((t) => [t.id, t]));
  const emp = empId ? employees.find((e) => e.id === empId) : null;
  const list = holdings.filter((h) => !empId || h.employee_id === empId);
  const groups = new Map<number, Holding[]>();
  for (const h of [...list].sort((a, b) => a.taken_at.localeCompare(b.taken_at))) groups.set(h.employee_id, [...(groups.get(h.employee_id) ?? []), h]);
  const order = [...groups.keys()].sort((a, b) => (groups.get(a)![0].employees?.full_name ?? "").localeCompare(groups.get(b)![0].employees?.full_name ?? "", "az"));
  const cols: Col[] = [{ label: "№", width: 5 }, { label: "Alət / material", width: 32, align: "left" }, { label: "Növ", width: 11 }, { label: "Miqdar", width: 15 },
    { label: "Götürüb", width: 12 }, { label: "Saat", width: 8 }, { label: "Gün", width: 7 }, { label: "Təsdiq", width: 16 }, { label: "Təsdiq tarixi", width: 13 }];
  const n = cols.length;
  const rows: Cell[][] = [];
  let i = 0;
  for (const id of order) {
    const hs = groups.get(id)!;
    const tN = hs.filter((h) => toolOf.get(h.tool_id)?.kind !== "material").reduce((s, h) => s + h.quantity, 0);
    const mN = hs.filter((h) => toolOf.get(h.tool_id)?.kind === "material").length;
    const wait = hs.filter((h) => !h.received_at).length;
    rows.push([{ value: `${hs[0].employees?.full_name ?? "Usta"}   ·   ${tN} ədəd alət · ${mN} növ material${wait ? ` · ${wait} təsdiq gözləyir` : ""}`, columnSpan: n,
      fontWeight: "bold", textColor: C.violet.main, backgroundColor: C.violet.soft, alignVertical: "center", height: 26, indent: 1,
      topBorderColor: C.violet.main, topBorderStyle: "medium", ...{ bottomBorderColor: LINE, bottomBorderStyle: "thin" } }, ...Array(n - 1).fill(null)]);
    hs.forEach((h, k) => {
      const t = toolOf.get(h.tool_id);
      const d = daysSince(h.taken_at);
      const mat = t?.kind === "material";
      const st: [string, Hue] = h.received_at ? ["Aldı", "green"] : h.disputed_at ? ["Almadım deyir", "red"] : ["Gözləyir", "amber"];
      rows.push([num(i, k + 1, { textColor: MUTED }), txt(i, t?.name ?? "—", { fontWeight: "bold" }), pill(i, mat ? "Material" : "Alət", mat ? "teal" : "blue"),
        txt(i, `${fmt(h.quantity)} ${t ? unitOf(t) : ""}`, { align: "center", indent: 0, fontWeight: "bold" }), date(i, h.taken_at), txt(i, time(h.taken_at), { align: "center", indent: 0 }),
        num(i, d, d >= STALE_DAYS ? { textColor: C.amber.main, fontWeight: "bold" } : {}), pill(i, st[0], st[1]), date(i, h.received_at)]);
      i++;
    });
  }
  const tAll = list.filter((h) => toolOf.get(h.tool_id)?.kind !== "material").reduce((s, h) => s + h.quantity, 0);
  return sheet({
    name: emp ? emp.full_name : "Ustalarda", title: emp ? `${emp.full_name}: üzərindəkilər` : "Ustalarda olanlar", hue: "violet", stamp, cols, rows,
    sub: `${stamp}  ·  ${emp ? emp.full_name : `${order.length} usta`}  ·  "Gün": götürəndən bəri (${STALE_DAYS}+ gün kəhrəba)`,
    kpis: [{ label: emp ? "Usta" : "Usta sayı", value: emp ? emp.full_name : order.length, hue: "violet" }, { label: "Alət (ədəd)", value: tAll, hue: "blue" },
      { label: "Material (növ)", value: list.filter((h) => toolOf.get(h.tool_id)?.kind === "material").length, hue: "teal" },
      { label: "«Aldım» gözləyir", value: list.filter((h) => !h.received_at).length, hue: "amber" },
      { label: `${STALE_DAYS}+ gündür ustada`, value: list.filter((h) => daysSince(h.taken_at) >= STALE_DAYS).length, hue: "slate" }],
  });
}
