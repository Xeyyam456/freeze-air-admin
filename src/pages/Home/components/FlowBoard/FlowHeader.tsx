import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FlowHeaderProps } from "@/types/dashboard";
import { longDate } from "../../utils/dateText";
import s from "./FlowBoard.module.css";

// Lövhənin başlığı: ad, gün (‹ › ilə dəyişir, gələcəyə keçmir), günün hadisə sayı
export function FlowHeader({ day, isToday, total, onShift, onToday }: FlowHeaderProps) {
  return (
    <div className={s.head}>
      <div>
        <h2>Günün axını</h2>
        <p>{total ? `${total} hadisə` : "Bu gün hələ hadisə yoxdur"}</p>
      </div>
      <div className={s.dayNav}>
        <button type="button" onClick={() => onShift(-1)} aria-label="Əvvəlki gün"><ChevronLeft size={16} /></button>
        <span>{longDate(new Date(`${day}T12:00:00`))}</span>
        <button type="button" onClick={() => onShift(1)} disabled={isToday} aria-label="Növbəti gün"><ChevronRight size={16} /></button>
        {!isToday && <button type="button" className={s.todayBtn} onClick={onToday}>Bu gün</button>}
      </div>
    </div>
  );
}
