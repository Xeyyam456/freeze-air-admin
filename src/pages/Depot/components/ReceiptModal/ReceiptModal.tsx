import { useActionState, useState } from "react";
import { PackagePlus } from "lucide-react";
import { addTool, createReceipt } from "@/services/depot";
import { ActionForm, Buttons, useOnSuccess } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { ToolPicker } from "@/components/ToolPicker";
import { toast } from "@/lib/toast";
import { DHead } from "@/pages/Depot/components/ui";
import { isPacked, parseQty, round2, TEXT, withUnit, type Kind, type Tool } from "@/pages/Depot/utils";
import { ToolFields } from "@/pages/Depot/components/ToolFields";
import { NoteRow } from "@/pages/Depot/components/NoteRow";
import { Seg } from "@/pages/Depot/components/Seg";
import { AmountInput } from "@/pages/Depot/components/AmountInput";

// Depo sənədləri (0084): Mədaxil, Silinmə aktı, Sayım, Təmirə göndər. Hamısı yazılır və təsdiqdən sonra say dəyişir
// (təmirdən başqa: təmir dərhal depodakı boş saydan çıxır, alət yenə depoya aiddir).
// Pəncərələr sadədir (istifadəçi: "gərəksiz şey istəmirəm"): başlıq, lazım olan sahələr, qeyd + 📎, düymə.

// Mədaxil: siyahıdan seçilən alətə/materiala miqdar və ya yeni ad. Təsdiqlənəndə depoya düşür.
export function ReceiptModal({ tools, initialKind, initialToolId = null, onClose }: { tools: Tool[]; initialKind: Kind; initialToolId?: number | null; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [mode, setMode] = useState<"existing" | "new">(tools.some((t) => t.kind === initialKind) ? "existing" : "new");
  const [picked, setPicked] = useState<number | null>(initialToolId);
  const [qtyText, setQtyText] = useState("1");
  const [byPack, setByPack] = useState(true);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [state, newAction, newPending] = useActionState(addTool, null);
  useOnSuccess(state, onClose, "Əlavə edildi: mədaxil təsdiq gözləyir");

  const list = tools.filter((t) => t.kind === kind);
  const tool = list.find((t) => t.id === picked) ?? null;
  const factor = isPacked(tool) && byPack ? tool.pack_size : 1;
  const amount = round2(parseQty(qtyText) * factor);

  async function submitExisting() {
    if (!tool) return toast.error(`${TEXT[kind].col} seç.`);
    if (!(amount > 0)) return toast.error("Miqdar 0-dan çox olmalıdır.");
    if (kind === "tool" && !Number.isInteger(amount)) return toast.error("Alətin sayı tam ədəd olmalıdır.");
    setPending(true);
    const res = await createReceipt(tool.id, amount, null, note.trim() || null, file);
    setPending(false);
    if (res?.error) return toast.error(res.error);
    toast.success("Mədaxil yazıldı: təsdiq gözləyir");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="receipt-title" className="!max-w-md">
      <DHead id="receipt-title" icon={PackagePlus} tone="green" title="Mədaxil" sub="Depoya gələn alət və ya material" onClose={onClose} />
      <div className="mb-4">
        <Seg label="Növ" value={kind} onChange={(k) => { setKind(k); setPicked(null); setMode(tools.some((t) => t.kind === k) ? "existing" : "new"); }}
          items={[["tool", "Alət"], ["material", "Material"]] as const} />
      </div>

      {mode === "new" ? (
        // key: növ dəyişəndə forma təzələnir
        <ActionForm key={kind} action={(fd) => { if (file) fd.set("file", file); newAction(fd); }} className="space-y-4">
          <input type="hidden" name="kind" value={kind} />
          <ToolFields kind={kind} names={list.map((t) => t.name)} />
          <NoteRow file={file} onFile={setFile} />
          {list.length > 0 && (
            <button type="button" onClick={() => setMode("existing")} className="text-[13px] font-semibold text-primary hover:underline">← Siyahıdan seç</button>
          )}
          <Buttons pending={newPending} label="Əlavə et" onCancel={onClose} />
        </ActionForm>
      ) : (
        <ActionForm action={submitExisting} className="space-y-4">
          <div>
            <span className="label">{TEXT[kind].col}</span>
            <ToolPicker items={list.map((t) => ({ id: t.id, name: t.name, hint: `depoda ${withUnit(t.available, t)}` }))} value={picked} onChange={setPicked}
              placeholder={`${TEXT[kind].col} seç...`} emptyLabel={`Hələ ${TEXT[kind].word} yoxdur`} searchLabel={`${TEXT[kind].col} axtar...`} />
            <button type="button" onClick={() => setMode("new")} className="mt-1.5 text-[13px] font-semibold text-primary hover:underline">+ Siyahıda yoxdur: yeni ad</button>
          </div>
          <AmountInput tool={tool} text={qtyText} onText={setQtyText} byPack={byPack} onByPack={setByPack} />
          <NoteRow note={note} onNote={setNote} file={file} onFile={setFile} />
          <Buttons pending={pending} label="Mədaxil yaz" onCancel={onClose} />
        </ActionForm>
      )}
    </Modal>
  );
}
