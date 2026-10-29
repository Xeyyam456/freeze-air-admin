import { Avatar } from "@/components/employees/EmployeeForms";
import type { FreeEmployeesProps } from "@/types/tasks";

// Briqadasız ustalar: yeni briqada üçün kim boşdur
export function FreeEmployees({ crews, employees }: FreeEmployeesProps) {
  const inCrew = new Set(crews.flatMap((c) => c.members));
  const free = employees.filter((e) => !inCrew.has(e.id));
  if (free.length === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg px-3.5 py-2.5">
      <span className="flex -space-x-2">
        {free.slice(0, 5).map((e) => <Avatar key={e.id} employee={e} className="!h-7 !w-7 !text-[9px] !shadow-none ring-2 ring-bg" />)}
      </span>
      <p className="min-w-0 flex-1 text-xs">
        <b>Briqadasız: {free.length}</b>
        <span className="muted block truncate">{free.map((e) => e.full_name).join(", ")}</span>
      </p>
    </div>
  );
}
