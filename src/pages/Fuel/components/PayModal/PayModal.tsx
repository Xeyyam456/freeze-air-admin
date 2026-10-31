import { useState } from "react";
import { HandCoins, X } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { toast } from "@/lib/toast";
import { Modal } from "@/shared/components/Modal";
import type { PayModalProps } from "@/types/fuel";
import { addPayment } from "../../queries/mutations";

// "Pul ver": istənilən tarix və məbləğ (məs. həftəlik bir dəfəyə); standart məbləğ = seçilmiş dövrün borcu
export function PayModal({ name, employeeId, today, suggest, onClose }: PayModalProps) {
  const [day, setDay] = useState(today);
  const [amount, setAmount] = useState(suggest > 0 ? suggest.toFixed(2) : "");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return toast.error("Məbləği yaz.");
    setPending(true);
    const ok = await addPayment(employeeId, day, Math.round(n * 100) / 100, note || null);
    setPending(false);
    if (ok) onClose();
  }
  return (
    <Modal onClose={onClose} labelledBy="pay-title" className="!max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id="pay-title" className="flex items-center gap-2 text-lg font-bold"><HandCoins size={18} className="text-primary" /> Yanacaq pulu ver</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <p className="muted -mt-2 text-sm">{name}</p>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div>
            <span className="label">Tarix</span>
            <DatePicker value={day} max={today} required onChange={(v) => v && setDay(v)} />
          </div>
          <label className="block">
            <span className="label">Məbləğ (₼)</span>
            <input autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} inputMode="decimal" placeholder="250" className="field tabular-nums" />
          </label>
        </div>
        <label className="block">
          <span className="label">Qeyd <span className="muted font-normal">(istəyə görə)</span></span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="məs. həftəlik, nağd, karta" className="field" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary"><HandCoins size={16} /> {pending ? "..." : "Verildi"}</button>
        </div>
      </form>
    </Modal>
  );
}
