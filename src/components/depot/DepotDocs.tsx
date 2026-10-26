import { useActionState, useState } from "react";
import { Check, Paperclip, PackagePlus, Trash2, Wrench, X } from "lucide-react";
import { addTool, createReceipt, createWriteoff, sendRepair, type WriteoffReason } from "@/actions/tools";
import { ActionForm, Buttons, Field, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { ToolPicker } from "@/components/ToolPicker";
import { toast } from "@/lib/toast";
import { DHead } from "./DepotUi";
import { fmt, isPacked, parseQty, pieceWord, REASONS, round2, TEXT, unitOf, withUnit, type Holding, type Kind, type Piece, type Tool } from "./depotUtils";

// Depo sənədləri (0084): Mədaxil, Silinmə aktı, Sayım, Təmirə göndər. Hamısı yazılır və təsdiqdən sonra say dəyişir
// (təmirdən başqa: təmir dərhal depodakı boş saydan çıxır, alət yenə depoya aiddir).
// Pəncərələr sadədir (istifadəçi: "gərəksiz şey istəmirəm"): başlıq, lazım olan sahələr, qeyd + 📎, düymə.

// Materialın necə sayıldığı: bir neçəsi birlikdə seçilir (istifadəçi: "qazı həm balon, həm kq kimi verib-alım").
// Ölçü (kq / metr / litr) daxildə saxlanılan vahiddir; Balon və ya Ədəd onunla birlikdə seçiləndə "qab" olur
// (1 balon = 11,3 kq): verəndə, alanda, mədaxildə "balon | kq" keçidi çıxır. Balon + Ədəd birlikdə: ədəd = balon sayı.
const MEASURES = [["ədəd", "Ədəd"], ["kq", "Kq"], ["metr", "Metr"], ["litr", "Litr"], ["balon", "Balon"]] as const;
const COUNTS = ["ədəd", "balon"]; // sayılan (qab ola bilir); qalanları ölçüdür (yalnız biri seçilir)

// Seçimdən baza vahidi və qab: { unit: "kq", pack: "balon" } | { unit: "metr", pack: null } | { unit: "balon", pack: null }
function measureOf(sel: string[]) {
  const base = sel.find((v) => !COUNTS.includes(v)) ?? null;
  const pack = base ? (sel.includes("balon") ? "balon" : sel.includes("ədəd") ? "ədəd" : null) : null;
  return { unit: base ?? (sel.includes("balon") ? "balon" : "ədəd"), pack };
}
const inPack = (pack: string) => (pack === "balon" ? "1 balonda" : "1 ədəddə");

// Alət / material əlavə et və redaktə et sahələri. Ad: mövcud adlar təklif olunur (təkrar ad bloklanır).
// Alət həmişə ədəddir. Redaktədə miqdar yoxdur: say yalnız Mədaxil / Silinmə aktı / Sayım ilə dəyişir.
// Yeni əlavədə miqdar = ilk mədaxil (təsdiq gözləyir); qab seçilibsə qabla yazılır (2 balon → 22,6 kq).
export function ToolFields({ t, kind, names = [] }: { t?: Tool; kind: Kind; names?: string[] }) {
  const editing = !!t;
  const material = kind === "material";
  const initial = t ? (isPacked(t) ? [t.unit, t.pack_name] : [t.unit]) : ["ədəd"];
  const [sel, setSel] = useState<string[]>(initial);
  const [packSize, setPackSize] = useState(t?.pack_size ? fmt(t.pack_size) : "");
  const [countText, setCountText] = useState("");
  const { unit, pack } = material ? measureOf(sel) : { unit: "ədəd", pack: null };
  const size = parseQty(packSize);
  const count = parseQty(countText);
  // Siyahıda olmayan köhnə vahid (məs. "rulon") itməsin: ayrıca seçim (ölçü) kimi qalır
  const extra = initial.filter((v) => !MEASURES.some(([m]) => m === v));
  const measures: readonly (readonly [string, string])[] = [...extra.map((v) => [v, v] as const), ...MEASURES];

  // Ölçülərdən yalnız biri; ən azı bir seçim qalır
  function toggle(v: string) {
    setSel((cur) => {
      if (cur.includes(v)) return cur.length > 1 ? cur.filter((x) => x !== v) : cur;
      return COUNTS.includes(v) ? [...cur, v] : [...cur.filter((x) => COUNTS.includes(x)), v];
    });
  }

  return (
    <>
      <Field label="Adı">
        <input name="name" defaultValue={t?.name} placeholder={TEXT[kind].placeholder} required list={editing ? undefined : "depot-names"} autoComplete="off" className="field" />
        {!editing && <datalist id="depot-names">{names.map((n) => <option key={n} value={n} />)}</datalist>}
      </Field>

      {material && (
        <div>
          <span className="label">Necə sayılır <span className="muted font-normal">(bir neçəsini seç)</span></span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Necə sayılır">
            {measures.map(([v, l]) => {
              const on = sel.includes(v);
              return (
                <button key={v} type="button" aria-pressed={on} onClick={() => toggle(v)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors ${on ? "bg-navy text-white" : "bg-bg text-muted hover:text-ink"}`}>
                  {on && <Check size={13} />}{l}
                </button>
              );
            })}
          </div>
          {pack && <p className="muted mt-1.5 text-xs">Verəndə, alanda və mədaxildə: {pack} və ya {unit}</p>}
          <input type="hidden" name="pack_mode" value="1" />
          <input type="hidden" name="unit" value={unit} />
          <input type="hidden" name="pack_name" value={pack ?? ""} />
        </div>
      )}
      {!material && !editing && <input type="hidden" name="unit" value="ədəd" />}

      {pack && (
        <Field label={`${inPack(pack)} neçə ${unit}`}>
          <input name="pack_size" inputMode="decimal" value={packSize} onChange={(e) => setPackSize(e.target.value)} placeholder={unit === "kq" ? "11,3" : ""} required autoComplete="off" className="field" />
        </Field>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-3">
        {!editing && (
          <Field label={pack ? `Neçə ${pack}` : material ? `Miqdar (${unit})` : "Say"}>
            <input name="quantity" inputMode="decimal" value={countText} onChange={(e) => setCountText(e.target.value)} placeholder="0" autoComplete="off" className="field" />
          </Field>
        )}
        <Field label={`Min. qalıq (${unit})`}>
          <input name="min_stock" inputMode="decimal" defaultValue={t?.min_stock != null ? fmt(t.min_stock) : ""} placeholder="istəyə görə" autoComplete="off" className="field" />
        </Field>
      </div>
      {pack && !editing && count > 0 && size > 0 && <p className="muted -mt-2 text-xs">= {fmt(round2(count * size))} {unit}</p>}

      {editing && kind === "tool" && (
        <Field label="İnventar kodu">
          <input name="inventory_code" defaultValue={t.inventory_code ?? ""} placeholder="istəyə görə" className="field" />
        </Field>
      )}
    </>
  );
}

// Qeyd + 📎 (qaimə və ya şəkil, istəyə görə) bir sətirdə
function NoteRow({ note, onNote, file, onFile, placeholder = "Qeyd (istəyə görə)", required = false }: {
  note?: string; onNote?: (v: string) => void; file: File | null; onFile: (f: File | null) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <div className="flex gap-2">
        <input name="note" value={note} onChange={onNote ? (e) => onNote(e.target.value) : undefined} required={required} placeholder={placeholder}
          autoComplete="off" className="field min-w-0 flex-1" />
        <label className={`icon-btn !h-11 !w-11 shrink-0 cursor-pointer border border-line ${file ? "!text-primary" : ""}`} title="Qaimə və ya şəkil əlavə et">
          <Paperclip size={16} />
          <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      {file && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs">
          <Paperclip size={12} className="text-muted" /><span className="min-w-0 truncate">{file.name}</span>
          <button type="button" onClick={() => onFile(null)} className="text-muted hover:text-danger" aria-label="Faylı götür"><X size={12} /></button>
        </p>
      )}
    </div>
  );
}


function Seg<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: readonly (readonly [T, string])[]; label: string }) {
  return (
    <div className="inline-flex shrink-0 gap-1 rounded-xl bg-line/60 p-1 max-sm:flex max-sm:w-full" role="tablist" aria-label={label}>
      {items.map(([v, l]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors max-sm:flex-1 ${value === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

// Miqdar + vahid: qablı materialda "balon | kq" keçidi (standart balon). Qaytarır: ölçü vahidi ilə miqdar.
function AmountInput({ tool, text, onText, byPack, onByPack, label = "Miqdar" }: {
  tool: Tool | null; text: string; onText: (v: string) => void; byPack: boolean; onByPack: (v: boolean) => void; label?: string;
}) {
  const packed = isPacked(tool);
  const n = parseQty(text);
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <input value={text} onChange={(e) => onText(e.target.value)} inputMode="decimal" required autoComplete="off" aria-label={label} className="field !w-32" />
        {packed ? (
          <Seg label="Vahid" value={byPack ? "p" : "u"} onChange={(v) => onByPack(v === "p")} items={[["p", tool.pack_name], ["u", tool.unit]] as const} />
        ) : (
          <span className="muted text-sm">{tool ? unitOf(tool) : ""}</span>
        )}
      </div>
      {packed && byPack && n > 0 && <p className="muted mt-1 text-xs">= {fmt(round2(n * tool.pack_size))} {tool.unit}</p>}
    </div>
  );
}

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

export type WriteoffSource = { kind: "depot" } | { kind: "piece"; piece: Piece } | { kind: "holding"; holding: Holding };

// Silinmə aktı: xarab, itib, oğurlanıb, sərf olunub. Mənbə: depo (boş tam hissə), parça (açıq balon) və ya ustadakı.
export function WriteoffModal({ tool, source, onClose }: { tool: Tool; source: WriteoffSource; onClose: () => void }) {
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
                  className={`h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${reason === r ? "bg-danger text-white" : "bg-bg text-muted hover:text-ink"}`}>
                  {REASONS[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Miqdar</span>
            <div className="flex items-center gap-2">
              <input value={qtyText} onChange={(e) => setQtyText(e.target.value)} inputMode="decimal" aria-invalid={over} aria-label="Miqdar" autoComplete="off"
                className={`field !w-32 ${over ? "!border-danger" : ""}`} required />
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
