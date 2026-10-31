import { Plus } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { PlacePicker } from "@/components/work/PlacePicker";
import type { TaskFormProps } from "@/types/tasks";
import { useTaskForm } from "../../hooks/useTaskForm";
import { TeamPicker } from "../TeamPicker";

// Yan panel: "Yeni tapşırıq" (kimə, tarix, yer, səbəb)
export function TaskForm({ data, day, today, onDay }: TaskFormProps) {
  const f = useTaskForm(day, today, onDay);
  return (
    <form onSubmit={f.submit} className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Yeni tapşırıq</h2>
      </div>
      <div>
        <span className="label">Kimə (bir usta və ya qrup)</span>
        {/* Tarix baxılan günlə eynidirsə, ustanın həmin gün neçə tapşırığı olduğu görünür (işi bərabər bölmək üçün) */}
        <TeamPicker value={f.employeeIds} onChange={f.setEmployeeIds} employees={data?.employees ?? []} crews={data?.crews ?? []}
          hint={(id) => {
            if (f.taskDate !== day || !data) return null;
            const n = data.tasks.filter((t) => t.employee_id === id && !t.cancelled_at).length;
            return n ? `${n} tapşırıq` : null;
          }} />
      </div>
      <div>
        <span className="label">Tarix</span>
        <DatePicker value={f.taskDate} min={today} required onChange={(v) => v && f.setTaskDate(v)} />
      </div>
      <div>
        <span className="label">Yer</span>
        <PlacePicker places={f.places} value={f.place} onChange={f.setPlace} />
      </div>
      <label className="block">
        <span className="label">Səbəb</span>
        <textarea value={f.reason} onChange={(e) => f.setReason(e.target.value)} rows={3} required className="field resize-none"
          placeholder="Məs. qaz qaçağı, detallı yuyulma" />
      </label>
      <button type="submit" disabled={f.pending} className="btn btn-primary w-full"><Plus size={16} /> {f.pending ? "..." : "Tapşırıq ver"}</button>
    </form>
  );
}
