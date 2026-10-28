import { useMemo, useState } from "react";
import { urlQuery } from "@/lib/urlQuery";
import { norm } from "@/shared/utils/norm";
import type { DepotBoardProps, DepotTab, Holding, Kind, Tool } from "@/types/depot";
import { STALE_DAYS } from "../constants/limits";
import { daysSince } from "../utils/dates";
import { inStock } from "../utils/inStock";
import { isLowStock } from "../utils/stock";

// Depo lövhəsinin məlumatı: axtarış, qruplaşdırma (alətə / ustaya görə), ümumi baxışın rəqəmləri, açıq pəncərələr
export function useDepotBoard({ tab, tools: allTools, holdings, employees, openToolId }: DepotBoardProps) {
  const [query, setQuery] = useState(urlQuery);
  const [person, setPerson] = useState<{ id: number; kind: Kind } | null>(null);
  const [quickId, setQuickId] = useState<number | null>(null);

  const toolInfo = useMemo(() => new Map(allTools.map((t) => [t.id, t])), [allTools]);
  const byTool = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.tool_id] ??= []).push(h);
    return m;
  }, [holdings]);
  const byEmployee = useMemo(() => {
    const m: Record<number, Holding[]> = {};
    for (const h of holdings) (m[h.employee_id] ??= []).push(h);
    return m;
  }, [holdings]);
  const masters = employees.filter((e) => !e.is_management);
  const words = norm(query).split(/\s+/).filter(Boolean);
  const match = (s: string) => words.every((w) => norm(s).includes(w));

  const kind: Kind = tab === "material" ? "material" : "tool";
  const shown = tab === "people" || tab === "home" ? [] : allTools.filter((t) => t.kind === tab && match(`${t.name} ${t.inventory_code ?? ""}`));
  const people = tab === "people" ? masters.filter((e) => match(e.full_name)) : [];
  const counts: Record<DepotTab, number> = {
    tool: allTools.filter((t) => t.kind === "tool").length,
    material: allTools.filter((t) => t.kind === "material").length,
    people: masters.length,
  };

  // Ümumi baxış: alətlər ədədlə (depoda / ustalarda / təmirdə), materiallar növlə, ustalar
  const toolsOnly = allTools.filter((t) => t.kind === "tool");
  const mats = allTools.filter((t) => t.kind === "material");
  const sum = (list: Tool[], f: (t: Tool) => number) => list.reduce((n, t) => n + f(t), 0);

  return {
    query, setQuery, person, setPerson, quickId, setQuickId, toolInfo, byTool, byEmployee, masters, kind, shown, people, counts, mats,
    tDepot: sum(toolsOnly, (t) => t.available), tGiven: sum(toolsOnly, (t) => t.given_out), tRepair: sum(toolsOnly, (t) => t.in_repair),
    holdersCount: new Set(holdings.map((h) => h.employee_id)).size,
    lowN: allTools.filter((t) => inStock(t) > 0 && isLowStock(t)).length,
    outN: allTools.filter((t) => inStock(t) === 0 && t.given_out + t.in_repair === 0).length,
    unconfirmedN: holdings.filter((h) => !h.received_at && !h.disputed_at).length,
    staleN: holdings.filter((h) => daysSince(h.taken_at) >= STALE_DAYS).length,
    open: allTools.find((t) => t.id === openToolId) ?? null,
    quick: allTools.find((t) => t.id === quickId) ?? null,
    openPerson: person ? employees.find((e) => e.id === person.id) ?? null : null,
  };
}
