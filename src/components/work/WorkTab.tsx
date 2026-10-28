
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, FileText, Home, MapPin, Pencil, Plus, Trash2, Video, X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { DatePicker, formatDateAz } from "@/components/DatePicker";
import { Modal } from "@/shared/components/Modal";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { fetchFileCounts, type FileCount } from "@/lib/jobs";
import { FileBadges } from "./FileBadges";
import { WorkLogForm } from "./WorkLogForm";
import { timeOf, WorkLogModal } from "./WorkLogModal";

type WorkFile = { id: number; kind: string; path: string; url?: string };
type WorkLog = {
  id: number;
  work_date: string;
  description: string;
  employee_id: number;
  store_id: number | null;
  company_id: number | null;
  place_text: string | null;
  stores: { code: string; name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
  work_files: WorkFile[];
  created_at: string;
  groupFiles?: FileCount; // qrup işi: yoldaşın qeydinə yüklənmiş fayllar (bu qeyddə yoxdur)
};

// Yerli tarix "YYYY-MM-DD"; offset gün qədər irəli/geri (dünən: -1)
function dayIso(offset = 0, from?: string) {
  const d = from ? new Date(`${from}T12:00:00`) : new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchLogs(employeeId: number, day: string): Promise<WorkLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("work_logs")
    .select("id, work_date, created_at, description, employee_id, store_id, company_id, place_text, stores(code, name, companies(name)), companies(name), work_files(id, kind, path)")
    .eq("employee_id", employeeId)
    .eq("work_date", day)
    .order("id", { ascending: false });

  const list = (data ?? []) as WorkLog[];
  // Qapalı storage: fayllara 1 saatlıq imzalı link
  const paths = list.flatMap((l) => l.work_files.map((f) => f.path));
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("work").createSignedUrls(paths, 3600);
    const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    list.forEach((l) => l.work_files.forEach((f) => { f.url = urlByPath.get(f.path) ?? undefined; }));
  }
  // Qrup işi: fayl başqa üzvün qeydinə yüklənibsə, burada nişan kimi göstərilir (klik → iş pəncərəsi)
  const all = await fetchFileCounts(list.map((l) => l.id));
  for (const l of list) {
    const a = all.get(l.id);
    if (!a) continue;
    const own = (k: string) => l.work_files.filter((x) => x.kind === k).length;
    const rest = { act: Math.max(0, a.act - own("act")), photo: Math.max(0, a.photo - own("photo")), video: Math.max(0, a.video - own("video")) };
    if (rest.act + rest.photo + rest.video > 0) l.groupFiles = rest;
  }
  return list;
}

function placeLabel(log: WorkLog) {
  if (log.place_text) return log.place_text;
  if (log.stores) return `${log.stores.companies?.name ?? ""} · ${log.stores.code} ${log.stores.name}`;
  return log.companies?.name ?? "Yer silinib";
}

export function WorkTab({ employeeId, employeeName, admin }: { employeeId: number; employeeName: string; admin: boolean }) {
  // Standart olaraq bu günün işləri; dünən və daha əvvəlki günləri seçmək olur
  const [day, setDay] = useState(() => dayIso());
  const [logs, setLogs] = useState<WorkLog[] | null>(null);
  const [myEmployeeId, setMyEmployeeId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<WorkLog | null>(null);
  const [playing, setPlaying] = useState<string | null>(null); // açılmış videonun linki (pəncərədə oynayır)
  const [openLog, setOpenLog] = useState<number | null>(null); // qrupun faylları: iş pəncərəsi

  // İş dəyişəndə həm bu siyahı, həm də kartdakı "bu gün" sayı yenilənir
  const load = useCallback(async () => {
    setLogs(await fetchLogs(employeeId, day));
    revalidate();
  }, [employeeId, day]);

  useEffect(() => {
    let cancelled = false;
    fetchLogs(employeeId, day).then((list) => {
      if (!cancelled) setLogs(list);
    });
    return () => {
      cancelled = true; // gün tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [employeeId, day]);

  const today = dayIso();
  const yesterday = dayIso(-1);

  function changeDay(value: string) {
    if (!value || value > today) return;
    setLogs(null); // yeni gün yüklənənə qədər "Yüklənir..."
    setDay(value);
  }

  const chip = (active: boolean) =>
    `h-9 rounded-lg px-3 text-[13px] font-semibold transition-colors ${active ? "bg-primary text-white" : "bg-bg text-ink hover:bg-primary-soft"}`;

  useEffect(() => {
    createClient().rpc("my_employee_id").then(({ data }) => setMyEmployeeId(data ?? null));
  }, []);

  // Yeni işi yalnız usta özü üçün açır; admin iş açmır, yalnız görür və silir. İşi yalnız ustanın özü redaktə edir (bazada da: 0088)
  const canAdd = myEmployeeId === employeeId;
  const isMine = (log: WorkLog) => myEmployeeId === log.employee_id;
  const canDelete = (log: WorkLog) => admin || isMine(log);

  async function remove(log: WorkLog) {
    const supabase = createClient();
    // Əvvəl iş qeydi silinir, sonra fayllar (silinmə alınmasa akt/şəkillər itməsin). Baza qaydası bloklasa xəta göstərilir:
    // RLS silməyə icazə verməyəndə xəta yox, 0 sətir qaytarır, ona görə silinən sətir yoxlanır.
    const { data: gone, error } = await supabase.from("work_logs").delete().eq("id", log.id).select("id");
    if (error) throw new Error(error.message);
    if (!gone?.length) throw new Error("İş silinmədi: icazə yoxdur.");
    if (log.work_files.length) await supabase.storage.from("work").remove(log.work_files.map((f) => f.path));
    await load();
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {openLog && <WorkLogModal key={openLog} logId={openLog} onClose={() => setOpenLog(null)} />}
      {playing && (
        <Modal onClose={() => setPlaying(null)} labelledBy="work-video-title" className="!max-w-3xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="work-video-title" className="text-lg font-bold">İşin videosu</h2>
            <button type="button" onClick={() => setPlaying(null)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          <video src={playing} controls autoPlay playsInline className="max-h-[75vh] w-full rounded-xl bg-black ring-1 ring-line" />
        </Modal>
      )}
      {adding && (
        <WorkLogForm employeeId={employeeId} employeeName={employeeName} onClose={() => setAdding(false)} onSaved={load} />
      )}
      {editing && (
        <WorkLogForm
          employeeId={employeeId}
          employeeName={employeeName}
          existing={{
            id: editing.id,
            work_date: editing.work_date,
            description: editing.description,
            place: {
              key: "current", storeId: editing.store_id, companyId: editing.company_id, custom: editing.place_text,
              group: "", label: placeLabel(editing), sub: editing.place_text ? "Siyahıda olmayan yer" : "", search: "",
            },
            files: editing.work_files,
          }}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => changeDay(today)} className={chip(day === today)}>Bu gün</button>
        <button type="button" onClick={() => changeDay(yesterday)} className={chip(day === yesterday)}>Dünən</button>
        <div className="flex flex-1 items-center gap-1">
          <button type="button" onClick={() => changeDay(dayIso(-1, day))} className="icon-btn !h-9 !w-9" aria-label="Əvvəlki gün">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <DatePicker value={day} onChange={changeDay} max={today} small />
          </div>
          <button type="button" onClick={() => changeDay(dayIso(1, day))} disabled={day >= today}
            className="icon-btn !h-9 !w-9 disabled:opacity-30" aria-label="Növbəti gün">
            <ChevronRight size={18} />
          </button>
        </div>
        {canAdd && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-primary btn-sm !h-9">
            <Plus size={14} /> Yeni iş
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {logs === null ? (
          <p className="muted py-6 text-center text-sm">Yüklənir...</p>
        ) : logs.length === 0 ? (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-line">
            <p className="muted text-sm">{day === today ? "Bu gün" : day === yesterday ? "Dünən" : `${formatDateAz(day)} tarixində`} iş qeydi yoxdur.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => {
              const act = log.work_files.find((f) => f.kind === "act");
              const photos = log.work_files.filter((f) => f.kind === "photo");
              const videos = log.work_files.filter((f) => f.kind === "video");
              return (
                <li key={log.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-primary">
                        {log.place_text ? <Home size={13} className="shrink-0" /> : <MapPin size={13} className="shrink-0" />} {placeLabel(log)}
                      </p>
                      <p className="muted mt-0.5 flex items-center gap-1 text-[11px]"><Clock size={11} /> Əlavə edilib: {timeOf(log.created_at)}</p>
                    </div>
                    {canDelete(log) && (
                      <div className="flex shrink-0 items-center gap-0.5">
                      {isMine(log) && (
                        <button type="button" onClick={() => setEditing(log)} className="icon-btn !h-7 !w-7" title="Redaktə et" aria-label="İşi redaktə et">
                          <Pencil size={14} />
                        </button>
                      )}
                      <ConfirmButton
                        onConfirm={() => remove(log)}
                        className="icon-btn icon-btn-danger !h-7 !w-7 shrink-0"
                        title="İşi sil"
                        question="İş qeydi, aktı və şəkilləri silinəcək. Bu əməliyyatı geri qaytarmaq olmur."
                      >
                        <Trash2 size={14} />
                      </ConfirmButton>
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[13px]">{log.description}</p>
                  {log.groupFiles && (
                    <button type="button" onClick={() => setOpenLog(log.id)} title="Qrup yoldaşının əlavə etdiyi fayllar: bax"
                      className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-violet-50/60 px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-50">
                      Qrupun faylları <FileBadges files={log.groupFiles} />
                    </button>
                  )}

                  {(act || photos.length > 0 || videos.length > 0) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {act?.url && (
                        <a href={act.url} target="_blank" rel="noopener noreferrer"
                          className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold hover:border-primary">
                          <FileText size={16} className="text-primary" /> Akt
                        </a>
                      )}
                      {photos.map((p) => p.url && (
                        <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" title="Şəkli böyüt">
                          <img src={p.url} alt="İşin şəkli" className="h-14 w-14 rounded-lg border border-line object-cover hover:border-primary" />
                        </a>
                      ))}
                      {videos.map((v) => v.url && (
                        <button key={v.id} type="button" onClick={() => setPlaying(v.url!)}
                          className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold hover:border-primary">
                          <Video size={16} className="text-primary" /> Video
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
