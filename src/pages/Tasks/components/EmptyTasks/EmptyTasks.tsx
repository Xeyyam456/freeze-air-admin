import { ListChecks } from "lucide-react";

export function EmptyTasks() {
  return (
    <div className="card py-14 text-center">
      <span className="icon-tile mx-auto"><ListChecks size={20} /></span>
      <p className="mt-3 font-semibold">Bu gün üçün tapşırıq yoxdur</p>
      <p className="muted text-sm">Sağdakı formdan ustaya tapşırıq ver.</p>
    </div>
  );
}
