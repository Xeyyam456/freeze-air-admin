import { useState } from "react";
import { AlertTriangle, Boxes, FileSpreadsheet, Package, Users, Wrench } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { ToolPicker } from "@/components/ToolPicker";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { DHead, SOFT, type Tone } from "@/pages/Depot/components/ui";
import { daysSince, fmt, isLowStock, isPacked, REASONS, STALE_DAYS, unitOf, type DepotEmployee, type Holding, type Tool } from "@/pages/Depot/utils";

// Depo hesabatları Excel-də (2026-10-23, istifadəçi: "bütün hesabatlar Excel-də pro dizaynda, tam detallı: tam depo, təkcə alət,
// təkcə material, bir usta / bütün ustalar, xarablar, təmirdə olanlar, səbəbləri ilə"). write-excel-file 4.1.1.
// Hər vərəqin quruluşu: tünd başlıq zolağı (şirkət + hesabat adı) → açıq alt zolaq (tarix, nə daxildir) → rəqəmli xülasə kartları
// (rəngli üst xətt, iri rəqəm) → öz rəngli yapışan cədvəl başlığı → zebra sətirlər (rəngli vəziyyət "nişanları", tarix Excel tarixi kimi)
// → "Cəmi" sətri → altlıq. Ustalar vərəqi ustalara görə qruplanır (hər usta öz başlıq sətri və xülasəsi ilə).

const NAVY = "#0b1324", INK = "#111827", MUTED = "#667085", LINE = "#dfe5ef", ZEBRA = "#f7f9fc", SUB = "#eef2f8";
const C = {
  blue: { main: "#2563eb", soft: "#eaf1ff" }, teal: { main: "#0d9488", soft: "#e6f7f5" }, violet: { main: "#7c3aed", soft: "#f2edff" },
  red: { main: "#dc2626", soft: "#fdecec" }, amber: { main: "#d97706", soft: "#fff4e0" }, green: { main: "#16a34a", soft: "#e8f8ee" },
  slate: { main: "#475569", soft: "#f1f4f8" }, navy: { main: "#1f2a44", soft: "#eef1f7" },
};
type Hue = keyof typeof C;
type Cell = Record<string, unknown> | null;
type Col = { label: string; width: number; align?: "left" | "center" | "right" };
type Kpi = { label: string; value: string | number; hue: Hue };

const thin = { borderColor: LINE, borderStyle: "thin" as const };
const base = (i: number) => ({ alignVertical: "center" as const, height: 24, ...(i % 2 ? { backgroundColor: ZEBRA } : {}), ...thin });
const txt = (i: number, value: string, extra: Record<string, unknown> = {}) => ({ ...base(i), value, indent: 1, ...extra });
const num = (i: number, value: number, extra: Record<string, unknown> = {}) =>
  ({ ...base(i), value, type: Number, align: "center" as const, textColor: value ? INK : "#b4bcc9", ...extra });
const date = (i: number, iso: string | null) =>
  iso ? { ...base(i), value: new Date(iso), type: Date, format: "dd.mm.yyyy", align: "center" as const } : txt(i, "—", { align: "center", textColor: MUTED });
const time = (iso: string) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
// Rəngli "nişan" xanası: yumşaq fon + qalın rəngli yazı
const pill = (i: number, value: string, hue: Hue) => ({ ...base(i), value, align: "center" as const, fontWeight: "bold" as const, textColor: C[hue].main, backgroundColor: C[hue].soft });

// KPI kartlarını sütunlara paylayır: hər kart bir neçə sütunu tutur; üstdə ad (kiçik), altda iri rəqəm, kartın üstündə rəngli qalın xətt
function kpiRows(kpis: Kpi[], n: number): Cell[][] {
  const per = Math.max(1, Math.floor(n / kpis.length));
  const labels: Cell[] = [], values: Cell[] = [];
  kpis.forEach((k, idx) => {
    const span = idx === kpis.length - 1 ? n - per * (kpis.length - 1) : per;
    const card = { backgroundColor: C[k.hue].soft, columnSpan: span, indent: 1 };
    labels.push({ ...card, value: k.label.toUpperCase(), fontSize: 8, fontWeight: "bold", textColor: MUTED, alignVertical: "bottom", height: 20,
      topBorderColor: C[k.hue].main, topBorderStyle: "thick", leftBorderColor: "#ffffff", leftBorderStyle: "medium" }, ...Array(span - 1).fill(null));
    values.push({ ...card, value: k.value, ...(typeof k.value === "number" ? { type: Number, align: "left" } : {}), fontSize: 18, fontWeight: "bold",
      textColor: C[k.hue].main, alignVertical: "center", height: 32, leftBorderColor: "#ffffff", leftBorderStyle: "medium" }, ...Array(span - 1).fill(null));
  });
  return [labels, values];
}

function sheet(opts: { name: string; title: string; sub: string; hue: Hue; cols: Col[]; kpis?: Kpi[]; rows: Cell[][]; total?: Cell[]; stamp: string }) {
  const { cols, hue } = opts;
  const n = cols.length;
  const bar = (value: string, style: Record<string, unknown>) => [{ value, columnSpan: n, ...style }, ...Array(n - 1).fill(null)];
  const top: Cell[][] = [
    bar("FREEZE AIR SERVICE  ·  DEPO", { fontSize: 9, fontWeight: "bold", textColor: "#9fb3d1", backgroundColor: NAVY, alignVertical: "bottom", height: 20, indent: 1 }),
    bar(opts.title, { fontSize: 20, fontWeight: "bold", textColor: "#ffffff", backgroundColor: NAVY, alignVertical: "center", height: 38, indent: 1,
      bottomBorderColor: C[hue].main, bottomBorderStyle: "thick" }),
    bar(opts.sub, { fontSize: 10, textColor: MUTED, backgroundColor: SUB, alignVertical: "center", height: 24, indent: 1 }),
    Array(n).fill(null),
  ];
  if (opts.kpis?.length) top.push(...kpiRows(opts.kpis, n), Array(n).fill(null));
  const header = cols.map((c) => ({ value: c.label, fontWeight: "bold", fontSize: 10, textColor: "#ffffff", backgroundColor: C[hue].main, align: c.align ?? "center",
    alignVertical: "center", height: 30, wrap: true, indent: c.align === "left" ? 1 : 0, borderColor: C[hue].main, borderStyle: "thin", bottomBorderColor: NAVY, bottomBorderStyle: "medium" }));
  const data: Cell[][] = [...top, header, ...opts.rows];
  if (opts.rows.length === 0) data.push(bar("Heç nə yoxdur", { textColor: MUTED, fontStyle: "italic", align: "center", height: 30, alignVertical: "center", ...thin }));
  if (opts.total) data.push(opts.total);
  data.push(Array(n).fill(null), bar(`Avtomatik hesabat · Freeze Air Service · ${opts.stamp}`, { fontSize: 9, fontStyle: "italic", textColor: "#98a2b3", indent: 1 }));
  return {
    data, sheet: opts.name.slice(0, 31), columns: cols.map((c) => ({ width: c.width })), stickyRowsCount: top.length + 1,
    showGridLines: false, orientation: "landscape" as const, zoomScale: 100,
  };
}

const totalRow = (n: number, label: string, values: Record<number, number | string>, hue: Hue) =>
  Array.from({ length: n }, (_, k) => ({
    value: k === 0 ? label : values[k] ?? "", ...(typeof values[k] === "number" ? { type: Number } : {}), fontWeight: "bold", backgroundColor: C[hue].soft, textColor: INK,
    align: k === 0 ? "left" : "center", indent: k === 0 ? 1 : 0, alignVertical: "center", height: 28, ...thin, topBorderColor: C[hue].main, topBorderStyle: "medium",
  }));

// Silinmə aktı (təsdiqlənmiş): hesabatlarda səbəbi ilə
type LossRow = { tool_id: number | null; tool_name: string; tool_kind: string; unit: string; quantity: number | null; reason: string | null; note: string | null;
  employee_id: number | null; created_by_name: string | null; decided_by_name: string | null; decided_at: string | null };

function status(t: Tool): { v: string; h: Hue } {
  const n = t.available + t.pieces_total;
  if (n === 0 && t.given_out + t.in_repair === 0) return { v: "Qalmayıb", h: "red" };
  if (n === 0) return { v: "Hamısı ustada", h: "blue" };
  if (isLowStock(t)) return { v: "Azalıb", h: "amber" };
  return { v: "Depoda var", h: "green" };
}
const reasonHue: Record<string, Hue> = { broken: "red", lost: "amber", stolen: "red", used: "slate", other: "violet" };
const lossesOf = (losses: LossRow[], id: number, unit: string) => {
  const by = new Map<string, number>();
  for (const l of losses.filter((x) => x.tool_id === id)) by.set(l.reason ?? "other", (by.get(l.reason ?? "other") ?? 0) + (l.quantity ?? 0));
  return [...by].map(([r, q]) => `${fmt(q)} ${unit} ${(REASONS[r] ?? r).toLocaleLowerCase("az")}`).join(", ");
};

type Ctx = { tools: Tool[]; holdings: Holding[]; employees: DepotEmployee[]; stamp: string; losses: LossRow[] };

function toolsSheet({ tools, holdings, losses, stamp }: Ctx) {
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

function materialsSheet({ tools, holdings, losses, stamp }: Ctx) {
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

// Ustalarda: hər usta öz qrupunda (bənövşəyi başlıq sətri: ad + xülasə), altında əşyaları
function peopleSheet({ tools, holdings, employees, stamp }: Ctx, empId: number | null) {
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

function lossesSheet({ losses, employees, stamp }: Ctx) {
  const empName = new Map(employees.map((e) => [e.id, e.full_name]));
  const cols: Col[] = [{ label: "№", width: 5 }, { label: "Tarix", width: 12 }, { label: "Saat", width: 8 }, { label: "Ad", width: 28, align: "left" }, { label: "Növ", width: 11 },
    { label: "Miqdar", width: 13 }, { label: "Səbəb", width: 15 }, { label: "İzah", width: 34, align: "left" }, { label: "Kimdən", width: 20, align: "left" },
    { label: "Yazan", width: 20, align: "left" }, { label: "Təsdiqləyən", width: 20, align: "left" }];
  const rows = losses.map((r, i) => {
    const mat = r.tool_kind === "material";
    return [num(i, i + 1, { textColor: MUTED }), date(i, r.decided_at), txt(i, r.decided_at ? time(r.decided_at) : "", { align: "center", indent: 0 }),
      txt(i, r.tool_name, { fontWeight: "bold" }), pill(i, mat ? "Material" : "Alət", mat ? "teal" : "blue"),
      txt(i, `${fmt(r.quantity ?? 0)} ${mat ? r.unit : "ədəd"}`, { align: "center", indent: 0, fontWeight: "bold" }),
      pill(i, REASONS[r.reason ?? "other"] ?? r.reason ?? "", reasonHue[r.reason ?? "other"] ?? "slate"), txt(i, r.note ?? "—", { wrap: true, textColor: r.note ? INK : "#b4bcc9" }),
      txt(i, r.employee_id ? empName.get(r.employee_id) ?? "usta" : "depodan"), txt(i, r.created_by_name ?? ""), txt(i, r.decided_by_name ?? "")];
  });
  const cnt = (k: string) => losses.filter((l) => l.reason === k).length;
  return sheet({
    name: "Silinənlər", title: "Silinənlər", hue: "red", stamp, cols, rows,
    sub: `${stamp}  ·  təsdiqlənmiş silinmə aktları, səbəbi və izahı ilə  ·  ${losses.length} akt`,
    kpis: [{ label: "Cəmi akt", value: losses.length, hue: "navy" }, { label: "Xarab", value: cnt("broken"), hue: "red" }, { label: "İtib", value: cnt("lost"), hue: "amber" },
      { label: "Oğurlanıb", value: cnt("stolen"), hue: "red" }, { label: "Sərf / başqa", value: cnt("used") + cnt("other"), hue: "slate" }],
  });
}

async function repairsSheets({ tools, stamp }: Ctx) {
  const { data } = await createClient().from("tool_repairs").select("*").order("sent_at", { ascending: false });
  const all = data ?? [];
  const name = new Map(tools.map((t) => [t.id, t.name]));
  const cols: Col[] = [{ label: "№", width: 5 }, { label: "Alət", width: 28, align: "left" }, { label: "Say", width: 7 }, { label: "Harada", width: 22, align: "left" },
    { label: "Nasazlıq", width: 34, align: "left" }, { label: "Göndərilib", width: 12 }, { label: "Qayıdıb", width: 12 }, { label: "Gün", width: 7 },
    { label: "Göndərən", width: 20, align: "left" }, { label: "Nəticə", width: 16 }];
  const row = (r: (typeof all)[number], i: number) => {
    const days = r.returned_at ? Math.max(0, Math.round((new Date(r.returned_at).getTime() - new Date(r.sent_at).getTime()) / 86_400_000)) : daysSince(r.sent_at);
    const res: [string, Hue] = !r.returned_at ? ["Təmirdədir", "amber"] : r.outcome === "fixed" ? ["Düzəldi", "green"] : ["Bərpa olunmadı", "red"];
    return [num(i, i + 1, { textColor: MUTED }), txt(i, name.get(r.tool_id) ?? "silinmiş alət", { fontWeight: "bold" }), num(i, r.quantity, { fontWeight: "bold" }),
      txt(i, r.place ?? "—"), txt(i, r.note ?? "—", { wrap: true, textColor: r.note ? INK : "#b4bcc9" }), date(i, r.sent_at), date(i, r.returned_at),
      num(i, days), txt(i, r.sent_by_name ?? ""), pill(i, res[0], res[1])];
  };
  const open = all.filter((r) => !r.returned_at);
  const done = all.filter((r) => r.returned_at);
  const kpis: Kpi[] = [{ label: "Təmirdə", value: open.reduce((n, r) => n + r.quantity, 0), hue: "amber" }, { label: "Düzəldi", value: done.filter((r) => r.outcome === "fixed").length, hue: "green" },
    { label: "Bərpa olunmadı", value: done.filter((r) => r.outcome !== "fixed").length, hue: "red" }, { label: "Cəmi qeyd", value: all.length, hue: "navy" }];
  return [
    sheet({ name: "Təmirdə", title: "Təmirdə olanlar", hue: "amber", stamp, cols, rows: open.map(row), kpis, sub: `${stamp}  ·  hazırda təmirdə olan alətlər, harada və nə vaxtdan` }),
    sheet({ name: "Təmir tarixçəsi", title: "Təmir tarixçəsi", hue: "amber", stamp, cols, rows: done.map(row), sub: `${stamp}  ·  qayıdan təmirlər və nəticəsi` }),
  ];
}

function summarySheet({ tools, holdings, losses, stamp }: Ctx) {
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

export type ReportKind = "all" | "tools" | "materials" | "people" | "losses" | "repairs";

export async function exportDepot(kind: ReportKind, ctx: { tools: Tool[]; holdings: Holding[]; employees: DepotEmployee[] }, empId: number | null = null) {
  const now = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  const stamp = `Tarix: ${p(now.getDate())}.${p(now.getMonth() + 1)}.${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}`;
  const { data: lossData } = await createClient().from("depot_requests")
    .select("tool_id, tool_name, tool_kind, unit, quantity, reason, note, employee_id, created_by_name, decided_by_name, decided_at")
    .eq("type", "writeoff").eq("status", "approved").order("decided_at", { ascending: false });
  const c: Ctx = { ...ctx, stamp, losses: (lossData ?? []) as LossRow[] };
  const sheets =
    kind === "all" ? [summarySheet(c), toolsSheet(c), materialsSheet(c), peopleSheet(c, null), lossesSheet(c), ...(await repairsSheets(c))]
    : kind === "tools" ? [toolsSheet(c)]
    : kind === "materials" ? [materialsSheet(c)]
    : kind === "people" ? [peopleSheet(c, empId)]
    : kind === "losses" ? [lossesSheet(c)]
    : await repairsSheets(c);
  const emp = empId ? ctx.employees.find((e) => e.id === empId)?.full_name : null;
  const file = { all: "depo-tam", tools: "depo-aletler", materials: "depo-materiallar", people: emp ? `depo-${emp.replace(/\s+/g, "-")}` : "depo-ustalar", losses: "depo-silinenler", repairs: "depo-temir" }[kind];
  const write = (await import("write-excel-file/browser")).default;
  await write(sheets, { fontFamily: "Calibri", fontSize: 11 }).toFile(`${file}-${now.toISOString().slice(0, 10)}.xlsx`);
  toast.success("Excel faylı hazırdır");
}

const OPTIONS: { id: ReportKind; icon: typeof Wrench; tone: Tone; title: string; sub: string }[] = [
  { id: "all", icon: Boxes, tone: "green", title: "Tam depo", sub: "Xülasə, alətlər, materiallar, ustalar, silinənlər, təmir — hamısı bir faylda" },
  { id: "tools", icon: Wrench, tone: "blue", title: "Yalnız alətlər", sub: "Cəmi, depoda, ustalarda, təmirdə, kimdədir" },
  { id: "materials", icon: Package, tone: "teal", title: "Yalnız materiallar", sub: "Vahid, depoda, parça/açıq balon, ustalarda" },
  { id: "people", icon: Users, tone: "violet", title: "Ustalar", sub: "Bütün ustalar və ya bir usta: üzərindəkilər" },
  { id: "losses", icon: AlertTriangle, tone: "red", title: "Silinənlər", sub: "Xarab, itib, oğurlanıb, sərf — səbəbi, izahı, kim" },
  { id: "repairs", icon: Wrench, tone: "amber", title: "Təmir", sub: "Təmirdə olanlar və təmir tarixçəsi" },
];

// "Daha çox → Excel": hansı hesabat (və Ustalarda hansı usta) seçilir, bir düymə ilə yüklənir
export function ExcelModal({ tools, holdings, employees, onClose }: { tools: Tool[]; holdings: Holding[]; employees: DepotEmployee[]; onClose: () => void }) {
  const [kind, setKind] = useState<ReportKind>("all");
  const [emp, setEmp] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const masters = employees.filter((e) => !e.is_management);

  async function run() {
    setPending(true);
    try {
      await exportDepot(kind, { tools, holdings, employees }, kind === "people" ? emp : null);
      onClose();
    } catch (e) {
      toast.error(`Excel yaradılmadı: ${(e as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="excel-title" className="!max-w-2xl">
      <DHead id="excel-title" icon={FileSpreadsheet} tone="green" title="Excel hesabatı" sub="Hansı hesabatı yükləmək istəyirsən?" onClose={onClose} />
      <div className="grid gap-2.5 max-sm:gap-1.5 sm:grid-cols-2" role="radiogroup" aria-label="Hesabat">
        {OPTIONS.map((o) => {
          const on = kind === o.id;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setKind(o.id)}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition max-sm:items-center max-sm:gap-2.5 max-sm:rounded-xl max-sm:p-2 ${on ? "border-primary bg-[#f4f8ff] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]" : "border-line hover:bg-bg"}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl max-sm:h-8 max-sm:w-8 ${SOFT[o.tone]}`}><o.icon size={18} /></span>
              <span className="min-w-0">
                <b className="block text-sm">{o.title}</b>
                <span className="muted block text-xs leading-snug max-sm:hidden">{o.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
      {kind === "people" && (
        <div className="mt-4 max-sm:mt-3">
          <span className="label">Hansı usta</span>
          <div className="flex gap-2">
            <ToolPicker items={masters.map((e) => ({ id: e.id, name: e.full_name }))} value={emp} onChange={setEmp} icon={Users}
              placeholder="Bütün ustalar" emptyLabel="Usta yoxdur" searchLabel="Usta axtar..." />
            {emp !== null && <button type="button" onClick={() => setEmp(null)} className="btn btn-cancel btn-sm !h-9 shrink-0 max-sm:!px-2.5">Hamısı</button>}
          </div>
        </div>
      )}
      <div className="mt-5 flex gap-2 max-sm:mt-4">
        <button type="button" disabled={pending} onClick={run} className="btn btn-primary min-w-0 flex-1"><FileSpreadsheet size={16} /> {pending ? "Hazırlanır..." : "Yüklə"}</button>
        <button type="button" onClick={onClose} className="btn btn-cancel max-sm:min-w-0 max-sm:flex-1">Ləğv et</button>
      </div>
    </Modal>
  );
}
