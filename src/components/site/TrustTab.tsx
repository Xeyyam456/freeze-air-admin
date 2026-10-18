import { useState } from "react";
import { EyeOff, HelpCircle, Hash, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteFaq, deleteStat, saveFaq, saveStat } from "@/actions/siteContent";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

type Stat = Tables<"site_stats">;
type Faq = Tables<"site_faq">;

const nextSort = (rows: { sort: number }[]) => Math.max(0, ...rows.map((r) => r.sort)) + 1;

// Sıra və "Saytda göstər": üç redaktorda eyni
function SortActive({ sort, active }: { sort: number; active: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <label className="flex items-center gap-2 text-sm font-semibold">
        Sıra <input name="sort" type="number" defaultValue={sort} className="field !h-8 !w-16 !px-2" />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input name="is_active" type="checkbox" defaultChecked={active} className="h-4 w-4 accent-[var(--color-primary)]" />
        Saytda göstər
      </label>
    </div>
  );
}

function EditorShell({ title, onClose, onSubmit, pending, children, wide = false }: {
  title: string; onClose: () => void; onSubmit: (fd: FormData) => void; pending: boolean; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <Modal onClose={onClose} labelledBy="trust-editor-title" className={wide ? "!max-w-2xl !p-6" : "!max-w-md !p-6"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="trust-editor-title" className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
        {children}
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary min-w-36">{pending ? "Gözləyin..." : "Yadda saxla"}</button>
        </div>
      </form>
    </Modal>
  );
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ---------- Rəqəmlər ----------

function StatEditor({ item, sort, onClose }: { item: Stat | null; sort: number; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  async function submit(fd: FormData) {
    if (!str(fd, "value") || !str(fd, "label")) return toast.error("Rəqəm və yazı vacibdir.");
    setPending(true);
    const err = await saveStat(item?.id ?? null, { value: str(fd, "value"), label: str(fd, "label"), sort: Number(fd.get("sort") ?? 0) || 0, is_active: fd.get("is_active") === "on" });
    setPending(false);
    if (err) return toast.error(err);
    onClose();
  }
  return (
    <EditorShell title={item ? "Rəqəmi redaktə et" : "Yeni rəqəm"} onClose={onClose} onSubmit={submit} pending={pending}>
      <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
        <Field label="Rəqəm"><input name="value" defaultValue={item?.value} maxLength={12} required placeholder="200+" className="field" /></Field>
        <Field label="Yazı"><input name="label" defaultValue={item?.label} maxLength={40} required placeholder="Mağaza və filial" className="field" /></Field>
      </div>
      <p className="muted -mt-1 text-xs">Rəqəm sayğacla artır; “200+”, “5 il”, “24/7” kimi yazmaq olar (başdakı rəqəmlər sayılır, qalanı olduğu kimi qalır).</p>
      <SortActive sort={item?.sort ?? sort} active={item?.is_active ?? true} />
    </EditorShell>
  );
}

function StatsSection() {
  const [editing, setEditing] = useState<Stat | "new" | null>(null);
  const rows = useData(async () => (await createClient().from("site_stats").select("*").order("sort").order("id")).data ?? []);
  if (!rows) return <div className="card muted">Yüklənir...</div>;
  return (
    <section className="card space-y-4">
      {editing && <StatEditor item={editing === "new" ? null : editing} sort={nextSort(rows)} onClose={() => setEditing(null)} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="icon-tile !h-9 !w-9"><Hash size={18} /></span>
          <div>
            <h2 className="card-title">Rəqəmlər zolağı</h2>
            <p className="muted text-sm">Ana səhifədə hero-nun altında. Ən azı 2 aktiv rəqəm olanda göstərilir (4-ə qədər tövsiyə olunur).</p>
          </div>
        </div>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni rəqəm</button>
      </div>
      {rows.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Hələ rəqəm yoxdur: saytda bu zolaq görünmür.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((s) => (
            <li key={s.id} className="group relative rounded-2xl border border-line bg-bg p-4">
              <p className={`font-display text-3xl font-extrabold ${s.is_active ? "text-primary" : "text-muted"}`}>{s.value}</p>
              <p className="mt-1 text-sm font-semibold">{s.label}</p>
              <p className="muted mt-2 flex items-center gap-1.5 text-[11px]">#{s.sort}{!s.is_active && <span className="inline-flex items-center gap-1 text-danger"><EyeOff size={11} /> gizlidir</span>}</p>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button type="button" onClick={() => setEditing(s)} className="icon-btn !h-7 !w-7" title="Redaktə et" aria-label="Redaktə et"><Pencil size={14} /></button>
                <ConfirmButton onConfirm={() => deleteStat(s.id)} title={`${s.value} ${s.label} silinsin`} className="icon-btn icon-btn-danger !h-7 !w-7" question="Bu rəqəm saytdan silinəcək. Müvəqqəti gizlətmək üçün redaktədə “Saytda göstər”i götür.">
                  <Trash2 size={14} />
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- Suallar ----------

function FaqEditor({ item, sort, onClose }: { item: Faq | null; sort: number; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  async function submit(fd: FormData) {
    if (!str(fd, "question") || !str(fd, "answer")) return toast.error("Sual və cavab vacibdir.");
    setPending(true);
    const err = await saveFaq(item?.id ?? null, { question: str(fd, "question"), answer: str(fd, "answer"), sort: Number(fd.get("sort") ?? 0) || 0, is_active: fd.get("is_active") === "on" });
    setPending(false);
    if (err) return toast.error(err);
    onClose();
  }
  return (
    <EditorShell title={item ? "Sualı redaktə et" : "Yeni sual"} onClose={onClose} onSubmit={submit} pending={pending} wide>
      <Field label="Sual"><input name="question" defaultValue={item?.question} maxLength={160} required className="field" /></Field>
      <Field label="Cavab"><textarea name="answer" defaultValue={item?.answer} maxLength={800} required rows={5} className="field resize-none !py-2" /></Field>
      <SortActive sort={item?.sort ?? sort} active={item?.is_active ?? true} />
    </EditorShell>
  );
}

function FaqSection() {
  const [editing, setEditing] = useState<Faq | "new" | null>(null);
  const rows = useData(async () => (await createClient().from("site_faq").select("*").order("sort").order("id")).data ?? []);
  if (!rows) return <div className="card muted">Yüklənir...</div>;
  return (
    <section className="card space-y-4">
      {editing && <FaqEditor item={editing === "new" ? null : editing} sort={nextSort(rows)} onClose={() => setEditing(null)} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="icon-tile !h-9 !w-9"><HelpCircle size={18} /></span>
          <div>
            <h2 className="card-title">Tez-tez verilən suallar</h2>
            <p className="muted text-sm">Ana səhifənin altında açılan siyahı kimi görünür və Google üçün də işarələnir. Cavabı real və dəqiq yaz.</p>
          </div>
        </div>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm"><Plus size={14} /> Yeni sual</button>
      </div>
      {rows.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Hələ sual yoxdur: saytda bu bölmə görünmür.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {rows.map((f) => (
            <li key={f.id} className="flex items-start gap-3 px-4 py-3">
              <span className="muted mt-0.5 w-6 shrink-0 text-xs font-bold">#{f.sort}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${f.is_active ? "" : "text-muted"}`}>{f.question}{!f.is_active && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-danger"><EyeOff size={11} /> gizlidir</span>}</p>
                <p className="muted mt-0.5 line-clamp-2 text-[13px]">{f.answer}</p>
              </div>
              <button type="button" onClick={() => setEditing(f)} className="icon-btn !h-7 !w-7" title="Redaktə et" aria-label="Redaktə et"><Pencil size={14} /></button>
              <ConfirmButton onConfirm={() => deleteFaq(f.id)} title="Sual silinsin" className="icon-btn icon-btn-danger !h-7 !w-7" question="Bu sual saytdan silinəcək. Müvəqqəti gizlətmək üçün redaktədə “Saytda göstər”i götür.">
                <Trash2 size={14} />
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// "Etibar və suallar": ana səhifənin rəqəmlər zolağı və FAQ bölməsi
export function TrustTab() {
  return (
    <div className="space-y-5">
      <StatsSection />
      <FaqSection />
    </div>
  );
}
