import { useState } from "react";
import { Wrench } from "lucide-react";
import { sendRepair } from "@/services/depot";
import { ActionForm, Buttons, Field } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { toast } from "@/lib/toast";
import { DHead } from "@/pages/Depot/components/ui";
import { parseQty, withUnit, type Tool } from "@/pages/Depot/utils";

// Təmirə göndər: göndərilən say depoda boş sayılmır; qayıdanda "Düzəldi" və ya "Bərpa olunmadı" (silinmə aktı)
export function RepairModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const [qtyText, setQtyText] = useState("1");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const qty = parseQty(qtyText);

  async function submit() {
    if (!Number.isInteger(qty) || qty < 1) return toast.error("Say ən azı 1 olmalıdır.");
    if (qty > tool.available) return toast.error(`Depoda boş cəmi ${tool.available} var.`);
    setPending(true);
    const res = await sendRepair(tool.id, qty, place.trim() || null, note.trim() || null);
    setPending(false);
    if (res?.error) return toast.error(res.error);
    toast.success("Təmirə göndərildi");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="repair-title" className="!max-w-md">
      <DHead id="repair-title" icon={Wrench} tone="amber" title="Təmirə göndər" sub={`${tool.name} · depoda ${withUnit(tool.available, tool)}`} onClose={onClose} />
      {tool.available < 1 ? (
        <p className="muted py-4 text-center text-sm">Depoda boş qalmayıb.</p>
      ) : (
        <ActionForm action={submit} className="space-y-4">
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <Field label="Say">
              <input inputMode="numeric" value={qtyText} onChange={(e) => setQtyText(e.target.value)} className="field" required />
            </Field>
            <Field label="Harada">
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="istəyə görə" className="field" />
            </Field>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nasazlıq (istəyə görə)" aria-label="Nasazlıq" className="field" />
          <Buttons pending={pending} label="Təmirə göndər" onCancel={onClose} />
        </ActionForm>
      )}
    </Modal>
  );
}
