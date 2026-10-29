import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { DepotEmployee, Holding, Tool, LossRow, Ctx, ReportKind } from "@/types/depot";
import { toolsSheet } from "./toolsSheet";
import { materialsSheet } from "./materialsSheet";
import { peopleSheet } from "./peopleSheet";
import { lossesSheet } from "./lossesSheet";
import { repairsSheets } from "./repairsSheets";
import { summarySheet } from "./summarySheet";

// Depo hesabatları Excel-də (2026-10-23, istifadəçi: "bütün hesabatlar Excel-də pro dizaynda, tam detallı: tam depo, təkcə alət,
// təkcə material, bir usta / bütün ustalar, xarablar, təmirdə olanlar, səbəbləri ilə"). write-excel-file 4.1.1.
// Hər vərəqin quruluşu: tünd başlıq zolağı (şirkət + hesabat adı) → açıq alt zolaq (tarix, nə daxildir) → rəqəmli xülasə kartları
// (rəngli üst xətt, iri rəqəm) → öz rəngli yapışan cədvəl başlığı → zebra sətirlər (rəngli vəziyyət "nişanları", tarix Excel tarixi kimi)
// → "Cəmi" sətri → altlıq. Ustalar vərəqi ustalara görə qruplanır (hər usta öz başlıq sətri və xülasəsi ilə).


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
