import { Clock } from "lucide-react";
import type { HoursListProps } from "@/types/attendance";
import { HoursRow } from "../HoursRow";

// İşdə olduğu günlərin saatları: tam tarix, həftənin günü, gəlmə – getmə (yenisi yuxarıda)
export function HoursList({ days }: HoursListProps) {
  const worked = days?.filter((d) => d.presence && d.status === "present").reverse();

  return (
    <div className="flex min-h-0 flex-col">
      <span className="label flex items-center gap-1.5"><Clock size={14} className="text-primary" /> Gəlmə və getmə saatları</span>
      {!worked ? (
        <div className="flex-1 rounded-xl bg-bg" />
      ) : worked.length === 0 ? (
        <p className="muted grid flex-1 place-items-center rounded-xl border border-dashed border-line p-6 text-center text-sm">Bu ayda gəlmə qeydi yoxdur.</p>
      ) : (
        <ul className="max-h-[340px] flex-1 divide-y divide-line overflow-y-auto rounded-xl border border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {worked.map(({ day, presence }) => <HoursRow key={day} day={day} presence={presence!} />)}
        </ul>
      )}
    </div>
  );
}
