import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, ListChecks, Lock, MapPin, Paperclip, Play, Plus, Store, Undo2, UserPlus, Users, X } from "lucide-react";
import { addTask, addTaskMember, withdrawTask } from "@/actions/tasks";
import { DatePicker, formatDateAz } from "@/components/DatePicker";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/employees/EmployeeForms";
import { EmployeeSelect } from "@/components/employees/EmployeeSelect";
import { workerTypeLabel } from "@/components/employees/EmployeeForms";
import { TeamPicker } from "@/components/work/TeamPicker";
import { listCrews } from "@/actions/crews";
import { Page } from "@/components/Page";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { WithSidePanel } from "@/components/SidePanel";
import { loadPlaces } from "@/components/work/WorkLogForm";
import { PlacePicker, type Place } from "@/components/work/PlacePicker";
import { revalidate } from "@/lib/revalidate";
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
  const [tasks, employees, crews] = await Promise.all([
    supabase.from("tasks")
      .select("id, employee_id, group_id, work_log_id, reason, done, done_at, note, place_text, store_id, company_id, cancelled_at, reassigned_to, stores(name, code, companies(name)), companies(name), work_logs(work_files(id, kind))")
      .eq("task_date", day).order("created_at").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url, specialty, worker_type").eq("is_management", false).eq("is_active", true).order("full_name")
      // Seçimdə ixtisasın önündə növ: "Köməkçi · Kondisioner ustası"
      .then((r) => (r.data ?? []).map((e) => ({ ...e, specialty: [workerTypeLabel(e.worker_type), e.specialty].filter(Boolean).join(" · ") }))),
    listCrews(),
  ]);
  // Geri alınıb başqasına verilənlər: yeni tapşırıq kimdədir ("Geri alınıb → Ad")
  const nextIds = tasks.flatMap((t) => (t.reassigned_to ? [t.reassigned_to] : []));
  const nextName = new Map<number, string>();
  if (nextIds.length) {
    const { data } = await supabase.from("tasks").select("id, employees(full_name)").in("id", nextIds);
    for (const n of data ?? []) if (n.employees) nextName.set(n.id, n.employees.full_name);
  }
  return { tasks: tasks.map((t) => ({ ...t, nextName: t.reassigned_to ? nextName.get(t.reassigned_to) : undefined })), employees, crews };
}

type Task = Awaited<ReturnType<typeof fetchTasks>>["tasks"][number];
type Employee = Awaited<ReturnType<typeof fetchTasks>>["employees"][number];

// Yer: mağaza/filial (şirkət adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer | silinib
function placeOf(t: Task) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.code} ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}

// Geri almaq: istəyə görə başqa ustaya verilir (eyni yer və səbəblə yeni tapşırıq). Köhnəsi siyahıda "Geri alınıb" kimi qalır.
function WithdrawModal({ task, employees, onClose }: { task: Task; employees: Employee[]; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [pending, setPending] = useState(false);
  const current = employees.find((e) => e.id === task.employee_id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const ok = await withdrawTask(task.id, to ? Number(to) : null);
    setPending(false);
    if (ok) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="withdraw-title" className="!max-w-md">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="withdraw-title" className="flex items-center gap-2 text-lg font-bold"><Undo2 size={18} className="text-primary" /> Tapşırığı geri al</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <div className="rounded-xl bg-bg px-4 py-3 text-sm">
          <p className="font-semibold text-primary">{placeOf(task)}</p>
          <p className="mt-0.5">{task.reason}</p>
          <p className="muted mt-1.5 text-xs">Usta: <b className="text-ink">{current?.full_name ?? "—"}</b></p>
        </div>
        <div className="mt-4">
          <span className="label">Başqa ustaya ver (istəyə görə)</span>
          <EmployeeSelect value={to ? Number(to) : null} onChange={(id) => setTo(id ? String(id) : "")}
            employees={employees.filter((e) => e.id !== task.employee_id)} emptyLabel="Heç kimə, sadəcə geri al" />
        </div>
        <p className="muted mt-2 text-xs">Tapşırıq silinmir: siyahıda "Geri alınıb" kimi qalır.{task.group_id && " Yeni usta qrupa qoşulur."}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            <Undo2 size={16} /> {pending ? "..." : to ? "Geri al və ver" : "Geri al"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Qrup tapşırığını bütövlükdə geri al: görülməmiş bütün üzvlərdən (hər üzvün sətri ayrıca geri alınır, 0057)
function WithdrawGroupModal({ rows, employees, onClose }: { rows: Task[]; employees: Employee[]; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const t = rows[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    let ok = true;
    for (const r of rows) ok = (await withdrawTask(r.id, null, true)) && ok;
    setPending(false);
    revalidate();
    if (ok) toast.success("Qrup tapşırığı geri alındı");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="withdraw-group-title" className="!max-w-md">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="withdraw-group-title" className="flex items-center gap-2 text-lg font-bold"><Undo2 size={18} className="text-primary" /> Qrup tapşırığını geri al</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <div className="rounded-xl bg-bg px-4 py-3 text-sm">
          <p className="font-semibold text-primary">{placeOf(t)}</p>
          <p className="mt-0.5">{t.reason}</p>
          <p className="muted mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            Ustalar:
            {rows.map((m) => employees.find((e) => e.id === m.employee_id)).filter((e) => !!e).map((e) => (
              <span key={e.id} className="flex items-center gap-1 font-semibold text-ink"><Avatar employee={e} className="!h-4 !w-4 !text-[7px] !shadow-none" />{e.full_name}</span>
            ))}
          </p>
        </div>
        <p className="muted mt-3 text-xs">Tapşırıq silinmir: siyahıda "Geri alınıb" kimi qalır. Yalnız bir ustanı geri almaq üçün üzvlər siyahısından istifadə et.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary"><Undo2 size={16} /> {pending ? "..." : "Hamısını geri al"}</button>
        </div>
      </form>
    </Modal>
  );
}

// Qrupa usta əlavə et (0073): geri alınan üzvün yerinə və ya əlavə; tək tapşırıq qrupa çevrilir
function AddMemberModal({ task, members, employees, onClose }: { task: Task; members: number[]; employees: Employee[]; onClose: () => void }) {
  const [who, setWho] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!who) return toast.error("Ustanı seç.");
    setPending(true);
    const ok = await addTaskMember(task.id, who);
    setPending(false);
    if (ok) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="add-member-title" className="!max-w-md">
      <form onSubmit={submit}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="add-member-title" className="flex items-center gap-2 text-lg font-bold"><UserPlus size={18} className="text-primary" /> Qrupa usta əlavə et</h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>
        <div className="rounded-xl bg-bg px-4 py-3 text-sm">
          <p className="font-semibold text-primary">{placeOf(task)}</p>
          <p className="mt-0.5">{task.reason}</p>
          <p className="muted mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            {members.length > 1 ? "Qrupda:" : "Usta:"}
            {members.map((id) => employees.find((e) => e.id === id)).filter((e) => !!e).map((e) => (
              <span key={e.id} className="flex items-center gap-1 font-semibold text-ink"><Avatar employee={e} className="!h-4 !w-4 !text-[7px] !shadow-none" />{e.full_name}</span>
            ))}
          </p>
        </div>
        <div className="mt-4">
          <span className="label">Əlavə olunan usta</span>
          <EmployeeSelect value={who} onChange={setWho} employees={employees.filter((e) => !members.includes(e.id))} />
        </div>
        <p className="muted mt-2 text-xs">Eyni yer və səbəblə. Biri «görüldü» basanda hamı üçün görülür.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
          <button type="submit" disabled={pending} className="btn btn-primary"><UserPlus size={16} /> {pending ? "..." : "Əlavə et"}</button>
        </div>
      </form>
    </Modal>
  );
}

// İşdə video var (0089): admin tapşırığı açmadan görsün
function VideoBadge({ className = "mt-1" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-1.5 py-px text-[11px] font-bold text-violet-700 ${className}`} title="Usta video əlavə edib">
      <Play size={9} fill="currentColor" /> Video
    </span>
  );
}

// Admin və rəhbərlik ustaya gün üçün iş təyin edir (usta, yer, səbəb), lazım olsa geri alır (başqa ustaya verir).
// "Görüldü" işarəsini yalnız usta qoyur (usta panelində): burada qutu yalnız vəziyyəti göstərir. Silmək yoxdur (0057).
export default function TasksPage() {
  const today = iso(new Date());
  const [day, setDay] = useState(today);
  const data = useData(() => fetchTasks(day), [day]);
  // Keçmiş gün bağlıdır (bazada da: 0070): geri almaq olmur, yalnız baxış
  const past = day < today;

  // Yeni tapşırıq formu
  const [employeeIds, setEmployeeIds] = useState<number[]>([]); // bir neçə = qrup tapşırığı
  const [taskDate, setTaskDate] = useState(today);
  const [place, setPlace] = useState<Place | null>(null);
  const [reason, setReason] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [pending, setPending] = useState(false);
  const [openLog, setOpenLog] = useState<number | null>(null); // görülmüş tapşırığın iş qeydi: şəkillər, akt, təmir qeydi
  const [withdrawing, setWithdrawing] = useState<Task | null>(null);
  const [withdrawingGroup, setWithdrawingGroup] = useState<Task[] | null>(null); // qrup tapşırığı bütövlükdə
  const [adding, setAdding] = useState<{ task: Task; members: number[] } | null>(null); // qrupa usta əlavə et
  useEffect(() => { loadPlaces().then(setPlaces); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeIds.length) return toast.error("Ustanı seç.");
    if (!place) return toast.error("Yeri seç.");
    if (!reason.trim()) return toast.error("Səbəbi yaz.");
    if (taskDate < today) return toast.error("Keçmiş günə tapşırıq verilmir.");
    setPending(true);
    const ok = await addTask({
      employee_ids: employeeIds, task_date: taskDate,
      store_id: place.storeId, company_id: place.companyId, place_text: place.custom, reason,
    });
    setPending(false);
    if (ok) {
      // Eyni usta (qrup) üçün ardıcıl tapşırıq yazmaq rahat olsun: usta və tarix qalır, yer və səbəb təmizlənir
      setPlace(null);
      setReason("");
      if (taskDate !== day) setDay(taskDate);
    }
  }

  const groups = useMemo(() => {
    if (!data) return [];
    return data.employees
      .map((e) => ({ employee: e, items: data.tasks.filter((t) => t.employee_id === e.id && !t.group_id) }))
      .filter((g) => g.items.length > 0);
  }, [data]);
  // Qrup tapşırıqları (0071): bir group_id = bir tapşırıq; üzvlər birlikdə göstərilir (geri alınan üzv üstüxətli qalır)
  const teams = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of data?.tasks ?? []) if (t.group_id) map.set(t.group_id, [...(map.get(t.group_id) ?? []), t]);
    return [...map].map(([id, rows]) => ({ id, rows, live: rows.filter((t) => !t.cancelled_at) }));
  }, [data]);
  // Eyni üzvlərdən ibarət qruplar bir seçimdir (Xəyyam + Fərhad: 5 iş)
  const crewsView = useMemo(() => {
    const map = new Map<string, typeof teams>();
    for (const g of teams) {
      const ids = [...new Set((g.live.length ? g.live : g.rows).map((r) => r.employee_id))].sort((x, y) => x - y);
      const key = ids.join("-");
      map.set(key, [...(map.get(key) ?? []), g]);
    }
    return [...map].map(([key, items]) => ({ key, items, ids: key.split("-").map(Number) }));
  }, [teams]);
  const [openCrew, setOpenCrew] = useState<string | null>(null); // hamısı bağlı başlayır
  const crewLabel = (ids: number[]) => ids.map((id) => data?.employees.find((e) => e.id === id)?.full_name.split(" ").slice(-1)[0] ?? "—").join(" + ");
  // Saylar: qrup bir tapşırıq sayılır; geri alınanlar saya düşmür (siyahıda tarixçə kimi qalır)
  const single = data?.tasks.filter((t) => !t.group_id && !t.cancelled_at) ?? [];
  const liveTeams = teams.filter((g) => g.live.length > 0);
  const total = single.length + liveTeams.length;
  const doneCount = single.filter((t) => t.done).length + liveTeams.filter((g) => g.live.every((t) => t.done)).length;

  const panel = (
    <form onSubmit={submit} className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9"><Plus size={18} /></span>
        <h2 className="card-title">Yeni tapşırıq</h2>
      </div>
      <div>
        <span className="label">Kimə (bir usta və ya qrup)</span>
        {/* Tarix baxılan günlə eynidirsə, ustanın həmin gün neçə tapşırığı olduğu görünür (işi bərabər bölmək üçün) */}
        <TeamPicker value={employeeIds} onChange={setEmployeeIds} employees={data?.employees ?? []} crews={data?.crews ?? []}
          hint={(id) => {
            if (taskDate !== day || !data) return null;
            const n = data.tasks.filter((t) => t.employee_id === id && !t.cancelled_at).length;
            return n ? `${n} tapşırıq` : null;
          }} />
      </div>
      <div>
        <span className="label">Tarix</span>
        <DatePicker value={taskDate} min={today} required onChange={(v) => v && setTaskDate(v)} />
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
      {adding && data && <AddMemberModal key={adding.task.id} task={adding.task} members={adding.members} employees={data.employees} onClose={() => setAdding(null)} />}
      {openLog && <WorkLogModal logId={openLog} onClose={() => setOpenLog(null)} />}
      {withdrawingGroup && data && <WithdrawGroupModal key={withdrawingGroup[0].id} rows={withdrawingGroup} employees={data.employees} onClose={() => setWithdrawingGroup(null)} />}
      {withdrawing && data && <WithdrawModal key={withdrawing.id} task={withdrawing} employees={data.employees} onClose={() => setWithdrawing(null)} />}
      <WithSidePanel stack fabLabel="Yeni tapşırıq" panel={panel}>
        <div className="flex h-full flex-col gap-4">
          <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:gap-x-1.5 max-sm:gap-y-2">
            <button type="button" onClick={() => setDay(shift(day, -1))} className="icon-btn" aria-label="Əvvəlki gün"><ChevronLeft size={18} /></button>
            <h2 className="min-w-44 text-center text-lg font-bold max-sm:min-w-0 max-sm:flex-1">{day === today ? "Bu gün" : formatDateAz(day)}</h2>
            <button type="button" onClick={() => setDay(shift(day, 1))} className="icon-btn" aria-label="Sonrakı gün"><ChevronRight size={18} /></button>
            {day !== today && <button type="button" onClick={() => setDay(today)} className="btn btn-soft btn-sm ml-1 max-sm:ml-0 max-sm:w-full max-sm:justify-center">Bu gün</button>}
            {past && <span className="muted ml-auto flex items-center gap-1.5 text-xs font-semibold" title="Keçmiş günün tapşırığı dəyişdirilmir"><Lock size={13} /> Yalnız baxış</span>}
            <span className={`${past ? "" : "ml-auto "}rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary max-sm:w-full max-sm:text-center max-sm:text-[13px]`}>Tapşırıq: {total} · görülən: {doneCount}</span>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data === null ? (
              <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
            ) : groups.length === 0 && teams.length === 0 ? (
              <div className="card py-14 text-center">
                <span className="icon-tile mx-auto"><ListChecks size={20} /></span>
                <p className="mt-3 font-semibold">Bu gün üçün tapşırıq yoxdur</p>
                <p className="muted text-sm">Sağdakı formdan ustaya tapşırıq ver.</p>
              </div>
            ) : (
              <>
              {/* Qrup tapşırıqları (0071): eyni üzvlərdən ibarət qruplar; qrupun üstünə basmayınca tapşırıqları açılmır */}
              {crewsView.length > 0 && (
                <section className="card overflow-hidden !p-0">
                  <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <Users size={16} className="text-primary" /> Qrup tapşırıqları
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{liveTeams.length}</span>
                    </h3>
                    <span className="muted text-xs font-normal max-sm:hidden">biri «görüldü» basanda hamı üçün görülür</span>
                  </header>
                  <ul className="divide-y divide-line">
                    {crewsView.map((crew) => {
                      const crewOpen = openCrew === crew.key;
                      const liveItems = crew.items.filter((g) => g.live.length > 0);
                      const doneItems = liveItems.filter((g) => g.live.every((x) => x.done)).length;
                      const crewVideo = crew.items.some((g) => g.rows.some((x) => x.work_logs?.work_files.some((f) => f.kind === "video")));
                      return (
                        <li key={crew.key}>
                          <button type="button" onClick={() => { setOpenCrew(crewOpen ? null : crew.key); }} aria-expanded={crewOpen}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg ${crewOpen ? "bg-bg/70" : ""}`}>
                            <span className="flex shrink-0 -space-x-2">
                              {crew.ids.map((id) => data.employees.find((e) => e.id === id)).filter((e) => !!e).map((e) => (
                                <Avatar key={e.id} employee={e} className="!h-9 !w-9 !text-[10px] !shadow-none ring-2 ring-surface max-sm:!h-7 max-sm:!w-7 max-sm:!text-[9px]" />
                              ))}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold sm:truncate max-sm:leading-tight">{crewLabel(crew.ids).split(" + ").map((n, i, all) => <span key={n} className="max-sm:block">{n}{i < all.length - 1 && <span className="max-sm:hidden"> + </span>}</span>)}</span>
                              <span className="muted flex items-center gap-1.5 text-xs">{liveItems.length} tapşırıq{crewVideo && <VideoBadge className="" />}</span>
                            </span>
                            {liveItems.length > 0 && (doneItems === liveItems.length
                              ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok px-2.5 py-0.5 text-[11px] font-bold text-white"><Check size={12} strokeWidth={3} /> Hazır</span>
                              : <span className="shrink-0 rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-bold text-muted">{doneItems}/{liveItems.length} görülüb</span>)}
                            <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${crewOpen ? "rotate-180" : ""}`} />
                          </button>
                          {crewOpen && (
                            <ul className="divide-y divide-line border-t border-line">
                              {crew.items.map((g) => {
                                const t = g.live[0] ?? g.rows[0];
                                const cancelled = g.live.length === 0;
                                const done = !cancelled && g.live.every((x) => x.done);
                                const files = g.rows.reduce((n, x) => n + (x.work_logs?.work_files.length ?? 0), 0);
                                const hasVideo = g.rows.some((x) => x.work_logs?.work_files.some((f) => f.kind === "video"));
                                const PlaceIcon = t.stores ? Store : t.companies ? Building2 : MapPin;
                                const logId = g.rows.find((x) => x.work_log_id)?.work_log_id ?? null;
                                return (
                                  <li key={g.id} className={cancelled ? "opacity-60" : done ? "bg-[#f6fcf8]" : ""}>
                                    <div className="flex items-start gap-3 px-4 py-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2">
                                      <span title={cancelled ? "Geri alınıb" : done ? "Görülüb" : "Görülməyib"}
                                        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg max-sm:h-6 max-sm:w-6 max-sm:rounded-md max-sm:[&_svg]:!h-3.5 max-sm:[&_svg]:!w-3.5 ${
                                          cancelled ? "bg-bg text-muted" : done ? "bg-ok text-white" : "bg-primary-soft text-primary"}`}>
                                        {cancelled ? <Undo2 size={15} /> : done ? <Check size={16} strokeWidth={3} /> : <PlaceIcon size={15} />}
                                      </span>
                                      <span role={logId ? "button" : undefined} tabIndex={logId ? 0 : undefined} title={logId ? "İşi aç: şəkillər və təfərrüat" : undefined}
                                        onClick={logId ? () => setOpenLog(logId) : undefined}
                                        onKeyDown={logId ? (e) => e.key === "Enter" && setOpenLog(logId) : undefined}
                                        className={`min-w-0 flex-1 ${logId ? "cursor-pointer rounded-lg transition-colors hover:bg-black/[0.03]" : ""}`}>
                                        <span className={`block truncate text-sm font-bold max-sm:text-[13px] ${cancelled ? "text-muted line-through" : done ? "text-ok" : "text-ink"}`}>{placeOf(t)}</span>
                                        <span className={`muted block text-[13px] max-sm:text-xs ${cancelled ? "line-through" : ""}`}>{t.reason}</span>
                                        {t.note && <span className="mt-1.5 block rounded-lg bg-[#eef2ff] px-2.5 py-1 text-xs text-[#4338ca] max-sm:hidden"><b>Təmir:</b> {t.note}</span>}
                                      </span>
                                      {files > 0 && <>{hasVideo && <VideoBadge />}<span className="muted mt-1 inline-flex shrink-0 items-center gap-0.5 text-xs" title="Usta fayl əlavə edib (iş qeydində)"><Paperclip size={13} />{files}</span></>}
                                      {!done && !cancelled && !past && (
                                        <span className="flex shrink-0 items-center gap-0.5">
                                          <button type="button" onClick={() => setAdding({ task: t, members: g.live.map((x) => x.employee_id) })} className="icon-btn !h-8 !w-8"
                                            title="Qrupa usta əlavə et" aria-label="Qrupa usta əlavə et">
                                            <UserPlus size={15} />
                                          </button>
                                          <button type="button" onClick={() => setWithdrawingGroup(g.live)} className="icon-btn !h-8 !w-8"
                                            title="Görülməyib: geri al" aria-label="Tapşırığı geri al">
                                            <Undo2 size={15} />
                                          </button>
                                        </span>
                                      )}
                                    </div>
                                    {t.note && <div className="px-3 pb-2 sm:hidden"><span className="block rounded-lg bg-[#eef2ff] px-2.5 py-1.5 text-xs leading-snug text-[#4338ca]"><b>Təmir:</b> {t.note}</span></div>}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              {/* Tək tapşırıqlar: usta başına kart (qrup kartları ilə eyni üslub); hər tapşırıq ayrıca sətir */}
              {groups.length > 0 && (
                <section>
                  {teams.length > 0 && (
                    <h3 className="mb-2.5 flex items-center gap-2 px-1 text-sm font-bold">
                      <ListChecks size={16} className="text-primary" /> Tək tapşırıqlar
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{single.length}</span>
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {groups.map(({ employee, items }) => {
                      const live = items.filter((t) => !t.cancelled_at);
                      const done = live.filter((t) => t.done).length;
                      const allDone = live.length > 0 && done === live.length;
                      return (
                        <section key={employee.id} className={`card flex min-w-0 grow basis-[420px] flex-col overflow-hidden !p-0 ${allDone ? "!border-[#bfe8cf]" : ""}`}>
                          <header className="flex items-center gap-3 px-4 pt-4">
                            <Avatar employee={employee} className="!h-10 !w-10 !text-xs !shadow-none" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-bold">{employee.full_name}</span>
                              <span className="muted block truncate text-[11px]">{employee.specialty}</span>
                            </span>
                            {allDone
                              ? <span className="inline-flex items-center gap-1 rounded-full bg-ok px-2.5 py-0.5 text-[11px] font-bold text-white"><Check size={12} strokeWidth={3} /> Hazır</span>
                              : <span className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-bold text-muted">{done}/{live.length} görülüb</span>}
                          </header>
                          <div className="mx-4 mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
                            <div className="h-full rounded-full bg-gradient-to-r from-ok to-[#4ade80] transition-[width] duration-500"
                              style={{ width: `${live.length ? (done / live.length) * 100 : 0}%` }} />
                          </div>
                          <ul className="mt-3 flex-1 divide-y divide-line border-t border-line">
                            {items.map((t) => {
                              const cancelled = !!t.cancelled_at;
                              const files = t.work_logs?.work_files.length ?? 0;
                              const hasVideo = !!t.work_logs?.work_files.some((f) => f.kind === "video");
                              const PlaceIcon = t.stores ? Store : t.companies ? Building2 : MapPin;
                              return (
                                <li key={t.id} className={`flex flex-wrap items-start gap-3 px-4 py-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2 ${cancelled ? "opacity-60" : t.done ? "bg-[#f6fcf8]" : ""}`}>
                                  {/* Yalnız vəziyyət: "görüldü"nü usta özü işarələyir */}
                                  <span title={cancelled ? "Geri alınıb" : t.done ? "Görülüb" : "Görülməyib"}
                                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg max-sm:h-6 max-sm:w-6 max-sm:rounded-md max-sm:[&_svg]:!h-3.5 max-sm:[&_svg]:!w-3.5 ${
                                      cancelled ? "bg-bg text-muted" : t.done ? "bg-ok text-white" : "bg-primary-soft text-primary"}`}>
                                    {cancelled ? <Undo2 size={15} /> : t.done ? <Check size={16} strokeWidth={3} /> : <PlaceIcon size={15} />}
                                  </span>
                                  <span role={t.work_log_id ? "button" : undefined} tabIndex={t.work_log_id ? 0 : undefined} title={t.work_log_id ? "İşi aç: şəkillər və təfərrüat" : undefined}
                                    onClick={t.work_log_id ? () => setOpenLog(t.work_log_id) : undefined}
                                    onKeyDown={t.work_log_id ? (e) => e.key === "Enter" && setOpenLog(t.work_log_id) : undefined}
                                    className={`min-w-0 flex-1 ${t.work_log_id ? "cursor-pointer rounded-lg transition-colors hover:bg-black/[0.03]" : ""}`}>
                                    <span className={`block truncate text-sm font-bold ${cancelled ? "text-muted line-through" : t.done ? "text-ok" : "text-ink"}`}>{placeOf(t)}</span>
                                    <span className={`muted block text-[13px] max-sm:text-xs ${cancelled ? "line-through" : ""}`}>{t.reason}</span>
                                    {t.note && <span className="mt-1.5 block rounded-lg bg-[#eef2ff] px-2.5 py-1 text-xs text-[#4338ca] max-sm:hidden"><b>Təmir:</b> {t.note}</span>}
                                    {cancelled && (
                                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
                                        Geri alınıb{t.nextName && <><ArrowRight size={11} /> {t.nextName}</>}
                                      </span>
                                    )}
                                  </span>
                                  {files > 0 && (
                                    <>{hasVideo && <VideoBadge />}<span className="muted mt-1 inline-flex shrink-0 items-center gap-0.5 text-xs" title="Usta fayl əlavə edib (iş qeydində)"><Paperclip size={13} />{files}</span></>
                                  )}
                                  {!cancelled && !t.done && !past && (
                                    <span className="flex shrink-0 items-center gap-0.5">
                                      <button type="button" onClick={() => setAdding({ task: t, members: [t.employee_id] })} className="icon-btn !h-8 !w-8 max-sm:!h-7 max-sm:!w-7" title="Usta əlavə et (qrup tapşırığı olur)" aria-label="Usta əlavə et">
                                        <UserPlus size={15} />
                                      </button>
                                      <button type="button" onClick={() => setWithdrawing(t)} className="icon-btn !h-8 !w-8" title="Geri al (başqa ustaya ver)" aria-label="Tapşırığı geri al">
                                        <Undo2 size={15} />
                                      </button>
                                    </span>
                                  )}
                                  {t.note && <div className="basis-full sm:hidden"><span className="block rounded-lg bg-[#eef2ff] px-2.5 py-1.5 text-xs leading-snug text-[#4338ca]"><b>Təmir:</b> {t.note}</span></div>}
                                </li>
                              );
                            })}
                          </ul>
                        </section>
                      );
                    })}
                  </div>
                </section>
              )}
              </>
            )}
          </div>
        </div>
      </WithSidePanel>
    </Page>
  );
}
