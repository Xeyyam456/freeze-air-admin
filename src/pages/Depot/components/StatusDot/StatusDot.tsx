import { SOFT } from "../../constants/tones";
import type { StatusDotProps } from "@/types/depot";

// Vəziyyət: rəngli nöqtə + yazı
export function StatusDot({ tone, label }: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${SOFT[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label}
    </span>
  );
}
