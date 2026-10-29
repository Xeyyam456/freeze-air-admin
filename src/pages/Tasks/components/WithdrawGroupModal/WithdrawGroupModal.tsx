import { useState } from "react";
import { Undo2, X } from "lucide-react";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { withdrawTask } from "@/services/tasks/tasks";
import { Modal } from "@/shared/components/Modal";
import type { WithdrawGroupModalProps } from "@/types/tasks";
import { MemberFaces } from "../MemberFaces";
import { TaskSummary } from "../TaskSummary";

// Qrup tapşırığını bütövlükdə geri al: görülməmiş bütün üzvlərdən (hər üzvün sətri ayrıca geri alınır, 0057)
export function WithdrawGroupModal({ rows, employees, onClose }: WithdrawGroupModalProps) {
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    let ok = true;
    for (const r of rows) ok = (await withdrawTask(r.id, null, true)) && ok;
    setPending(false);
    revalidate();
    if (ok) toast.success("Qrup tapşırığı geri alındı");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="withdraw-group-title" className="!max-w-md">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="withdraw-group-title" className="flex items-center gap-2 text-lg font-bold"><Undo2 size={18} className="text-primary" /> Qrup tapşırığını geri al</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <TaskSummary task={rows[0]}>
          <p className="muted mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            Ustalar:
            <MemberFaces ids={rows.map((m) => m.employee_id)} employees={employees} />
          </p>
        </TaskSummary>
        <p className="muted mt-3 text-xs">Tapşırıq silinmir: siyahıda "Geri alınıb" kimi qalır. Yalnız bir ustanı geri almaq üçün üzvlər siyahısından istifadə et.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary"><Undo2 size={16} /> {pending ? "..." : "Hamısını geri al"}</button>
        </div>
      </form>
    </Modal>
  );
}
