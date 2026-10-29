import { ListChecks } from "lucide-react";
import type { SingleTasksProps } from "@/types/tasks";
import { EmployeeTaskCard } from "../EmployeeTaskCard";

// Tək tapşırıqlar: usta başına kart (qrup kartları ilə eyni üslub); hər tapşırıq ayrıca sətir
export function SingleTasks({ groups, showTitle, count, actions }: SingleTasksProps) {
  return (
    <section>
      {showTitle && (
        <h3 className="mb-2.5 flex items-center gap-2 px-1 text-sm font-bold">
          <ListChecks size={16} className="text-primary" /> Tək tapşırıqlar
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{count}</span>
        </h3>
      )}
      <div className="flex flex-wrap gap-3">
        {groups.map(({ employee, items }) => <EmployeeTaskCard key={employee.id} employee={employee} items={items} actions={actions} />)}
      </div>
    </section>
  );
}
