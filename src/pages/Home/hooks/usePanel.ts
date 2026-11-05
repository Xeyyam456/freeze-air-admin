import { useMemo } from "react";
import { useData } from "@/lib/useData";
import { fetchMonth } from "@/services/dashboard/fetchMonth";
import { fetchPanelExtras } from "@/services/dashboard/fetchPanelExtras";
import { todayBaku } from "@/shared/utils/todayBaku";
import { panelRanges } from "../utils/panelRanges";
import { panelView } from "../utils/panelView";
import { useMonthStats } from "./useMonthStats";

// Dashboard-un məlumatı: ayın işləri ("month-dashboard" açarı, Ayın icmalı ilə ortaq keş) + əlavə sorğu ("panel-extras")
export function usePanel() {
  const today = todayBaku();
  const r = panelRanges(today);
  const month = useData("month-dashboard", () => fetchMonth(r.y, r.m), [r.y, r.m]);
  const extras = useData("panel-extras", () => fetchPanelExtras(today, r.from30, r.monthStart, r.prevStart, r.prevTo), [today]);
  const stats = useMonthStats(month, r.day);
  const view = useMemo(() => (extras && month ? panelView(extras, today, stats.total) : null), [extras, month, today, stats.total]);
  return view;
}
