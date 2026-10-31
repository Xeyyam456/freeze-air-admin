import { Briefcase, Phone } from "lucide-react";
import { experience } from "@/lib/experience";
import type { EmployeeProps } from "@/types/employees";

// Kartın alt sətri: təcrübə + zəng
export function PersonContact({ employee }: EmployeeProps) {
  const exp = experience(employee.start_date);
  return (
    <div className="flex w-full items-center justify-between gap-2 border-t border-dashed border-line pt-2.5 text-xs font-semibold">
      <span className="flex min-w-0 items-center gap-1.5" title="Təcrübə">
        <Briefcase size={14} className="shrink-0 text-primary" />
        <span className={`truncate ${exp ? "" : "muted"}`}>{exp ?? "Təcrübə yazılmayıb"}</span>
      </span>
      {employee.phone ? (
        <a href={`tel:${employee.phone}`} onClick={(e) => e.stopPropagation()} className="btn btn-soft btn-sm shrink-0" title={employee.phone}>
          <Phone size={14} /> Zəng et
        </a>
      ) : (
        <span className="muted flex shrink-0 items-center gap-1.5"><Phone size={13} /> Telefon yoxdur</span>
      )}
    </div>
  );
}
