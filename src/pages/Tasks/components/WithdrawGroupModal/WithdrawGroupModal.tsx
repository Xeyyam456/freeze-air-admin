import { IconButton } from "@/shared/components/IconButton";
import { useState } from "react";
import { Undo2, UserMinus, X } from "lucide-react";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { withdrawTask, withdrawTaskGroup } from "@/services/tasks/tasks";
import { Avatar } from "@/shared/components/Avatar";
import { Modal } from "@/shared/components/Modal";
import type { WithdrawGroupModalProps } from "@/types/tasks";
import { TaskSummary } from "../TaskSummary";
import { Button } from "@/shared/components/Button";

// Qrup tapşırığı: bir ustanı qrupdan çıxar (qrupda ən azı 2 nəfər qalanda) və ya işi bütövlükdə geri al (0100, bir əməliyyat).
// Tapşırıq silinmir: geri alınan sətirlər siyahıda "Geri alınıb" kimi qalır.
export function WithdrawGroupModal({ rows, employees, onClose }: WithdrawGroupModalProps) {
  const [pending, setPending] = useState<number | "all" | null>(null);
  const [live, setLive] = useState(rows);

  async function removeOne(id: number, name: string) {
    setPending(id);
    const ok = await withdrawTask(id, null, true);
    setPending(null);
    if (!ok) return;
    revalidate();
    toast.success(`${name} qrupdan çıxarıldı`);
    const rest = live.filter((r) => r.id !== id);
    if (rest.length) setLive(rest);
    else onClose();
  }

  async function withdrawAll(e: React.FormEvent) {
    e.preventDefault();
    setPending("all");
    const ok = await withdrawTaskGroup(live.map((r) => r.id));
    setPending(null);
    revalidate();
    if (ok) toast.success("İş geri alındı");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="withdraw-group-title" className="!max-w-md">
      <form onSubmit={withdrawAll}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="withdraw-group-title" className="flex items-center gap-2 text-lg font-bold"><Undo2 size={18} className="text-primary" /> Qrup tapşırığı</h2>
          <IconButton onClick={onClose} aria-label="Bağla"><X size={18} /></IconButton>
        </div>
        <TaskSummary task={live[0]} />
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
          {live.map((r) => {
            const emp = employees.find((x) => x.id === r.employee_id);
            const name = emp?.full_name ?? "Usta";
            return (
              <li key={r.id} className="flex items-center gap-2 px-3 py-2">
                {emp && <Avatar employee={emp} className="!h-6 !w-6 !text-[9px] !shadow-none" />}
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>
                {live.length > 1 && (
                  <Button type="button" variant="soft" size="sm" disabled={pending !== null} onClick={() => removeOne(r.id, name)}>
                    <UserMinus size={14} /> {pending === r.id ? "..." : "Qrupdan çıxar"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
        <p className="muted mt-3 text-xs">"İşi geri al" tapşırığı bütün qrupdan geri alır; ustalara bildiriş gedir.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={onClose} variant="soft">Ləğv et</Button>
          <Button type="submit" disabled={pending !== null}><Undo2 size={16} /> {pending === "all" ? "..." : "İşi geri al"}</Button>
        </div>
      </form>
    </Modal>
  );
}
