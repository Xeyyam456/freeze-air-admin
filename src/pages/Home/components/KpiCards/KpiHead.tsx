import type { KpiHeadProps } from "@/types/dashboard";
import { DeltaBadge } from "../DeltaBadge";
import s from "./KpiCards.module.css";

// Göstərici kartının yuxarısı: solda rəngli ikon plitəsi (kartın tonunda), sağda keçən dövrə nisbətən faiz
export function KpiHead({ icon: Icon, delta = null }: KpiHeadProps) {
  return (
    <div className={s.head}>
      <span className={s.tile}><Icon size={19} strokeWidth={2.1} /></span>
      <DeltaBadge value={delta} />
    </div>
  );
}
