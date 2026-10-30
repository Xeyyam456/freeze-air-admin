import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createWriteoff } from "@/services/depot/documents";
import type { WriteoffReason, WriteoffModalProps } from "@/types/depot";
import { ActionForm, Buttons } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { toast } from "@/lib/toast";
import { DHead } from "../DHead";
import { fmt, parseQty, pieceWord, round2, unitOf, withUnit } from "../../utils/quantity";
import { REASONS } from "../../constants/requests";
import { NoteRow } from "../NoteRow";


// Silinmə aktı: xarab, itib, oğurlanıb, sərf olunub. Mənbə: depo (boş tam hissə), parça (açıq balon) və ya ustadakı.
export function WriteoffModal({ tool, source, onClose }: WriteoffModalProps) {
  const unit = unitOf(tool);
  const limit = source.kind === "piece" ? source.piece.length : source.kind === "holding" ? source.holding.quantity : tool.available;
  const [reason, setReason] = useState<WriteoffReason>(source.kind === "piece" ? "used" : source.kind === "holding" ? "lost" : "broken");
  const [qtyText, setQtyText] = useState(fmt(source.kind === "depot" ? Math.min(1, limit) : limit));
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const qty = parseQty(qtyText);
  const over = qty > limit;
  const from = source.kind === "piece" ? `${pieceWord(tool)} ${fmt(source.piece.length)} ${unit}`
    : source.kind === "holding" ? `${source.holding.employees?.full_name ?? "usta"}: ${fmt(source.holding.quantity)} ${unit}`
    : `depoda ${withUnit(tool.available, tool)}`;

  async function submit() {
    if (!(qty > 0)) return toast.error("Miqdar 0-dan çox olmalıdır.");
    if (over) return toast.error(`Cəmi ${fmt(limit)} ${unit} var.`);
    setPending(true);
    const res = await createWriteoff({
      toolId: tool.id, quantity: round2(qty), reason, note: note.trim() || null, file,
      assignmentId: source.kind === "holding" ? source.holding.id : null, pieceId: source.kind === "piece" ? source.piece.id : null,
    });
    setPending(false);
    if (res?.error) return toast.error(res.error);
    toast.success("Silinmə aktı yazıldı: təsdiq gözləyir");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="writeoff-title" className="!max-w-md">
      <DHead id="writeoff-title" icon={Trash2} tone="red" title="Silinmə aktı" sub={`${tool.name} · ${from}`} onClose={onClose} />
      {!(limit > 0) ? (
        <p className="muted py-4 text-center text-sm">Silinəcək bir şey yoxdur.</p>
      ) : (
        <ActionForm action={submit} className="space-y-4">
          <div>
            <span className="label">Səbəb</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REASONS) as WriteoffReason[]).map((r) => (
                <button key={r} type="button" aria-pressed={reason === r} onClick={() => setReason(r)}
                  className={`h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors max-sm:h-7 max-sm:px-2.5 max-sm:text-[11px] ${reason === r ? "bg-danger text-white" : "bg-bg text-muted hover:text-ink"}`}>
                  {REASONS[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Miqdar</span>
            <div className="flex items-center gap-2">
              <input value={qtyText} onChange={(e) => setQtyText(e.target.value)} inputMode="decimal" aria-invalid={over} aria-label="Miqdar" autoComplete="off"
                className={`field !w-32 max-sm:!h-8 max-sm:!w-24 max-sm:!text-xs ${over ? "!border-danger" : ""}`} required />
              <span className="muted text-sm">{unit} · ən çox {fmt(limit)}</span>
            </div>
          </div>
          <NoteRow note={note} onNote={setNote} file={file} onFile={setFile} required={reason === "other"}
            placeholder={reason === "other" ? "Nə olub? (vacib)" : "Nə olub? (istəyə görə)"} />
          <Buttons pending={pending} label="Silinmə aktını yaz" onCancel={onClose} />
        </ActionForm>
      )}
    </Modal>
  );
}
