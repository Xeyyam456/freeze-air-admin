import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Pencil, Plus, Save, Search, Settings2, Trash2, UsersRound, X } from "lucide-react";
import { useEscapeLayer } from "@/components/Modal";
import { toast } from "@/lib/toast";
import { deleteCrew, saveCrew, type Crew } from "@/actions/crews";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/employees/EmployeeForms";
import { EmployeeSelect, type SelectableEmployee } from "@/components/employees/EmployeeSelect";

const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın
function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Üst-üstə avatarlar (briqada üzvləri)
function Faces({ people, size = "!h-7 !w-7 !text-[9px]", ring = "ring-white" }: { people: SelectableEmployee[]; size?: string; ring?: string }) {
  return (
    <span className="flex -space-x-2">
      {people.map((p) => <Avatar key={p.id} employee={p} className={`${size} !shadow-none ring-2 ${ring}`} />)}
    </span>
  );
}

type Pos = { left: number; width: number; top?: number; bottom?: number; maxHeight: number };

// Briqadanın görünən adı: adı yoxdursa (0075) üzvlərin soyadsız adları "Xəyyam + Fərhad"
function crewLabel(c: Crew, people: SelectableEmployee[]) {
  return c.name ?? (people.map((p) => p.full_name.split(" ").slice(-1)[0]).join(" + ") || "Adsız briqada");
}

// Briqada seçimi: açılan siyahı (EmployeeSelect quruluşu: portal, yer yoxdursa yuxarı, kənara klik / Esc / sürüşmə bağlayır).
// Sətir: üzlər, ad, üzvlərin adları, ✓; altda "İdarə et" və "Yeni briqada".
function CrewSelect({ crews, peopleOf, selectedId, onPick, onManage }: {
  crews: Crew[];
  peopleOf: (c: Crew) => SelectableEmployee[];
  selectedId: number | null;
  onPick: (c: Crew | null) => void;
  onManage: (create: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(() => setOpen(false), open);
  const current = crews.find((c) => c.id === selectedId) ?? null;

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const need = Math.min(crews.length, 5) * 52 + 56;
    const below = window.innerHeight - r.bottom - 14;
    const above = r.top - 14;
    const down = below >= need || below >= above;
    setPos({ left: r.left, width: r.width, maxHeight: Math.max(150, Math.min(need, down ? below : above)),
      ...(down ? { top: r.bottom + 6 } : { bottom: window.innerHeight - r.top + 6 }) });
  }, [open, crews.length]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    const onScroll = (e: Event) => { if (!listRef.current?.contains(e.target as Node)) setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={`field flex items-center gap-2.5 text-left ${open ? "!border-primary shadow-[0_0_0_4px_var(--color-primary-soft)]" : ""}`}>
        {current ? (
          <>
            <Faces people={peopleOf(current).slice(0, 3)} size="!h-6 !w-6 !text-[8px]" />
            <span className="min-w-0 flex-1 truncate font-semibold">{crewLabel(current, peopleOf(current))}</span>
          </>
        ) : (
          <>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg text-muted"><UsersRound size={15} /></span>
            <span className="muted min-w-0 flex-1 truncate">Briqada seç... <span className="text-xs">({crews.length})</span></span>
          </>
        )}
        <ChevronDown size={15} className={`muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && pos && createPortal(
        <div ref={listRef}
          style={{ position: "fixed", left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
          className="z-[150] flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          <div role="listbox" className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {crews.map((c) => {
              const people = peopleOf(c);
              const on = c.id === selectedId;
              return (
                <button key={c.id} type="button" role="option" aria-selected={on}
                  onClick={() => { onPick(on ? null : c); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${on ? "bg-primary-soft" : "hover:bg-bg"}`}>
                  <Faces people={people.slice(0, 3)} size="!h-8 !w-8 !text-[9px]" ring={on ? "ring-primary-soft" : "ring-white"} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-bold ${on ? "text-primary" : ""}`}>{crewLabel(c, people)}</span>
                    <span className="muted block truncate text-[11px]">{people.map((p) => p.full_name).join(", ")}</span>
                  </span>
                  {on ? <Check size={15} className="shrink-0 text-primary" /> : <span className="w-[15px] shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-bg px-3 py-2 text-xs">
            <button type="button" onClick={() => { setOpen(false); onManage(false); }} className="link flex items-center gap-1"><Settings2 size={13} /> İdarə et</button>
            <button type="button" onClick={() => { setOpen(false); onManage(true); }} className="link flex items-center gap-1"><Plus size={13} /> Yeni briqada</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// Tapşırıq kimə: bir usta və ya qrup. Üstdə hazır briqadalar (kafel, bir kliklə seçilir), altda seçilənlər bir çərçivədə
// (sətir-sətir, × ilə çıxır) + "Daha bir usta". 2+ nəfər = qrup tapşırığı; uyğun briqada yoxdursa "Briqada kimi saxla".
// hint: dropdown-da ustanın yanında yazı (məs. həmin gün neçə tapşırığı var).
export function TeamPicker({ employees, crews, value, onChange, hint }: {
  employees: SelectableEmployee[];
  crews: Crew[];
  value: number[];
  onChange: (ids: number[]) => void;
  hint?: (id: number) => string | null;
}) {
  const [managing, setManaging] = useState<{ draft?: number[]; create?: boolean } | null>(null);
  const byId = new Map(employees.map((e) => [e.id, e]));
  const selected = value.map((id) => byId.get(id)).filter((e): e is SelectableEmployee => !!e);
  // Briqadanın yalnız aktiv üzvləri (usta deaktiv olubsa siyahıda yoxdur); 2-dən az qalıbsa göstərilmir
  const crewPeople = (c: Crew) => c.members.map((id) => byId.get(id)).filter((e): e is SelectableEmployee => !!e);
  const usable = crews.filter((c) => crewPeople(c).length >= 2);
  const matching = usable.find((c) => sameSet(crewPeople(c).map((p) => p.id), value));
  const add = (
    <EmployeeSelect value={null} employees={employees.filter((e) => !value.includes(e.id))} hint={hint}
      placeholder={selected.length ? "Daha bir usta əlavə et (qrup)" : "Usta seç..."}
      onChange={(id) => id && onChange([...value, id])} />
  );

  return (
    <div className="space-y-3">
      {managing && <CrewsModal employees={employees} crews={crews} draft={managing.draft ?? (managing.create ? [] : undefined)} onClose={() => setManaging(null)} />}

      {/* Hazır briqadalar: açılan siyahı (seçiləndə üzvlər aşağıdakı çərçivəyə düşür) */}
      {usable.length === 0 ? (
        <button type="button" onClick={() => setManaging({ create: true })}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-primary hover:text-primary">
          <UsersRound size={14} /> Briqada yarat <span className="font-normal">(tez-tez birlikdə işləyən ustalar)</span>
        </button>
      ) : (
        <CrewSelect crews={usable} peopleOf={crewPeople} selectedId={matching?.id ?? null}
          onPick={(c) => onChange(c ? crewPeople(c).map((p) => p.id) : [])}
          onManage={(create) => setManaging({ create })} />
      )}

      {/* Seçilənlər */}
      {selected.length === 0 ? add : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-2 bg-bg px-3 py-1.5">
            <span className="text-xs font-semibold">
              {selected.length > 1 ? <>Qrup · {selected.length} nəfər</> : "Bir usta"}
              {matching && <span className="ml-1.5 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] text-primary">{crewLabel(matching, crewPeople(matching))}</span>}
            </span>
            <button type="button" onClick={() => onChange([])} className="muted text-[11px] font-semibold hover:text-danger">Təmizlə</button>
          </div>
          <ul className="divide-y divide-line">
            {selected.map((e) => (
              <li key={e.id} className="flex items-center gap-2.5 px-3 py-2">
                <Avatar employee={e} className="!h-8 !w-8 !text-[10px] !shadow-none" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{e.full_name}</span>
                  {e.specialty && <span className="muted block truncate text-[11px]">{e.specialty}</span>}
                </span>
                <button type="button" onClick={() => onChange(value.filter((id) => id !== e.id))}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-bg hover:text-danger" aria-label={`${e.full_name} çıxar`}>
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-2">{add}</div>
          {selected.length > 1 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line bg-primary-soft/60 px-3 py-2 text-[11px] text-primary">
              <span className="flex-1">Biri «görüldü» basanda tapşırıq hamı üçün görülür.</span>
              {!matching && (
                <button type="button" onClick={() => setManaging({ draft: value })} className="flex items-center gap-1 font-bold hover:underline">
                  <Save size={12} /> Briqada kimi saxla
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Briqadaları idarə et: kartlar (redaktə, sil) + yeni/redaktə formu (ad + üzvlər, axtarışlı 2 sütunlu seçim)
function CrewsModal({ employees, crews, draft, onClose }: {
  employees: SelectableEmployee[];
  crews: Crew[];
  draft?: number[];
  onClose: () => void;
}) {
  // draft: tapşırıq formasındakı seçimdən "Briqada kimi saxla" → forma dərhal açıq gəlir
  const [edit, setEdit] = useState<{ id?: number; name: string; members: number[] } | null>(draft ? { name: "", members: draft } : null);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const byId = new Map(employees.map((e) => [e.id, e]));

  // Bir usta yalnız bir briqadada (0074): başqa briqadadakı usta → həmin briqadanın adı (redaktə olunan briqada istisna)
  const taken = new Map<number, string>();
  for (const c of crews) if (c.id !== edit?.id) for (const id of c.members) taken.set(id, crewLabel(c, c.members.map((m) => byId.get(m)).filter((e): e is SelectableEmployee => !!e)));
  const conflicts = edit ? edit.members.filter((id) => taken.has(id)) : [];

  async function save() {
    if (!edit) return;
    if (conflicts.length) {
      const names = conflicts.map((id) => `${byId.get(id)?.full_name ?? "Usta"} («${taken.get(id)}»)`).join(", ");
      return toast.error(`Usta yalnız bir briqadada ola bilər: ${names}`);
    }
    setPending(true);
    const ok = await saveCrew(edit);
    setPending(false);
    if (ok) {
      if (draft) onClose();
      else setEdit(null);
    }
  }

  const words = norm(query).split(/\s+/).filter(Boolean);
  const visible = employees.filter((e) => words.every((w) => norm(`${e.full_name} ${e.specialty ?? ""}`).includes(w)));

  return (
    <Modal onClose={onClose} labelledBy="crews-title" className="!max-w-xl overflow-hidden !p-0">
      {/* Başlıq zolağı: admin palitrası */}
      <div className="flex items-center gap-3 bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-5 text-white">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-frost"><UsersRound size={22} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="crews-title" className="text-lg font-bold">
            {edit ? (edit.id ? "Briqadanı redaktə et" : "Yeni briqada") : <>Briqadalar <span className="font-semibold text-white/50">· {crews.length}</span></>}
          </h2>
          <p className="text-xs text-white/60">Birlikdə işləyən ustalar · bir usta yalnız bir briqadada</p>
        </div>
        {!edit && (
          <button type="button" onClick={() => setEdit({ name: "", members: [] })} className="btn btn-sm shrink-0 !bg-white !text-[#0b1324] hover:!bg-frost">
            <Plus size={15} /> Yeni briqada
          </button>
        )}
        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla"><X size={18} /></button>
      </div>

      <div className="p-6">
        {edit ? (
          <div className="space-y-4">
            <label className="block">
              <span className="label">Adı <span className="muted font-normal">(istəyə görə; yazılmasa üzvlərin adları göstərilir)</span></span>
              <input autoFocus value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                placeholder="məs. Qaz briqadası" className="field" />
            </label>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="label !mb-0">Üzvlər <span className="muted font-normal">· {edit.members.length} seçilib</span></span>
                {employees.length > 6 && (
                  <label className="flex h-8 w-44 items-center gap-1.5 rounded-lg bg-bg px-2.5">
                    <Search size={13} className="muted shrink-0" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar..." aria-label="Usta axtar"
                      className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
                  </label>
                )}
              </div>
              <div className="nice-scroll grid max-h-[min(320px,42vh)] grid-cols-2 gap-2 overflow-y-auto [scrollbar-gutter:auto]">
                {visible.map((e) => {
                  const on = edit.members.includes(e.id);
                  const busy = taken.get(e.id); // başqa briqadadadır: seçilmir; seçilibsə (draft) qırmızıdır, yalnız çıxarmaq olar
                  return (
                    <button key={e.id} type="button" aria-pressed={on} disabled={!!busy && !on}
                      title={busy ? `«${busy}» briqadasındadır` : undefined}
                      onClick={() => setEdit({ ...edit, members: on ? edit.members.filter((x) => x !== e.id) : [...edit.members, e.id] })}
                      className={`relative flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                        busy && on ? "border-danger bg-danger-soft" : on ? "border-primary bg-primary-soft" : busy ? "border-line bg-bg" : "border-line hover:bg-bg"}`}>
                      <Avatar employee={e} className="!h-9 !w-9 !text-[11px] !shadow-none" />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-semibold ${busy && on ? "text-danger" : on ? "text-primary" : ""}`}>{e.full_name}</span>
                        {busy
                          ? <span className={`flex items-center gap-1 truncate text-[11px] font-semibold ${on ? "text-danger" : "text-muted"}`}><UsersRound size={11} className="shrink-0" /> {busy}</span>
                          : e.specialty && <span className="muted block truncate text-[11px]">{e.specialty}</span>}
                      </span>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        busy && on ? "bg-danger text-white" : on ? "bg-primary text-white" : "border-2 border-line text-transparent"}`}>
                        {busy && on ? <X size={12} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
                {visible.length === 0 && <p className="muted col-span-2 py-4 text-center text-sm">Usta tapılmadı</p>}
              </div>
            </div>
            {conflicts.length > 0 && (
              <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
                Qırmızı ustalar artıq başqa briqadadadır: usta yalnız bir briqadada ola bilər. Onları çıxar və ya əvvəl o briqadanı dəyiş.
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button type="button" onClick={() => (draft ? onClose() : setEdit(null))} className="btn btn-soft">Ləğv et</button>
              <button type="button" onClick={save} disabled={pending} className="btn btn-primary"><Save size={16} /> {pending ? "..." : "Yadda saxla"}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {crews.length === 0 ? (
              <div className="flex h-[min(300px,42vh)] flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 text-center">
                <span className="icon-tile mx-auto"><UsersRound size={20} /></span>
                <p className="mt-3 font-semibold">Hələ briqada yoxdur</p>
                <p className="muted text-sm">Tez-tez birlikdə işləyən ustaları (məs. usta + köməkçi) briqada kimi saxla: tapşırıq verəndə bir kliklə seçilir.</p>
                <button type="button" onClick={() => setEdit({ name: "", members: [] })} className="btn btn-primary btn-sm mt-4"><Plus size={15} /> İlk briqadanı yarat</button>
              </div>
            ) : (
              // Sabit hündürlük: briqada çoxaldıqca pəncərə uzanmır, siyahı öz içində sürüşür
              <ul className="nice-scroll h-[min(300px,42vh)] divide-y divide-line overflow-y-auto rounded-2xl border border-line [scrollbar-gutter:auto]">
                {crews.map((c) => {
                  const people = c.members.map((id) => byId.get(id)).filter((e): e is SelectableEmployee => !!e);
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-bg">
                      <Faces people={people.slice(0, 3)} size="!h-9 !w-9 !text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{crewLabel(c, people)}</p>
                        <p className="muted truncate text-xs" title={people.map((p) => p.full_name).join(", ")}>
                          {people.length ? <><b className="font-semibold text-ink">{people.length} nəfər</b> · {people.map((p) => p.full_name).join(", ")}</> : "Aktiv üzv qalmayıb"}
                        </p>
                      </div>
                      <button type="button" onClick={() => setEdit({ id: c.id, name: c.name ?? "", members: c.members })} className="icon-btn !h-8 !w-8" title="Redaktə et" aria-label="Redaktə et">
                        <Pencil size={14} />
                      </button>
                      <ConfirmButton onConfirm={async () => { await deleteCrew(c.id); }} success={false} className="icon-btn icon-btn-danger !h-8 !w-8" title="Briqadanı sil"
                        question="Briqada silinəcək. Ona verilmiş köhnə tapşırıqlar dəyişmir.">
                        <Trash2 size={14} />
                      </ConfirmButton>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Briqadasız ustalar: yeni briqada üçün kim boşdur */}
            {(() => {
              const inCrew = new Set(crews.flatMap((c) => c.members));
              const free = employees.filter((e) => !inCrew.has(e.id));
              return free.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-bg px-3.5 py-2.5">
                  <span className="flex -space-x-2">
                    {free.slice(0, 5).map((e) => <Avatar key={e.id} employee={e} className="!h-7 !w-7 !text-[9px] !shadow-none ring-2 ring-bg" />)}
                  </span>
                  <p className="min-w-0 flex-1 text-xs">
                    <b>Briqadasız: {free.length}</b>
                    <span className="muted block truncate">{free.map((e) => e.full_name).join(", ")}</span>
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </Modal>
  );
}
