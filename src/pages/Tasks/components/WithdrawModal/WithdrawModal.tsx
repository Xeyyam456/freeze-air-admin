import { useState } from "react";
import { Undo2, X } from "lucide-react";
import { EmployeeSelect } from "@/components/employees/EmployeeSelect";
import { withdrawTask } from "@/services/tasks/tasks";
import { Modal } from "@/shared/components/Modal";
import type { WithdrawModalProps } from "@/types/tasks";
import { TaskSummary } from "../TaskSummary";

// Geri almaq: istəyə görə başqa ustaya verilir (eyni yer və səbəblə yeni tapşırıq). Köhnəsi siyahıda "Geri alınıb" kimi qalır.
export function WithdrawModal({ task, employees, onClose }: WithdrawModalProps) {
  const [to, setTo] = useState("");
  const [pending, setPending] = useState(false);
  const current = employees.find((e) => e.id === task.employee_id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const ok = await withdrawTask(task.id, to ? Number(to) : null);
    setPending(false);
    if (ok) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="withdraw-title" className="!max-w-md">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="withdraw-title" className="flex items-center gap-2 text-lg font-bold"><Undo2 size={18} className="text-primary" /> Tapşırığı geri al</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <TaskSummary task={task}>
          <p className="muted mt-1.5 text-xs">Usta: <b className="text-ink">{current?.full_name ?? "—"}</b></p>
        </TaskSummary>
        <div className="mt-4">
          <span className="label">Başqa ustaya ver (istəyə görə)</span>
          <EmployeeSelect value={to ? Number(to) : null} onChange={(id) => setTo(id ? String(id) : "")}
            employees={employees.filter((e) => e.id !== task.employee_id)} emptyLabel="Heç kimə, sadəcə geri al" />
        </div>
        <p className="muted mt-2 text-xs">Tapşırıq silinmir: siyahıda "Geri alınıb" kimi qalır.{task.group_id && " Yeni usta qrupa qoşulur."}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            <Undo2 size={16} /> {pending ? "..." : to ? "Geri al və ver" : "Geri al"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
