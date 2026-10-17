import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ListChecks, Paperclip, Plus, Trash2 } from "lucide-react";
import { addTask, deleteTask, toggleTask } from "@/actions/tasks";
import { ConfirmButton } from "@/components/ConfirmButton";
import { DatePicker, formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeForms";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { loadPlaces } from "@/components/work/WorkLogForm";
import { PlacePicker, type Place } from "@/components/work/PlacePicker";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function shift(day: string, delta: number) {
  const d = new Date(`${day}T00:00`);
  d.setDate(d.getDate() + delta);
  return iso(d);
}

async function fetchTasks(day: string) {
  const supabase = createClient();
  const [tasks, employees] = await Promise.all([
    supabase.from("tasks")
      .select("id, employee_id, reason, done, done_at, note, place_text, store_id, company_id, stores(name, code, companies(name)), companies(name), work_logs(work_files(id))")
      .eq("task_date", day).order("created_at").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url").eq("is_management", false).eq("is_active", true).order("full_name").then((r) => r.data ?? []),
  ]);
  return { tasks, employees };
}

type Task = Awaited<ReturnType<typeof fetchTasks>>["tasks"][number];

// Yer: mağaza/filial (şirkət adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer | silinib
function placeOf(t: Task) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.code} ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}

// Admin və rəhbərlik ustaya gün üçün iş təyin edir: usta, yer, səbəb. Usta öz tapşırığını "görüldü" işarələyir.
export default function TasksPage() {
  const today = iso(new Date());
  const [day, setDay] = useState(today);
  const data = useData(() => fetchTasks(day), [day]);

  // Yeni tapşırıq formu
  const [employeeId, setEmployeeId] = useState("");
  const [taskDate, setTaskDate] = useState(today);
  const [place, setPlace] = useState<Place | null>(null);
  const [reason, setReason] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [pending, setPending] = useState(false);
  useEffect(() => { loadPlaces().then(setPlaces); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) return toast.error("Ustanı seç.");
    if (!place) return toast.error("Yeri seç.");
    if (!reason.trim()) return toast.error("Səbəbi yaz.");
    setPending(true);
    const ok = await addTask({
      employee_id: Number(employeeId), task_date: taskDate,
      store_id: place.storeId, company_id: place.companyId, place_text: place.custom, reason,
    });
    setPending(false);
    if (ok) {
      // Eyni usta üçün ardıcıl tapşırıq yazmaq rahat olsun: usta və tarix qalır, yer və səbəb təmizlənir
      setPlace(null);
      setReason("");
      if (taskDate !== day) setDay(taskDate);
    }
  }

  const groups = useMemo(() => {
    if (!data) return [];
    return data.employees
      .map((e) => ({ employee: e, items: data.tasks.filter((t) => t.employee_id === e.id) }))
      .filter((g) => g.items.length > 0);
  }, [data]);
  const total = data?.tasks.length ?? 0;
  const doneCount = data?.tasks.filter((t) => t.done).length ?? 0;

  const panel = (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Yeni tapşırıq</h2>
      </div>
      <label className="block">
        <span className="label">Usta</span>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="field cursor-pointer" required>
          <option value="">Usta seç...</option>
          {(data?.employees ?? []).map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
      </label>
      <div>
        <span className="label">Tarix</span>
        <DatePicker value={taskDate} onChange={(v) => v && setTaskDate(v)} />
      </div>
      <div>
        <span className="label">Yer</span>
        <PlacePicker places={places} value={place} onChange={setPlace} />
      </div>
      <label className="block">
        <span className="label">Səbəb</span>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required className="field resize-none"
          placeholder="Məs. qaz qaçağı, detallı yuyulma" />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary w-full"><Plus size={16} /> {pending ? "..." : "Tapşırıq ver"}</button>
    </form>
  );

  return (
    <Page title="Tapşırıqlar" subtitle="Ustalara günün işi: hansı usta, harada, nə üçün">
      <WithSidePanel stack panel={panel}>
        <div className="flex h-full flex-col gap-4">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={() => setDay(shift(day, -1))} className="icon-btn" aria-label="Əvvəlki gün"><ChevronLeft size={18} /></button>
            <h2 className="min-w-44 text-center text-lg font-bold">{day === today ? "Bu gün" : formatDateAz(day)}</h2>
            <button type="button" onClick={() => setDay(shift(day, 1))} className="icon-btn" aria-label="Sonrakı gün"><ChevronRight size={18} /></button>
            {day !== today && <button type="button" onClick={() => setDay(today)} className="btn btn-soft btn-sm ml-1">Bu gün</button>}
            <span className="ml-auto rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">Tapşırıq: {total} · görülən: {doneCount}</span>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data === null ? (
              <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
            ) : groups.length === 0 ? (
              <div className="card py-14 text-center">
                <span className="icon-tile mx-auto"><ListChecks size={20} /></span>
                <p className="mt-3 font-semibold">Bu gün üçün tapşırıq yoxdur</p>
                <p className="muted text-sm">Sağdakı formdan ustaya tapşırıq ver.</p>
              </div>
            ) : (
              <div className="card !p-0">
                {groups.map(({ employee, items }) => {
                  const done = items.filter((t) => t.done).length;
                  return (
                    <section key={employee.id} className="border-b border-line last:border-b-0">
                      <header className="flex items-center gap-2.5 bg-[#f8f9fc] px-4 py-2">
                        <Avatar employee={employee} className="!h-6 !w-6 !text-[10px]" />
                        <span className="text-sm font-bold">{employee.full_name}</span>
                        <span className="muted text-xs">{items.length} tapşırıq · {done} görülən</span>
                      </header>
                      <ul>
                        {items.map((t) => (
                          <li key={t.id} className="flex items-center gap-3 px-4 py-1.5">
                            <button type="button" onClick={() => toggleTask(t.id, !t.done)} aria-pressed={t.done} title={t.done ? "Görülməyib kimi işarələ" : "Görüldü kimi işarələ"}
                              className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${t.done ? "border-ok bg-ok text-white" : "border-line text-transparent hover:border-primary"}`}>
                              <Check size={12} strokeWidth={3} />
                            </button>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm">
                                <span className={`font-semibold ${t.done ? "text-ok" : "text-primary"}`}>{placeOf(t)}</span>
                                <span className="muted"> — </span>
                                <span className={t.done ? "text-ok/80" : ""}>{t.reason}</span>
                              </span>
                              {/* Usta görüləndən sonra təmir barədə yazıbsa və fayl əlavə edibsə burada görünür */}
                              {t.note && <span className={`block truncate text-xs ${t.done ? "text-[#d97706]" : "muted"}`}><b>Təmir:</b> {t.note}</span>}
                            </span>
                            {(t.work_logs?.work_files.length ?? 0) > 0 && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted" title="Usta fayl əlavə edib (iş qeydində)"><Paperclip size={13} />{t.work_logs?.work_files.length}</span>
                            )}
                            <ConfirmButton onConfirm={() => deleteTask(t.id)} success={false} className="icon-btn icon-btn-danger !h-7 !w-7" title="Tapşırığı sil"
                              question={`"${t.reason}" tapşırığı silinəcək.`}>
                              <Trash2 size={14} />
                            </ConfirmButton>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </WithSidePanel>
    </Page>
  );
}
