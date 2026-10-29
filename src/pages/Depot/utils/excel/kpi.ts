import { C, MUTED } from "./style";
import type { Cell, Kpi } from "@/types/depot";

// KPI kartlarını sütunlara paylayır: hər kart bir neçə sütunu tutur; üstdə ad (kiçik), altda iri rəqəm, kartın üstündə rəngli qalın xətt
export function kpiRows(kpis: Kpi[], n: number): Cell[][] {
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
