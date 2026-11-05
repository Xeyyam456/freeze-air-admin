import { Link } from "react-router";
import type { KpiProps } from "@/types/dashboard";
import { AvatarStack } from "../AvatarStack";
import { DashCard } from "../DashCard";
import s from "./KpiCards.module.css";

// Bu gün işdə olan ustalar (gəlib, hələ getməyib) + avatarlar
export function KpiDuty({ v, d }: KpiProps) {
  const masters = d?.masters.length ?? 0;
  return (
    <DashCard>
      <div className={s.value}><b>{v.onDuty.length}</b><span className={s.of}>/ {masters}</span></div>
      <p className={s.label}>Hazırda işdə</p>
      <Link to="/davamiyyet" className={s.duty}>
        <span className={s.dutyText}>{v.onDuty.length ? "İşdə olanlar" : v.arrived ? "Hamı günü bitirib" : "Bu gün hələ gələn yoxdur"}</span>
        {v.onDuty.length > 0 && <AvatarStack people={v.onDuty} />}
      </Link>
    </DashCard>
  );
}
