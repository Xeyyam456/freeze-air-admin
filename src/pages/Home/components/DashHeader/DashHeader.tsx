import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import type { DashHeaderProps } from "@/types/dashboard";
import { MONTHS } from "../../utils/chart";

const seg = (on: boolean) => `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-white/20 text-white shadow-sm" : "text-white/60 hover:text-white"}`;
const navBtn = "grid h-9 w-9 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent";

// Başlıq zolağı: ay seçimi və rejim keçidləri (Günlük | Yığım)
export function DashHeader({ y, m, isCurrent, cumulative, onCumulative, onPrev, onNext }: DashHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4 max-sm:px-3.5 max-sm:py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-frost ring-1 ring-white/10"><Activity size={19} /></span>
        <div>
          <h2 className="text-base font-bold">Ayın icmalı</h2>
          <p className="text-xs text-white/60">Bütün ustaların gördüyü işlər</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex gap-0.5 rounded-xl bg-white/10 p-1" role="tablist" aria-label="Rejim">
          <button type="button" role="tab" aria-selected={!cumulative} onClick={() => onCumulative(false)} className={seg(!cumulative)}>Günlük</button>
          <button type="button" role="tab" aria-selected={cumulative} onClick={() => onCumulative(true)} className={seg(cumulative)}>Yığım</button>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onPrev} className={navBtn} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
          <span className="min-w-32 text-center text-sm font-bold">{MONTHS[m]} {y}</span>
          <button type="button" onClick={onNext} disabled={isCurrent} className={navBtn} aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
