import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { readSheet } from "read-excel-file/browser";
import { Box, Download, Pencil, Plus, Search, TriangleAlert, Trash2, Upload, X } from "lucide-react";
import { addErrorCode, addModel, deleteErrorCode, deleteModel, importErrorCodes, renameModel, updateErrorCode } from "@/actions/errorCodes";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { ModelDropdown } from "@/components/errors/ModelDropdown";
import { toast } from "@/lib/toast";

export type Model = { id: number; name: string };
export type ErrorCode = { id: number; model_id: number; code: string; title: string; solution: string | null };

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Model seçimi (əlavə forması və redaktə pəncərəsi): öz dizaynımızda açılan siyahı
function ModelSelect({ models, value, onChange, name = "model_id" }: { models: Model[]; value: string; onChange: (v: string) => void; name?: string }) {
  return (
    <ModelDropdown name={name} value={value} onChange={onChange} options={models.map((m) => ({ value: String(m.id), label: m.name }))} />
  );
}

// Kod, açıqlama, edilecək iş (model ayrıca seçilir)
function CodeFields({ item }: { item?: ErrorCode }) {
  return (
    <>
      <Field label="Xəta kodu">
        <input name="code" defaultValue={item?.code} required autoComplete="off" placeholder="Məs. E5" className="field" />
      </Field>
      <Field label="Xəta açıqlaması">
        <textarea name="title" defaultValue={item?.title} required rows={2} className="field resize-none" placeholder="Xətanın nə demək olduğu" />
      </Field>
      <Field label="Edilecək iş">
        <textarea name="solution" defaultValue={item?.solution ?? ""} rows={4} className="field resize-none" placeholder="Usta nə etməlidir (addım-addım)" />
      </Field>
    </>
  );
}

function EditCodeModal({ item, models, onClose }: { item: ErrorCode; models: Model[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateErrorCode.bind(null, item.id), null);
  const [modelId, setModelId] = useState(String(item.model_id));
  useOnSuccess(state, onClose);
  return (
    <Modal onClose={onClose} labelledBy="edit-error-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="edit-error-title" className="text-lg font-bold">Xəta kodunu redaktə et</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <SaveConfirmForm action={action} className="space-y-4">
        <Field label="Kondisioner modeli"><ModelSelect models={models} value={modelId} onChange={setModelId} /></Field>
        <CodeFields item={item} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

// ---------- Tab 1: xəta kodu ----------

function CodeTab({ models, goModels }: { models: Model[]; goModels: () => void }) {
  const [state, action, pending] = useActionState(addErrorCode, null);
  const ref = useRef<HTMLFormElement>(null);
  const [modelId, setModelId] = useState(""); // seçilmiş model qalır: eyni model üçün ardıcıl kod yazmaq rahat olsun
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => {
    ref.current?.reset();
    setFormKey((k) => k + 1);
  }, "Xəta kodu əlavə edildi");

  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-4 text-center">
        <p className="text-sm font-semibold">Hələ model yoxdur</p>
        <p className="muted mt-1 text-xs">Xəta kodu yazmaq üçün əvvəl kondisioner modelini əlavə et.</p>
        <button type="button" onClick={goModels} className="btn btn-primary btn-sm mt-3"><Box size={14} /> Model əlavə et</button>
      </div>
    );
  }
  return (
    <ActionForm ref={ref} action={action} className="space-y-4">
      <Field label="Kondisioner modeli"><ModelSelect models={models} value={modelId} onChange={setModelId} /></Field>
      <CodeFields key={formKey} />
      <Buttons pending={pending} label="Əlavə et" />
    </ActionForm>
  );
}

// ---------- Tab 2: modellər ----------

function RenameModal({ model, onClose }: { model: Model; onClose: () => void }) {
  const [state, action, pending] = useActionState(renameModel.bind(null, model.id), null);
  useOnSuccess(state, onClose);
  return (
    <Modal onClose={onClose} labelledBy="rename-model-title" className="!max-w-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="rename-model-title" className="text-lg font-bold">Modelin adını dəyiş</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <ActionForm action={action} className="space-y-4">
        <Field label="Model adı"><input name="name" defaultValue={model.name} required autoFocus autoComplete="off" className="field" /></Field>
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </ActionForm>
    </Modal>
  );
}

function ModelsTab({ models, counts }: { models: Model[]; counts: Map<number, number> }) {
  const [state, action, pending] = useActionState(addModel, null);
  const ref = useRef<HTMLFormElement>(null);
  const [renaming, setRenaming] = useState<Model | null>(null);
  useOnSuccess(state, () => ref.current?.reset(), "Model əlavə edildi");

  return (
    <div className="space-y-4">
      {renaming && <RenameModal model={renaming} onClose={() => setRenaming(null)} />}
      <ActionForm ref={ref} action={action} className="flex gap-2">
        <input name="name" required autoComplete="off" placeholder="Model adı, məs. Daikin VRV" className="field" aria-label="Model adı" />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0"><Plus size={16} /> Əlavə et</button>
      </ActionForm>

      {models.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Hələ model yoxdur. Yuxarıdan ilk modeli əlavə et.</p>
      ) : (
        <ul className="space-y-1.5">
          {models.map((m) => (
            <li key={m.id} className="flex items-center gap-2 rounded-xl bg-bg px-3 py-2">
              <Box size={15} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.name}</span>
              <span className="muted shrink-0 text-xs">{counts.get(m.id) ?? 0} kod</span>
              <button type="button" onClick={() => setRenaming(m)} className="icon-btn !h-7 !w-7" title="Adını dəyiş" aria-label="Adını dəyiş"><Pencil size={14} /></button>
              <ConfirmButton onConfirm={() => deleteModel(m.id)} success={false} className="icon-btn icon-btn-danger !h-7 !w-7" title="Modeli sil"
                question={(counts.get(m.id) ?? 0) > 0 ? `"${m.name}" modeli və onun ${counts.get(m.id)} xəta kodu silinəcək.` : `"${m.name}" modeli silinəcək.`}>
                <Trash2 size={14} />
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Tab 3: Excel ----------

type ParsedRow = { line: number; model: string; code: string; title: string; solution: string | null; error?: string };
type ColKey = "model" | "code" | "title" | "solution";

const COLUMNS: Record<ColKey, string[]> = {
  model: ["model", "modeli", "kondisioner modeli", "kondisioner", "model series", "model_series"],
  code: ["kod", "kodu", "xeta kodu", "error kodu", "error code", "error", "code"],
  title: ["aciqlama", "xeta aciqlamasi", "error aciqlamasi", "aciqlamasi", "title", "description"],
  solution: ["edilecek is", "edilecek ish", "edilecek isler", "is", "hell", "helli", "solution", "action"],
};

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v).trim();
  return s === "" ? null : s;
};

function parseRows(data: unknown[][]): ParsedRow[] | string {
  const header = (data[0] ?? []).map((h) => norm(String(h ?? "").trim()));
  const index: Partial<Record<ColKey, number>> = {};
  for (const [key, names] of Object.entries(COLUMNS) as [ColKey, string[]][]) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) index[key] = i;
  }
  if (index.model == null || index.code == null || index.title == null) return "Birinci sətirdə \"Model\", \"Kod\" və \"Açıqlama\" sütunları olmalıdır.";

  return data.slice(1)
    .map((r, i) => {
      const get = (k: ColKey) => (index[k] != null ? cell(r[index[k]!]) : null);
      const row: ParsedRow = { line: i + 2, model: get("model") ?? "", code: get("code") ?? "", title: get("title") ?? "", solution: get("solution") };
      if (!row.model || !row.code || !row.title) row.error = "Model, kod və ya açıqlama boşdur";
      return row;
    })
    .filter((r) => r.model || r.code || r.title || r.solution);
}

// Boş şablon: düzgün başlıqlarla (nümunə sətir yoxdur ki, səhvən yüklənməsin)
async function downloadTemplate() {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const head = (value: string) => ({ value, fontWeight: "bold" as const, textColor: "#ffffff", backgroundColor: "#1f6feb", alignVertical: "center" as const, height: 24 });
  await writeXlsxFile([[head("Model"), head("Kod"), head("Açıqlama"), head("Edilecək iş")]], {
    sheet: "Xəta kodları",
    columns: [{ width: 28 }, { width: 14 }, { width: 50 }, { width: 70 }],
    stickyRowsCount: 1,
  }).toFile("xeta-kodlari-sablon.xlsx");
}

function ExcelTab() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    setRows([]);
    if (!file) return;
    try {
      const result = parseRows(await readSheet(file));
      if (typeof result === "string") toast.error(result);
      else setRows(result);
    } catch {
      toast.error("Fayl oxunmadı. .xlsx formatında Excel faylı seçin.");
    }
  }

  const valid = rows.filter((r) => !r.error);
  const invalid = rows.length - valid.length;
  const newModels = new Set(valid.map((r) => r.model.toLowerCase())).size;

  function upload() {
    startTransition(async () => {
      const res = await importErrorCodes(valid.map(({ model, code, title, solution }) => ({ model, code, title, solution })));
      if (res.error) return void toast.error(res.error);
      toast.success(`${res.added} yeni əlavə olundu${res.updated ? `, ${res.updated} yeniləndi` : ""}${res.models ? `, ${res.models} yeni model yarandı` : ""}`);
      setRows([]);
    });
  }

  return (
    <div className="space-y-3">
      <p className="muted text-xs">
        Sütunlar: <b>Model</b>, <b>Kod</b>, <b>Açıqlama</b>, <b>Edilecək iş</b>. Siyahıda olmayan model avtomatik yaranır. Eyni model və kodla xəta varsa, yenilənir.
      </p>
      <button type="button" onClick={() => void downloadTemplate()} className="btn btn-soft btn-sm w-full"><Download size={14} /> Şablonu yüklə</button>

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-4 py-4 text-center hover:border-primary hover:bg-primary-soft/40">
        <Upload size={20} className="text-primary" />
        <span className="text-sm font-semibold">.xlsx faylını seç</span>
        <input type="file" accept=".xlsx" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
      </label>

      {rows.length > 0 && (
        <>
          <p className="text-sm font-medium">
            {valid.length} düzgün sətir, {newModels} model
            {invalid > 0 && <span className="text-danger"> · {invalid} səhvli (yüklənməyəcək)</span>}
          </p>
          <div className="table-wrap max-h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table>
              <thead><tr><th>Sətir</th><th>Model</th><th>Kod</th><th>Vəziyyət</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={r.error ? "bg-danger-soft" : ""}>
                    <td>{r.line}</td>
                    <td>{r.model}</td>
                    <td>{r.code}</td>
                    <td className={r.error ? "font-medium text-danger" : "text-ok"}>{r.error ?? "Hazırdır"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={upload} disabled={pending || valid.length === 0} className="btn btn-primary w-full">
            {pending ? "Yüklənir..." : `${valid.length} xətanı yüklə`}
          </button>
        </>
      )}
    </div>
  );
}

// ---------- Sağ panel ----------

export function ErrorCodePanel({ models, codes }: { models: Model[]; codes: ErrorCode[] }) {
  // Model yoxdursa əvvəl "Modellər" açılır: ilk addım modeli əlavə etməkdir
  const [tab, setTab] = useState<"code" | "models" | "excel">(models.length === 0 ? "models" : "code");
  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of codes) m.set(c.model_id, (m.get(c.model_id) ?? 0) + 1);
    return m;
  }, [codes]);

  const tabs = [["models", "Modellər"], ["code", "Xəta kodu"], ["excel", "Excel"]] as const;
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Əlavə et</h2>
      </div>
      <div className="flex gap-1 rounded-xl bg-bg p-1" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${tab === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === "models" && <ModelsTab models={models} counts={counts} />}
      {tab === "code" && <CodeTab models={models} goModels={() => setTab("models")} />}
      {tab === "excel" && <ExcelTab />}
    </div>
  );
}

// ---------- Siyahı ----------

export function ErrorCodeList({ codes, models }: { codes: ErrorCode[]; models: Model[] }) {
  const [query, setQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [editing, setEditing] = useState<ErrorCode | null>(null);
  const names = useMemo(() => new Map(models.map((m) => [m.id, m.name])), [models]);
  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of codes) m.set(c.model_id, (m.get(c.model_id) ?? 0) + 1);
    return m;
  }, [codes]);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return codes.filter((c) => {
      if (modelFilter && String(c.model_id) !== modelFilter) return false;
      const hay = norm(`${names.get(c.model_id)} ${c.code} ${c.title} ${c.solution}`);
      return words.every((w) => hay.includes(w));
    });
  }, [codes, query, modelFilter, names]);

  return (
    <div className="flex h-full flex-col gap-4">
      {editing && <EditCodeModal item={editing} models={models} onClose={() => setEditing(null)} />}

      <div className="flex shrink-0 gap-3">
        <div className="search min-w-0 flex-1">
          <Search size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kod, açıqlama və ya edilecək işlə axtar..." aria-label="Xəta kodu axtarışı" />
        </div>
        <div className="w-64 shrink-0">
          <ModelDropdown all value={modelFilter} onChange={setModelFilter} className="!h-14 !rounded-[14px]"
            options={[{ value: "", label: "Bütün modellər", hint: `${codes.length} kod` }, ...models.map((m) => ({ value: String(m.id), label: m.name, hint: `${counts.get(m.id) ?? 0} kod` }))]} />
        </div>
      </div>

      {codes.length === 0 ? (
        <div className="card py-14 text-center">
          <span className="icon-tile mx-auto"><TriangleAlert size={20} /></span>
          <p className="mt-3 font-semibold">Hələ xəta kodu yoxdur</p>
          <p className="muted text-sm">Əvvəl sağdan model əlavə et, sonra modeli seçib xəta kodu yaz.</p>
        </div>
      ) : (
        <div className="card min-h-0 flex-1 overflow-y-auto !p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-[1] bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <tr>
                <th className="w-44 px-4 py-3">Model</th>
                <th className="w-24 px-4 py-3">Kod</th>
                <th className="px-4 py-3">Açıqlama</th>
                <th className="px-4 py-3">Edilecək iş</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setEditing(c)} className="cursor-pointer border-t border-line align-top transition-colors hover:bg-primary-soft/40">
                  <td className="px-4 py-3 text-[13px] font-semibold">{names.get(c.model_id) ?? "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-lg bg-danger-soft px-2 py-1 text-xs font-extrabold text-danger">{c.code}</span></td>
                  <td className="px-4 py-3 text-[13px]"><span className="line-clamp-2">{c.title}</span></td>
                  <td className="px-4 py-3 text-[13px]"><span className="muted line-clamp-2 whitespace-pre-line">{c.solution ?? "—"}</span></td>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <span className="flex justify-end gap-0.5">
                      <button type="button" onClick={() => setEditing(c)} className="icon-btn" title="Redaktə et" aria-label="Redaktə et"><Pencil size={15} /></button>
                      <ConfirmButton onConfirm={() => deleteErrorCode(c.id)} success={false} className="icon-btn icon-btn-danger" title="Sil"
                        question={`"${c.code}" xəta kodu silinəcək.`}>
                        <Trash2 size={15} />
                      </ConfirmButton>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="muted border-t border-line py-8 text-center text-sm">Heç nə tapılmadı.</p>}
        </div>
      )}
    </div>
  );
}
