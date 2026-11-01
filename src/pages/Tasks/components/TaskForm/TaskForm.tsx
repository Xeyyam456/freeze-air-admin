import { Label } from "@/shared/components/Label";
import { iconTileClass } from "@/shared/components/IconTile";
import { Card, CardTitle } from "@/shared/components/Card";
import { Plus } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { PlacePicker } from "@/components/work/PlacePicker";
import type { TaskFormProps } from "@/types/tasks";
import { useTaskForm } from "../../hooks/useTaskForm";
import { TeamPicker } from "../TeamPicker";
import { Button } from "@/shared/components/Button";
import { Textarea } from "@/shared/components/Textarea";

// Yan panel: "Yeni tapşırıq" (kimə, tarix, yer, səbəb)
export function TaskForm({ data, day, today, onDay }: TaskFormProps) {
  const f = useTaskForm(day, today, onDay);
  return (
    <Card onSubmit={f.submit} as="form" className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={iconTileClass("!h-9 !w-9")}><Plus size={18} /></span>
        <CardTitle >Yeni tapşırıq</CardTitle>
      </div>
      <div>
        <Label >Kimə (bir usta və ya qrup)</Label>
        {/* Tarix baxılan günlə eynidirsə, ustanın həmin gün neçə tapşırığı olduğu görünür (işi bərabər bölmək üçün) */}
        <TeamPicker value={f.employeeIds} onChange={f.setEmployeeIds} employees={data?.employees ?? []} crews={data?.crews ?? []}
          hint={(id) => {
            if (f.taskDate !== day || !data) return null;
            const n = data.tasks.filter((t) => t.employee_id === id && !t.cancelled_at).length;
            return n ? `${n} tapşırıq` : null;
          }} />
      </div>
      <div>
        <Label >Tarix</Label>
        <DatePicker value={f.taskDate} min={today} required onChange={(v) => v && f.setTaskDate(v)} />
      </div>
      <div>
        <Label >Yer</Label>
        <PlacePicker places={f.places} value={f.place} onChange={f.setPlace} />
      </div>
      <label className="block">
        <Label >Səbəb</Label>
        <Textarea value={f.reason} onChange={(e) => f.setReason(e.target.value)} rows={3} required className="resize-none"
          placeholder="Məs. qaz qaçağı, detallı yuyulma" />
      </label>
      <Button type="submit" disabled={f.pending} className="w-full"><Plus size={16} /> {f.pending ? "..." : "Tapşırıq ver"}</Button>
    </Card>
  );
}
