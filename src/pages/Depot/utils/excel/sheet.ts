import { NAVY, C, thin, MUTED, SUB, INK } from "./style";
import { kpiRows } from "./kpi";
import type { Hue, Cell, Col, Kpi } from "@/types/depot";

export function sheet(opts: { name: string; title: string; sub: string; hue: Hue; cols: Col[]; kpis?: Kpi[]; rows: Cell[][]; total?: Cell[]; stamp: string }) {
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

export const totalRow = (n: number, label: string, values: Record<number, number | string>, hue: Hue) =>
  Array.from({ length: n }, (_, k) => ({
    value: k === 0 ? label : values[k] ?? "", ...(typeof values[k] === "number" ? { type: Number } : {}), fontWeight: "bold", backgroundColor: C[hue].soft, textColor: INK,
    align: k === 0 ? "left" : "center", indent: k === 0 ? 1 : 0, alignVertical: "center", height: 28, ...thin, topBorderColor: C[hue].main, topBorderStyle: "medium",
  }));
