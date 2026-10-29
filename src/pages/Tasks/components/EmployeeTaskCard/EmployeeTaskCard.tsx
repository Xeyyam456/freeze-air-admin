import { Check } from "lucide-react";
import { Avatar } from "@/components/employees/EmployeeForms";
import type { EmployeeTaskCardProps } from "@/types/tasks";
import { SingleTaskRow } from "../SingleTaskRow";

// Ustanın kartı: şəkil, ad, ixtisas, "N/M görülüb" (və ya "Hazır"), irəliləmə zolağı, tapşırıqlar
export function EmployeeTaskCard({ employee, items, actions }: EmployeeTaskCardProps) {
  const live = items.filter((t) => !t.cancelled_at);
  const done = live.filter((t) => t.done).length;
  const allDone = live.length > 0 && done === live.length;
  return (
    <section className={`card flex min-w-0 grow basis-[420px] flex-col overflow-hidden !p-0 ${allDone ? "!border-[#bfe8cf]" : ""}`}>
      <header className="flex items-center gap-3 px-4 pt-4">
        <Avatar employee={employee} className="!h-10 !w-10 !text-xs !shadow-none" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{employee.full_name}</span>
          <span className="muted block truncate text-[11px]">{employee.specialty}</span>
        </span>
        {allDone
          ? <span className="inline-flex items-center gap-1 rounded-full bg-ok px-2.5 py-0.5 text-[11px] font-bold text-white"><Check size={12} strokeWidth={3} /> Hazır</span>
          : <span className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-bold text-muted">{done}/{live.length} görülüb</span>}
      </header>
      <div className="mx-4 mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-gradient-to-r from-ok to-[#4ade80] transition-[width] duration-500"
          style={{ width: `${live.length ? (done / live.length) * 100 : 0}%` }} />
      </div>
      <ul className="mt-3 flex-1 divide-y divide-line border-t border-line">
        {items.map((t) => <SingleTaskRow key={t.id} t={t} actions={actions} />)}
      </ul>
    </section>
  );
}
