import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { readSheet } from "read-excel-file/browser";
import { Download, Pencil, Plus, Search, TriangleAlert, Trash2, Upload, X } from "lucide-react";
import { addErrorCode, deleteErrorCode, importErrorCodes, updateErrorCode, type ErrorCodeInput } from "@/actions/errorCodes";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ActionForm, Buttons, Field, SaveConfirmForm, useOnSuccess } from "@/components/forms";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

export type ErrorCode = Tables<"ac_error_codes">;

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Model, kod, açıqlama, edilecək iş: bir formada həm yeni, həm redaktə üçün
function Fields({ item, models }: { item?: ErrorCode; models: string[] }) {
  return (
    <>
      <Field label="Kondisioner modeli">
        <input name="model_series" defaultValue={item?.model_series ?? ""} list="error-models" autoComplete="off" placeholder="Məs. Daikin FTXM25" className="field" />
        <datalist id="error-models">{models.map((m) => <option key={m} value={m} />)}</datalist>
      </Field>
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

function EditModal({ item, models, onClose }: { item: ErrorCode; models: string[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateErrorCode.bind(null, item.id), null);
  useOnSuccess(state, onClose);
  return (
    <Modal onClose={onClose} labelledBy="edit-error-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="edit-error-title" className="text-lg font-bold">Xəta kodunu redaktə et</h2>
          <p className="muted text-sm">{item.model_series ? `${item.model_series} · ` : ""}{item.code}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <SaveConfirmForm action={action} className="space-y-4">
        <Fields item={item} models={models} />
        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </SaveConfirmForm>
    </Modal>
  );
}

// ---------- Excel-dən yükləmə ----------

type ParsedRow = ErrorCodeInput & { line: number; error?: string };

const COLUMNS: Record<keyof ErrorCodeInput, string[]> = {
  model_series: ["model", "modeli", "kondisioner modeli", "kondisioner", "model series", "model_series"],
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
  const index: Partial<Record<keyof ErrorCodeInput, number>> = {};
  for (const [key, names] of Object.entries(COLUMNS) as [keyof ErrorCodeInput, string[]][]) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) index[key] = i;
  }
  if (index.code == null || index.title == null) return "Birinci sətirdə ən azı \"Kod\" və \"Açıqlama\" sütunları olmalıdır.";

  return data.slice(1)
    .map((r, i) => {
      const get = (k: keyof ErrorCodeInput) => (index[k] != null ? cell(r[index[k]!]) : null);
      const row: ParsedRow = { line: i + 2, model_series: get("model_series"), code: get("code") ?? "", title: get("title") ?? "", solution: get("solution") };
      if (!row.code || !row.title) row.error = "Kod və ya açıqlama boşdur";
      return row;
    })
    .filter((r) => r.code || r.title || r.model_series || r.solution);
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

function ImportPanel() {
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

  function upload() {
    startTransition(async () => {
      const res = await importErrorCodes(valid.map(({ model_series, code, title, solution }) => ({ model_series, code, title, solution })));
      if (res.error) return void toast.error(res.error);
      toast.success(`${res.added} yeni əlavə olundu${res.updated ? `, ${res.updated} yeniləndi` : ""}`);
      setRows([]);
    });
  }

  return (
    <div className="space-y-3">
      <p className="muted text-xs">
        Sütunlar: <b>Model</b>, <b>Kod</b>, <b>Açıqlama</b>, <b>Edilecək iş</b>. Eyni model və kodla xəta varsa, yenilənir.
      </p>
      <button type="button" onClick={() => void downloadTemplate()} className="btn btn-soft btn-sm w-full">
        <Download size={14} /> Şablonu yüklə
      </button>

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-4 py-4 text-center hover:border-primary hover:bg-primary-soft/40">
        <Upload size={20} className="text-primary" />
        <span className="text-sm font-semibold">.xlsx faylını seç</span>
        <input type="file" accept=".xlsx" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
      </label>

      {rows.length > 0 && (
        <>
          <p className="text-sm font-medium">
            {valid.length} düzgün sətir
            {invalid > 0 && <span className="text-danger"> · {invalid} səhvli (yüklənməyəcək)</span>}
          </p>
          <div className="table-wrap max-h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table>
              <thead><tr><th>Sətir</th><th>Model</th><th>Kod</th><th>Vəziyyət</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={r.error ? "bg-danger-soft" : ""}>
                    <td>{r.line}</td>
                    <td>{r.model_series}</td>
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

// ---------- Sağ panel: yeni kod və ya Excel ----------

export function AddErrorCodeCard({ models }: { models: string[] }) {
  const [tab, setTab] = useState<"new" | "excel">("new");
  const [state, action, pending] = useActionState(addErrorCode, null);
  const ref = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);
  useOnSuccess(state, () => {
    ref.current?.reset();
    setFormKey((k) => k + 1);
  }, "Xəta kodu əlavə edildi");

  const tabClass = (on: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${on ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`;

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Xəta kodu əlavə et</h2>
      </div>
      <div className="flex gap-1 rounded-xl bg-bg p-1" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "new"} onClick={() => setTab("new")} className={tabClass(tab === "new")}><Plus size={14} /> Yeni kod</button>
        <button type="button" role="tab" aria-selected={tab === "excel"} onClick={() => setTab("excel")} className={tabClass(tab === "excel")}><Upload size={14} /> Excel-dən yüklə</button>
      </div>
      {tab === "new" ? (
        <ActionForm ref={ref} action={action} className="space-y-4">
          <Fields key={formKey} models={models} />
          <Buttons pending={pending} label="Əlavə et" />
        </ActionForm>
      ) : (
        <ImportPanel />
      )}
    </div>
  );
}

// ---------- Siyahı ----------

export function ErrorCodeList({ codes, models }: { codes: ErrorCode[]; models: string[] }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ErrorCode | null>(null);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return codes.filter((c) => {
      const hay = norm(`${c.model_series} ${c.code} ${c.title} ${c.solution}`);
      return words.every((w) => hay.includes(w));
    });
  }, [codes, query]);

  return (
    <div className="flex h-full flex-col gap-4">
      {editing && <EditModal item={editing} models={models} onClose={() => setEditing(null)} />}

      <div className="search shrink-0">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Model, kod, açıqlama və ya edilecək işlə axtar..." aria-label="Xəta kodu axtarışı" />
      </div>

      {codes.length === 0 ? (
        <div className="card py-14 text-center">
          <span className="icon-tile mx-auto"><TriangleAlert size={20} /></span>
          <p className="mt-3 font-semibold">Hələ xəta kodu yoxdur</p>
          <p className="muted text-sm">Sağdakı formdan tək-tək və ya Excel faylı ilə əlavə et.</p>
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
                  <td className="px-4 py-3 text-[13px] font-semibold">{c.model_series ?? <span className="muted font-normal">Hamısı</span>}</td>
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
