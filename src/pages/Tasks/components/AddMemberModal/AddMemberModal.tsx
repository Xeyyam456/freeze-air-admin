import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { EmployeeSelect } from "@/shared/components/EmployeeSelect";
import { toast } from "@/lib/toast";
import { addTaskMember } from "@/services/tasks/tasks";
import { Modal } from "@/shared/components/Modal";
import type { AddMemberModalProps } from "@/types/tasks";
import { MemberFaces } from "../MemberFaces";
import { TaskSummary } from "../TaskSummary";

// Qrupa usta əlavə et (0073): geri alınan üzvün yerinə və ya əlavə; tək tapşırıq qrupa çevrilir
export function AddMemberModal({ task, members, employees, onClose }: AddMemberModalProps) {
  const [who, setWho] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!who) return toast.error("Ustanı seç.");
    setPending(true);
    const ok = await addTaskMember(task.id, who);
    setPending(false);
    if (ok) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="add-member-title" className="!max-w-md">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="add-member-title" className="flex items-center gap-2 text-lg font-bold"><UserPlus size={18} className="text-primary" /> Qrupa usta əlavə et</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <TaskSummary task={task}>
          <p className="muted mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            {members.length > 1 ? "Qrupda:" : "Usta:"}
            <MemberFaces ids={members} employees={employees} />
          </p>
        </TaskSummary>
        <div className="mt-4">
          <span className="label">Əlavə olunan usta</span>
          <EmployeeSelect value={who} onChange={setWho} employees={employees.filter((e) => !members.includes(e.id))} />
        </div>
        <p className="muted mt-2 text-xs">Eyni yer və səbəblə. Biri «görüldü» basanda hamı üçün görülür.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary"><UserPlus size={16} /> {pending ? "..." : "Əlavə et"}</button>
        </div>
      </form>
    </Modal>
  );
}
