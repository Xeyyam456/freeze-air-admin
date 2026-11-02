import { IconButton } from "@/shared/components/IconButton";
import { useState } from "react";
import { Undo2, X } from "lucide-react";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { withdrawTaskGroup } from "@/services/tasks/tasks";
import { Modal } from "@/shared/components/Modal";
import type { WithdrawGroupModalProps } from "@/types/tasks";
import { MemberFaces } from "../MemberFaces";
import { TaskSummary } from "../TaskSummary";
import { Button } from "@/shared/components/Button";

// Qrup tapşırığını bütövlükdə geri al: görülməmiş bütün üzvlərdən, bir əməliyyatla (0100; hər üzvün sətri geri alınmış qalır)
export function WithdrawGroupModal({ rows, employees, onClose }: WithdrawGroupModalProps) {
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const ok = await withdrawTaskGroup(rows.map((r) => r.id));
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
          <IconButton onClick={onClose} aria-label="Bağla"><X size={18} /></IconButton>
        </div>
        <TaskSummary task={rows[0]}>
          <p className="muted mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            Ustalar:
            <MemberFaces ids={rows.map((m) => m.employee_id)} employees={employees} />
          </p>
        </TaskSummary>
        <p className="muted mt-3 text-xs">Tapşırıq silinmir: siyahıda "Geri alınıb" kimi qalır. Yalnız bir ustanı geri almaq üçün üzvlər siyahısından istifadə et.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose} variant="soft">Ləğv et</Button>
          <Button type="submit" disabled={pending}><Undo2 size={16} /> {pending ? "..." : "Hamısını geri al"}</Button>
        </div>
      </form>
    </Modal>
  );
}
