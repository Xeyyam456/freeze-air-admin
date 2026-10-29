import { useState } from "react";
import { CalendarCheck, Table2 } from "lucide-react";
import type { DaysPanelProps } from "@/types/dashboard";
import { DayTable } from "../DayTable";
import { MonthChart } from "../MonthChart";

// Günlər üzrə iş sayı: qrafik və ya cədvəl
export function DaysPanel({ y, m, s, todayDay, cumulative }: DaysPanelProps) {
  const [table, setTable] = useState(false);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold"><CalendarCheck size={16} className="text-frost" /> {cumulative ? "Yığılan iş sayı" : "Günlər üzrə iş sayı"}</h3>
        <button type="button" onClick={() => setTable((t) => !t)} aria-pressed={table}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white">
          <Table2 size={14} /> {table ? "Qrafik" : "Cədvəl"}
        </button>
      </div>
      {table ? (
        s.total === 0 ? <p className="py-6 text-center text-sm text-white/60">Bu ayda iş qeydi yoxdur.</p> : <DayTable y={y} m={m} s={s} />
      ) : (
        <>
          <MonthChart y={y} m={m} series={s.counts} todayDay={todayDay} cumulative={cumulative} />
          {s.total === 0 && <p className="mt-3 text-center text-sm text-white/60">Bu ayda iş qeydi yoxdur.</p>}
        </>
      )}
    </div>
  );
}
