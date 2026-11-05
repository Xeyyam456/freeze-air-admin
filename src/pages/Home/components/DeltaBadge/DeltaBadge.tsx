import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { DeltaBadgeProps } from "@/types/dashboard";
import s from "./DeltaBadge.module.css";

// Keçən dövrə nisbətən dəyişmə: ox + faiz (rəng tək başına məna daşımır); müqayisə yoxdursa göstərilmir
export function DeltaBadge({ value }: DeltaBadgeProps) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span className={`${s.badge} ${up ? s.up : s.down}`} title="Keçən ayın eyni dövrünə nisbətən">
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}%
    </span>
  );
}
