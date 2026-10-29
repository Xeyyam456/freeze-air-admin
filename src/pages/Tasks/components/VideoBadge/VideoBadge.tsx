import { Play } from "lucide-react";
import type { VideoBadgeProps } from "@/types/tasks";

// İşdə video var (0089): admin tapşırığı açmadan görsün
export function VideoBadge({ className = "mt-1" }: VideoBadgeProps) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-1.5 py-px text-[11px] font-bold text-violet-700 ${className}`} title="Usta video əlavə edib">
      <Play size={9} fill="currentColor" /> Video
    </span>
  );
}
