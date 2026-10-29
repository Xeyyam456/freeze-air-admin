import { createClient } from "@/lib/supabase/client";
import { daysSince } from "../dates";
import { txt, num, date, pill, MUTED, INK } from "./style";
import { sheet } from "./sheet";
import type { Hue, Col, Kpi, Ctx } from "@/types/depot";

export async function repairsSheets({ tools, stamp }: Ctx) {
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
