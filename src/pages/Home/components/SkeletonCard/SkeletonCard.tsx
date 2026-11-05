import type { SkeletonCardProps } from "@/types/dashboard";
import s from "./SkeletonCard.module.css";

// Yüklənmə yer tutucusu: real kartın formasında (göstərici / qrafik / siyahı), parıltı bütün kartlarda eyni anda keçir
export function SkeletonCard({ kind, className = "" }: SkeletonCardProps) {
  return (
    <div className={`${s.card} ${className}`} aria-hidden="true">
      {kind !== "kpi" && <i className={`${s.bone} ${s.title}`} />}
      <i className={`${s.bone} ${s.num}`} />
      <i className={`${s.bone} ${s.label}`} />
      {kind === "kpi" && <i className={`${s.bone} ${s.block}`} />}
      {kind === "chart" && <i className={`${s.bone} ${s.chart}`} />}
      {kind === "list" && [0, 1, 2, 3, 4].map((i) => <i key={i} className={`${s.bone} ${s.row}`} />)}
    </div>
  );
}
